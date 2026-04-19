'use client';

import { useState, useEffect } from 'react';
import { Package, TrendingUp, DollarSign, Users, Bell, X, Trash2, Plus, Edit, Image as ImageIcon, Upload, CheckCircle, Clock, Truck, MapPin, Navigation, PackageCheck } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import InventoryTab from '@/components/InventoryTab';
import { initializePollsForAllProducts } from '@/lib/init-polls';

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

// ImgBB API key (free - get from https://api.imgbb.com/)
const IMGBB_API_KEY = 'c609e2ff4c762257899c035c382f6503';

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
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'inventory'>('orders');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);
  const [initializingPolls, setInitializingPolls] = useState(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 32MB for ImgBB)
    if (file.size > 32 * 1024 * 1024) {
      alert('Image size should be less than 32MB');
      return;
    }

    // Set loading state for this specific image
    const newUploadingStates = [...uploadingImages];
    newUploadingStates[index] = true;
    setUploadingImages(newUploadingStates);

    try {
      console.log('Starting upload for:', file.name);
      console.log('File size:', (file.size / 1024).toFixed(2), 'KB');

      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/xxx;base64, prefix
          const base64String = result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('Image converted to base64, uploading to ImgBB...');

      // Upload to ImgBB
      const formData = new FormData();
      formData.append('image', base64);
      formData.append('key', IMGBB_API_KEY);

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const imageUrl = data.data.url;
        console.log('Upload successful! URL:', imageUrl);

        // Update form with the URL
        const newImages = [...productForm.images];
        newImages[index] = imageUrl;
        setProductForm({ ...productForm, images: newImages });

        alert('Image uploaded successfully!');
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.message}\n\nPlease try again or use a different image.`);
    } finally {
      // Reset loading state
      const newUploadingStates = [...uploadingImages];
      newUploadingStates[index] = false;
      setUploadingImages(newUploadingStates);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleAddProduct = async () => {
    try {
      // Validate form
      if (!productForm.name || !productForm.price || productForm.images[0] === '') {
        alert('Please fill in all required fields (Name, Price, and at least one Image URL)');
        return;
      }

      // Validate image URLs
      const validImages = productForm.images.filter(img => {
        const trimmed = img.trim();
        return trimmed !== '' && (trimmed.startsWith('http://') || trimmed.startsWith('https://'));
      });

      if (validImages.length === 0) {
        alert('Please provide at least one valid image URL (must start with http:// or https://)');
        return;
      }

      // Filter out empty strings from arrays
      const cleanedProduct = {
        name: productForm.name,
        price: productForm.price,
        originalPrice: productForm.originalPrice || productForm.price,
        description: productForm.description,
        category: productForm.category,
        images: validImages,
        colors: productForm.colors.filter(c => c.trim() !== ''),
        sizes: productForm.sizes.filter(s => s.trim() !== ''),
        loyaltyPoints: productForm.loyaltyPoints || 0,
        stock: productForm.stock || 0,
        inStock: productForm.stock > 0,
        rating: 4.5,
        reviews: 0,
        poll: { best: 0, good: 0, average: 0, worst: 0 },
        features: [],
        specifications: {},
        createdAt: serverTimestamp(),
      };

      console.log('Adding product to Firestore:', cleanedProduct);

      const docRef = await addDoc(collection(db, 'products'), cleanedProduct);
      
      console.log('Product added successfully with ID:', docRef.id);
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
    } catch (error: any) {
      console.error('Error adding product:', error);
      console.error('Error details:', error.message, error.code);
      alert(`Failed to add product. Please check console for details.\n\nError: ${error.message}`);
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

  const handleInitializePolls = async () => {
    if (!confirm('This will initialize poll data (Best/Good/Average/Worst = 0) for all products that don&apos;t have it. Continue?')) {
      return;
    }
    
    setInitializingPolls(true);
    try {
      const result = await initializePollsForAllProducts();
      alert(`Poll initialization complete!\n\nUpdated: ${result.updated} products\nSkipped: ${result.skipped} products (already had polls)`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to initialize polls. Check console for details.');
    } finally {
      setInitializingPolls(false);
    }
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
            <button
              onClick={() => setActiveTab('inventory')}
              className={`pb-2 px-4 font-semibold transition ${
                activeTab === 'inventory'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Inventory
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
              <div className="flex gap-3">
                <button
                  onClick={handleInitializePolls}
                  disabled={initializingPolls}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {initializingPolls ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Initializing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Initialize Polls
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-semibold flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add New Product
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Add new products to your store with images, descriptions, sizes, colors, and inventory management.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If products don&apos;t show poll colors on the home page, click &quot;Initialize Polls&quot; to add poll data to all existing products.
              </p>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <InventoryTab />
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
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept Order
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Processing
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Shipped
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'nearby')}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Nearby Delivery
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'out-for-delivery')}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Out for Delivery
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <PackageCheck className="w-4 h-4" />
                      Delivered
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload high-quality images (JPG, PNG, GIF) - Max 32MB per image. Images will be automatically uploaded to ImgBB.
                  </p>
                  {productForm.images.map((img, index) => (
                    <div key={index} className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition">
                      {/* Image Preview */}
                      {img && img.startsWith('http') && (
                        <div className="mb-3">
                          <img 
                            src={img} 
                            alt={`Product ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EError loading%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Upload Button */}
                      <label className="cursor-pointer block">
                        <div className="flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg hover:from-primary/90 hover:to-blue-700 transition">
                          {uploadingImages[index] ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="font-medium">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              <span className="font-medium">
                                {img && img.startsWith('http') ? 'Change Image' : 'Upload Image'}
                              </span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          className="hidden"
                          disabled={uploadingImages[index]}
                        />
                      </label>
                      
                      {/* Manual URL Input (Optional) */}
                      <div className="mt-3">
                        <input
                          type="url"
                          value={img}
                          onChange={(e) => updateImageField(index, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="Or paste image URL here..."
                          disabled={uploadingImages[index]}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                    disabled={uploadingImages.some(uploading => uploading)}
                  >
                    <Plus className="w-4 h-4" /> Add Another Image
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
