'use client';

import { useState, useEffect } from 'react';
import {
  Package, TrendingUp, DollarSign, Users, Bell, X, Trash2,
  Plus, Edit, Image as ImageIcon, Upload, CheckCircle, Clock,
  Truck, MapPin, PackageCheck, Search
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection, query, orderBy, onSnapshot, doc,
  updateDoc, deleteDoc, addDoc, serverTimestamp
} from 'firebase/firestore';
import InventoryTab from '@/components/InventoryTab';
import AnalyticsTab from '@/components/AnalyticsTab';
import { initializePollsForAllProducts } from '@/lib/init-polls';
import { CATEGORIES } from '@/data/categories';

const IMGBB_KEY = 'c609e2ff4c762257899c035c382f6503';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  createdAt: any;
  status: string;
  total: number;
  items: number;
  products: string[];
  isNew?: boolean;
}

interface ProductForm {
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  category: string;
  images: string[];
  colors: string[];
  sizes: string[];
  loyaltyPoints: number;
  stock: number;
}

const emptyForm: ProductForm = {
  name: '', price: 0, originalPrice: 0, description: '',
  category: 'Women Dresses', images: [''], colors: [''],
  sizes: [''], loyaltyPoints: 0, stock: 0,
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, newOrders: 0, totalCustomers: 0 });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'inventory' | 'analytics'>('orders');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyForm);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [firestoreProducts, setFirestoreProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [initializingPolls, setInitializingPolls] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data: Order[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      if (data.length > lastOrderCount && lastOrderCount > 0) {
        setNotifications(prev => [`New order from ${data[0].customerName}`, ...prev.slice(0, 4)]);
      }
      setLastOrderCount(data.length);
      setOrders(data);
      const revenue = data.reduce((s, o) => s + o.total, 0);
      const newO = data.filter(o => o.status === 'new').length;
      const customers = new Set(data.map(o => o.customerEmail)).size;
      setStats({ totalOrders: data.length, totalRevenue: revenue, newOrders: newO, totalCustomers: customers });
    });
    return () => unsub();
  }, [lastOrderCount]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc')),
      (snap) => setFirestoreProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'orders', id), { status });
    setSelectedOrder(null);
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    await deleteDoc(doc(db, 'orders', id));
    setSelectedOrder(null);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await deleteDoc(doc(db, 'products', id));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm(emptyForm);
    setShowProductModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || '',
      price: p.price || 0,
      originalPrice: p.originalPrice || 0,
      description: p.description || '',
      category: p.category || 'Women Dresses',
      images: p.images?.length ? p.images : [''],
      colors: p.colors?.length ? p.colors : [''],
      sizes: p.sizes?.length ? p.sizes : [''],
      loyaltyPoints: p.loyaltyPoints || 0,
      stock: p.stock || 0,
    });
    setShowProductModal(true);
  };

  const closeModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm(emptyForm);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res((reader.result as string).split(',')[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const fd = new FormData();
      fd.append('image', base64);
      fd.append('key', IMGBB_KEY);
      const resp = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd });
      const data = await resp.json();
      if (data.success) {
        const imgs = [...productForm.images];
        imgs[idx] = data.data.url;
        setProductForm(f => ({ ...f, images: imgs }));
      } else {
        alert('Upload failed');
      }
    } catch {
      alert('Upload error');
    } finally {
      setUploadingIdx(null);
      e.target.value = '';
    }
  };

  const handleSaveProduct = async () => {
    const validImages = productForm.images.filter(i => i.trim().startsWith('http'));
    if (!productForm.name || !productForm.price || validImages.length === 0) {
      alert('Fill in Name, Price and at least one image');
      return;
    }
    const payload = {
      name: productForm.name,
      price: productForm.price,
      originalPrice: productForm.originalPrice || productForm.price,
      description: productForm.description,
      category: productForm.category,
      images: validImages,
      colors: productForm.colors.filter(c => c.trim()),
      sizes: productForm.sizes.filter(s => s.trim()),
      loyaltyPoints: productForm.loyaltyPoints || 0,
      stock: productForm.stock || 0,
      inStock: productForm.stock > 0,
    };
    if (editingProduct) {
      await updateDoc(doc(db, 'products', editingProduct.id), payload);
      alert('Product updated!');
    } else {
      await addDoc(collection(db, 'products'), {
        ...payload,
        rating: 4.5, reviews: 0,
        poll: { best: 0, good: 0, average: 0, worst: 0 },
        features: [], specifications: {},
        createdAt: serverTimestamp(),
      });
      alert('Product added!');
    }
    closeModal();
  };

  const handleInitPolls = async () => {
    if (!confirm('Initialize polls for all products?')) return;
    setInitializingPolls(true);
    try {
      const result = await initializePollsForAllProducts();
      alert(`Done! Updated: ${result.updated}, Skipped: ${result.skipped}`);
    } catch {
      alert('Failed to initialize polls');
    } finally {
      setInitializingPolls(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return 'N/A';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  };

  const statusColor = (s: string) => {
    if (s === 'delivered') return 'bg-green-100 text-green-800';
    if (s === 'shipped') return 'bg-purple-100 text-purple-800';
    if (s === 'processing') return 'bg-yellow-100 text-yellow-800';
    if (s === 'new') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filteredProducts = firestoreProducts.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              <span className="text-sm text-red-500 font-medium">Live Updates</span>
            </div>
          </div>
          <div className="flex gap-4 mt-4 border-b">
            {(['orders', 'products', 'inventory', 'analytics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-4 font-semibold capitalize transition ${
                  activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((n, i) => (
              <div key={i} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <p className="text-blue-800 font-medium">{n}</p>
                </div>
                <button onClick={() => setNotifications(prev => prev.filter((_, j) => j !== i))}>
                  <X className="w-5 h-5 text-blue-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats - only show on orders tab */}
        {activeTab === 'orders' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'text-blue-500' },
            { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-green-500' },
            { label: 'New Orders', value: stats.newOrders, icon: TrendingUp, color: 'text-orange-500' },
            { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'text-purple-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
              </div>
              <Icon className={`w-10 h-10 ${color}`} />
            </div>
          ))}
        </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Order ID', 'Customer', 'Date', 'Status', 'Total', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id} className={order.status === 'new' ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id.substring(0, 8)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">₹{order.total.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedOrder(order)} className="text-primary hover:underline text-sm font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Product Management</h2>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleInitPolls}
                    disabled={initializingPolls}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    {initializingPolls ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Initializing...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" />Init Polls</>
                    )}
                  </button>
                  <button
                    onClick={openAddModal}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />Add Product
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No products yet. Click Add Product to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="relative h-48 bg-gray-100">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${
                        product.stock > 10 ? 'bg-green-100 text-green-700' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2 truncate">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary">₹{product.price?.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-gray-500">{product.loyaltyPoints || 0} pts</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && <InventoryTab />}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)}><X className="w-6 h-6 text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customerEmail}</p>
                  {selectedOrder.customerPhone && <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>}
                </div>
                {selectedOrder.shippingAddress && (
                  <div>
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="text-sm">{selectedOrder.shippingAddress}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-primary">₹{selectedOrder.total.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'accepted')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />Accept
                    </button>
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'processing')} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />Processing
                    </button>
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium flex items-center justify-center gap-2">
                      <Package className="w-4 h-4" />Shipped
                    </button>
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'nearby')} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-medium flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />Nearby
                    </button>
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'out-for-delivery')} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4" />Out for Delivery
                    </button>
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium flex items-center justify-center gap-2">
                      <PackageCheck className="w-4 h-4" />Delivered
                    </button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <button onClick={() => deleteOrder(selectedOrder.id)} className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" />Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={closeModal}><X className="w-6 h-6 text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" placeholder="Product name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                    <input type="number" value={productForm.originalPrice} onChange={e => setProductForm(f => ({ ...f, originalPrice: Number(e.target.value) }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                  {productForm.images.map((img, idx) => (
                    <div key={idx} className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      {img && img.startsWith('http') && (
                        <img src={img} alt="preview" className="w-full h-40 object-cover rounded-lg mb-3" />
                      )}
                      <label className="cursor-pointer block">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                          {uploadingIdx === idx ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading...</>
                          ) : (
                            <><Upload className="w-4 h-4" />{img.startsWith('http') ? 'Change Image' : 'Upload Image'}</>
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, idx)} className="hidden" disabled={uploadingIdx !== null} />
                      </label>
                      <input type="url" value={img} onChange={e => { const imgs = [...productForm.images]; imgs[idx] = e.target.value; setProductForm(f => ({ ...f, images: imgs })); }} className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="Or paste image URL" />
                    </div>
                  ))}
                  <button type="button" onClick={() => setProductForm(f => ({ ...f, images: [...f.images, ''] }))} className="text-primary text-sm font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" />Add Image
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                  {productForm.colors.map((c, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" value={c} onChange={e => { const arr = [...productForm.colors]; arr[idx] = e.target.value; setProductForm(f => ({ ...f, colors: arr })); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g. Red, Blue" />
                    </div>
                  ))}
                  <button type="button" onClick={() => setProductForm(f => ({ ...f, colors: [...f.colors, ''] }))} className="text-primary text-sm font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" />Add Color
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                  {productForm.sizes.map((s, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" value={s} onChange={e => { const arr = [...productForm.sizes]; arr[idx] = e.target.value; setProductForm(f => ({ ...f, sizes: arr })); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g. S, M, L" />
                    </div>
                  ))}
                  <button type="button" onClick={() => setProductForm(f => ({ ...f, sizes: [...f.sizes, ''] }))} className="text-primary text-sm font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" />Add Size
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loyalty Points</label>
                    <input type="number" value={productForm.loyaltyPoints} onChange={e => setProductForm(f => ({ ...f, loyaltyPoints: Number(e.target.value) }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input type="number" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: Number(e.target.value) }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handleSaveProduct} className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button onClick={closeModal} className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
