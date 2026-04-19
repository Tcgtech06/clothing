'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, X, MapPin } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  createdAt: any;
  status: 'new' | 'processing' | 'shipped' | 'delivered';
  total: number;
  items: number;
  products: string[];
  productDetails?: any[];
  trackingStatus?: Array<{
    status: string;
    date: string;
    description: string;
  }>;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'shipped':
      return <Truck className="w-5 h-5 text-blue-600" />;
    case 'processing':
      return <Clock className="w-5 h-5 text-yellow-600" />;
    default:
      return <Package className="w-5 h-5 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTrackingSteps = (status: string) => {
  const steps = [
    { label: 'Order Placed', status: 'completed' },
    { label: 'Processing', status: status === 'new' ? 'current' : 'completed' },
    { label: 'Shipped', status: status === 'shipped' || status === 'delivered' ? 'completed' : status === 'processing' ? 'current' : 'pending' },
    { label: 'Delivered', status: status === 'delivered' ? 'completed' : status === 'shipped' ? 'current' : 'pending' },
  ];
  return steps;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all orders (no email filter since we don't have auth yet)
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      Order #{order.id.substring(0, 12).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                    {order.paymentMethod && (
                      <p className="text-sm text-gray-600 mt-1">Payment: {order.paymentMethod}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    {getTrackingSteps(order.status).map((step, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                          step.status === 'completed' ? 'bg-green-500 text-white' :
                          step.status === 'current' ? 'bg-primary text-white' :
                          'bg-gray-200 text-gray-400'
                        }`}>
                          {step.status === 'completed' ? '✓' : index + 1}
                        </div>
                        <p className={`text-xs text-center ${
                          step.status === 'completed' || step.status === 'current' ? 'text-gray-800 font-semibold' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                        {index < 3 && (
                          <div className={`h-1 w-full mt-4 ${
                            step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                          }`} style={{ position: 'absolute', top: '16px', left: '50%', width: 'calc(100% - 32px)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="border-t pt-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <p className="text-sm text-gray-600 mb-2">
                        {order.items} {order.items === 1 ? 'item' : 'items'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.products.slice(0, 3).map((product, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {product}
                          </span>
                        ))}
                        {order.products.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            +{order.products.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-xl font-bold text-primary">
                          ₹{order.total.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition font-semibold"
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Order Tracking</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-mono font-semibold text-gray-800">
                    #{selectedOrder.id.substring(0, 12).toUpperCase()}
                  </p>
                </div>

                {selectedOrder.shippingAddress && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Address
                    </p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-4">Tracking History</p>
                  <div className="space-y-4">
                    {selectedOrder.trackingStatus?.map((track, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          {index < (selectedOrder.trackingStatus?.length || 0) - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-semibold text-gray-800">{track.status}</p>
                          <p className="text-sm text-gray-600">{track.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(track.date).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Order Items</p>
                  <div className="space-y-2">
                    {selectedOrder.productDetails?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm border-b pb-2">
                        <span className="text-gray-700">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
