'use client';

import { useState, useEffect } from 'react';
import { Package, TrendingUp, DollarSign, Users, Bell, X, Trash2, Plus, Edit, Image as ImageIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  createdAt: any;
  status: 'new' | 'accepted' | 'processing' | 'shipped' | 'nearby' | 'out-for-delivery' | 'delivered';
  total: number;
  items: number;
  products: string[];
  isNew?: boolean;
}

interface ProductData {
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
  inStock: boolean;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    newOrders: 0,
    totalCustomers: 0,
  });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState<ProductData>({
    name: '',
    price: 0,
    originalPrice: 0,
    description: '',
    category: 'Women Dresses',
    images: [''],
    colors: [''],
    sizes: [''],
    loyaltyPoints: 0,
    stock: 0,
    inStock: true,
  });

  // Real-time Firebase listener
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = [];
      
      snapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        } as Order);
      });

      // Check for new orders
      if (ordersData.length > lastOrderCount && lastOrderCount > 0) {
        const newOrder = ordersData[0];
        playNotificationSound();
        setNotifications(prev => [
          `New order ${newOrder.id} from ${newOrder.customerName} - $${newOrder.total}`,
          ...prev.slice(0, 4)
        ]);
      }

      setLastOrderCount(ordersData.length);
      setOrders(ordersData);
      calculateStats(ordersData);
    });

    return () => unsubscribe();
  }, [lastOrderCount]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  const calculateStats = (ordersList: Order[]) => {
    const totalRevenue = ordersList.reduce((sum, order) => sum + order.total, 0);
    const newOrders = ordersList.filter(o => o.status === 'new').length;
    const uniqueCustomers = new Set(ordersList.map(o => o.customerEmail)).size;

    setStats({
      totalOrders: ordersList.length,
      totalRevenue,
      newOrders,
      totalCustomers: uniqueCustomers,
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setSelectedOrder(null);
      alert('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const handleAddProduct = async () => {
    try {
      // Validate form
      if (!productForm.name || !productForm.price || productForm.images[0] === '') {
        alert('Please fill in all required fields');
        return;
      }

      // Filter out empty strings from arrays
      const cleanedProduct = {
        ...productForm,
        images: productForm.images.filter(img => img.trim() !== ''),
        colors: productForm.colors.filter(c => c.trim() !== ''),
        sizes: productForm.sizes.filter(s => s.trim() !== ''),
        rating: 4.5,
        reviews: 0,
        features: [],
        specifications: {},
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'products'), cleanedProduct);
      
      alert('Product added successfully!');
      setShowAddProduct(false);
      
      // Reset form
      setProductForm({
        name: '',
        price: 0,
        originalPrice: 0,
        description: '',
        category: 'Women Dresses',
        images: [''],
        colors: [''],
        sizes: [''],
        loyaltyPoints: 0,
        stock: 0,
        inStock: true,
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const addImageField = () => {
    setProductForm({ ...productForm, images: [...productForm.images, ''] });
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...productForm.images];
    newImages[index] = value;
    setProductForm({ ...productForm, images: newImages });
  };

  const addColorField = () => {
    setProductForm({ ...productForm, colors: [...productForm.colors, ''] });
  };

  const updateColorField = (index: number, value: string) => {
    const newColors = [...productForm.colors];
    newColors[index] = value;
    setProductForm({ ...productForm, colors: newColors });
  };

  const addSizeField = () => {
    setProductForm({ ...productForm, sizes: [...productForm.sizes, ''] });
  };

  const updateSizeField = (index: number, value: string) => {
    const newSizes = [...productForm.sizes];
    newSizes[index] = value;
    setProductForm({ ...productForm, sizes: newSizes });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

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
              <div className="text-sm text-gray-600">
                🔴 Live Updates
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-2 px-4 font-semibold transition ${
                activeTab === 'orders'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-2 px-4 font-semibold transition ${
                activeTab === 'products'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Products
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-center justify-between animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-500" />
                  <p className="text-blue-800 font-medium">{notification}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">New Orders</p>
                <p className="text-3xl font-bold text-gray-800">{stats.newOrders}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalCustomers}</p>
              </div>
              <Users className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className={order.status === 'new' ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">₹{order.total.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        View Details
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Product Management</h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-semibold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Product
              </button>
            </div>
            <p className="text-gray-600">
              Add new products to your store with images, descriptions, sizes, colors, and inventory management.
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="text-lg font-semibold">{selectedOrder.id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="text-lg font-semibold">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customerEmail}</p>
                  {selectedOrder.customerPhone && (
                    <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
                  )}
                </div>

                {selectedOrder.shippingAddress && (
                  <div>
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="text-sm">{selectedOrder.shippingAddress}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="text-lg">{formatDate(selectedOrder.createdAt)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Products</p>
                  <div className="space-y-2">
                    {selectedOrder.products.map((product, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">{product}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">₹{selectedOrder.total.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'accepted')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                    >
                      ✓ Accept Order
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
                    >
                      ⏳ Processing
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium"
                    >
                      🚚 Shipped
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'nearby')}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm font-medium"
                    >
                      📍 Nearby Delivery
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'out-for-delivery')}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
                    >
                      🏃 Out for Delivery
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                    >
                      ✅ Delivered
                    </button>
                  </div>
                </div>

                {/* Delete Order */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => deleteOrder(selectedOrder.id)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Add New Product</h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Floral Summer Maxi Dress"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Product description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option>Women Dresses</option>
                    <option>Men Clothing</option>
                    <option>Accessories</option>
                    <option>Footwear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (URLs) *</label>
                  {productForm.images.map((img, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Image
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
                  {productForm.colors.map((color, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateColorField(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Blue, Red, Green"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addColorField}
                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Color
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                  {productForm.sizes.map((size, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={size}
                        onChange={(e) => updateSizeField(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder="e.g., XS, S, M, L, XL"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSizeField}
                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Size
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loyalty Points</label>
                    <input
                      type="number"
                      value={productForm.loyaltyPoints}
                      onChange={(e) => setProductForm({ ...productForm, loyaltyPoints: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 350"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value), inStock: Number(e.target.value) > 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddProduct}
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => setShowAddProduct(false)}
                    className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
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
