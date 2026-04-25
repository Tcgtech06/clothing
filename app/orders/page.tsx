'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, X, MapPin, RotateCcw, TruckIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

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
  deliveredAt?: any;
  returnRequest?: {
    id: string;
    reason: string;
    paymentMethod: 'upi' | 'bank';
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    requestedAt: any;
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    returnStatus?: 'pending' | 'approved' | 'pickup-scheduled' | 'picked-up' | 'refund-completed';
    returnTrackingHistory?: Array<{
      status: string;
      date: string;
      description: string;
    }>;
  };
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
  const allSteps = [
    { key: 'accepted', label: 'Order Accepted' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'nearby', label: 'Nearby Delivery' },
    { key: 'out-for-delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  // Map status to step index
  let currentStepIndex = 0;
  if (status === 'new' || status === 'placed' || status === 'accepted') currentStepIndex = 0;
  else if (status === 'processing') currentStepIndex = 0;
  else if (status === 'shipped') currentStepIndex = 1;
  else if (status === 'nearby') currentStepIndex = 2;
  else if (status === 'out-for-delivery') currentStepIndex = 3;
  else if (status === 'delivered') currentStepIndex = 4;

  return allSteps.map((step, index) => ({
    ...step,
    status: index < currentStepIndex ? 'completed' : index === currentStepIndex ? 'current' : 'pending'
  }));
};

const getReturnTrackingSteps = (returnStatus: string) => {
  const allSteps = [
    { key: 'approved', label: 'Return Approved' },
    { key: 'pickup-scheduled', label: 'Pickup Scheduled' },
    { key: 'picked-up', label: 'Product Picked Up' },
    { key: 'refund-completed', label: 'Refund Completed' },
  ];

  // Map return status to step index
  let currentStepIndex = 0;
  if (returnStatus === 'pending' || returnStatus === 'approved') currentStepIndex = 0;
  else if (returnStatus === 'pickup-scheduled') currentStepIndex = 1;
  else if (returnStatus === 'picked-up') currentStepIndex = 2;
  else if (returnStatus === 'return-successful') currentStepIndex = 2;
  else if (returnStatus === 'refund-initiated') currentStepIndex = 2;
  else if (returnStatus === 'refund-completed') currentStepIndex = 3;

  return allSteps.map((step, index) => ({
    ...step,
    status: index < currentStepIndex ? 'completed' : index === currentStepIndex ? 'current' : 'pending'
  }));
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnForm, setReturnForm] = useState({
    reason: '',
    paymentMethod: 'upi' as 'upi' | 'bank',
    upiId: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [showPollPrompt, setShowPollPrompt] = useState(false);
  const [pollProducts, setPollProducts] = useState<any[]>([]);
  const router = useRouter();
  
  // Track truck positions for animation
  const [truckPositions, setTruckPositions] = useState<{ [key: string]: number }>({});
  const [isAnimating, setIsAnimating] = useState<{ [key: string]: boolean }>({});

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

      // Check for newly delivered products to prompt for poll voting
      checkForPollPrompt(ordersData);
      
      // Animate trucks to their current positions
      animateTrucks(ordersData);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const animateTrucks = (ordersData: Order[]) => {
    // Reset all truck positions to 0 first
    const resetPositions: { [key: string]: number } = {};
    const animatingStates: { [key: string]: boolean } = {};
    
    ordersData.forEach((order) => {
      resetPositions[order.id] = 0;
      animatingStates[order.id] = true;
    });
    
    setTruckPositions(resetPositions);
    setIsAnimating(animatingStates);
    
    // Animate each truck step by step with very slow speed (like 1km/h)
    ordersData.forEach((order) => {
      const orderId = order.id;
      
      // Get all steps
      let steps;
      let currentStepIndex;
      
      if (order.returnRequest) {
        steps = getReturnTrackingSteps(order.returnRequest.returnStatus || 'pending');
        currentStepIndex = steps.findIndex(s => s.status === 'current');
      } else {
        steps = getTrackingSteps(order.status);
        currentStepIndex = steps.findIndex(s => s.status === 'current');
      }
      
      // Animate through each step very slowly
      let currentStep = 0;
      const animateToNextStep = () => {
        if (currentStep <= currentStepIndex) {
          const position = (currentStep / (steps.length - 1)) * 100;
          
          // Move to this step
          setTruckPositions(prev => ({
            ...prev,
            [orderId]: position
          }));
          
          // Pause at this step for 800ms, then move to next very slowly
          setTimeout(() => {
            currentStep++;
            if (currentStep <= currentStepIndex) {
              animateToNextStep();
            } else {
              // Animation complete - truck stays at current position
              setIsAnimating(prev => ({
                ...prev,
                [orderId]: false
              }));
            }
          }, 800); // Longer pause at each checkpoint
        }
      };
      
      // Start animation after initial delay
      setTimeout(() => {
        animateToNextStep();
      }, 500);
    });
  };

  const checkForPollPrompt = (ordersData: Order[]) => {
    if (!user) return;

    // Get list of products user has already been prompted to vote for
    const promptedProducts = JSON.parse(localStorage.getItem('pollPrompted') || '{}');
    
    // Find delivered orders with products that haven't been prompted yet
    const productsToVote: any[] = [];
    
    ordersData.forEach(order => {
      if (order.status === 'delivered' && order.productDetails) {
        order.productDetails.forEach((product: any) => {
          const productKey = product.firestoreId || product.id;
          if (!promptedProducts[productKey]) {
            productsToVote.push({
              ...product,
              orderId: order.id
            });
            // Mark as prompted
            promptedProducts[productKey] = true;
          }
        });
      }
    });

    if (productsToVote.length > 0) {
      setPollProducts(productsToVote);
      setShowPollPrompt(true);
      // Save to localStorage
      localStorage.setItem('pollPrompted', JSON.stringify(promptedProducts));
    }
  };

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

  const canReturnOrder = (order: Order) => {
    if (order.status !== 'delivered' || order.returnRequest) return false;
    
    // If no deliveredAt timestamp, use createdAt as fallback (for existing orders)
    const deliveryTimestamp = order.deliveredAt || order.createdAt;
    if (!deliveryTimestamp) return false;
    
    const deliveredDate = deliveryTimestamp.toDate ? deliveryTimestamp.toDate() : new Date(deliveryTimestamp);
    const daysSinceDelivery = Math.floor((Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceDelivery <= 7;
  };

  const getDaysLeftForReturn = (order: Order) => {
    // If no deliveredAt timestamp, use createdAt as fallback (for existing orders)
    const deliveryTimestamp = order.deliveredAt || order.createdAt;
    if (!deliveryTimestamp) return 0;
    
    const deliveredDate = deliveryTimestamp.toDate ? deliveryTimestamp.toDate() : new Date(deliveryTimestamp);
    const daysSinceDelivery = Math.floor((Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysSinceDelivery);
  };

  const handleReturnRequest = async () => {
    if (!selectedOrder) return;
    
    // Validate reason
    if (!returnForm.reason.trim()) {
      alert('Please provide a reason for return');
      return;
    }

    if (returnForm.reason.trim().length < 10) {
      alert('Please provide a detailed reason (at least 10 characters)');
      return;
    }

    // Validate payment method
    if (returnForm.paymentMethod === 'upi') {
      if (!returnForm.upiId.trim()) {
        alert('Please provide your UPI ID');
        return;
      }
      
      // Validate UPI ID format (should contain @ symbol)
      const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
      if (!upiRegex.test(returnForm.upiId.trim())) {
        alert('Please enter a valid UPI ID (e.g., yourname@paytm, 9876543210@ybl)');
        return;
      }
    }

    if (returnForm.paymentMethod === 'bank') {
      // Validate account holder name
      if (!returnForm.accountHolderName.trim()) {
        alert('Please provide account holder name');
        return;
      }
      
      if (returnForm.accountHolderName.trim().length < 3) {
        alert('Please enter a valid account holder name');
        return;
      }

      // Validate account number
      if (!returnForm.accountNumber.trim()) {
        alert('Please provide account number');
        return;
      }
      
      const accountNumberRegex = /^[0-9]{9,18}$/;
      if (!accountNumberRegex.test(returnForm.accountNumber.trim())) {
        alert('Please enter a valid account number (9-18 digits)');
        return;
      }

      // Validate IFSC code
      if (!returnForm.ifscCode.trim()) {
        alert('Please provide IFSC code');
        return;
      }
      
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(returnForm.ifscCode.trim().toUpperCase())) {
        alert('Please enter a valid IFSC code (e.g., SBIN0001234)');
        return;
      }
    }

    setSubmittingReturn(true);
    try {
      // Create return request document
      const returnRequestData = {
        orderId: selectedOrder.id,
        customerEmail: selectedOrder.customerEmail,
        customerName: selectedOrder.customerName,
        reason: returnForm.reason.trim(),
        paymentMethod: returnForm.paymentMethod,
        ...(returnForm.paymentMethod === 'upi' ? { 
          upiId: returnForm.upiId.trim() 
        } : {
          accountNumber: returnForm.accountNumber.trim(),
          ifscCode: returnForm.ifscCode.trim().toUpperCase(),
          accountHolderName: returnForm.accountHolderName.trim()
        }),
        requestedAt: serverTimestamp(),
        status: 'pending',
        total: selectedOrder.total,
        products: selectedOrder.products || [],
        productDetails: selectedOrder.productDetails || []
      };

      console.log('Submitting return request:', returnRequestData);

      const returnRef = await addDoc(collection(db, 'returnRequests'), returnRequestData);

      console.log('Return request created with ID:', returnRef.id);

      // Update order with return request reference
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        returnRequest: {
          id: returnRef.id,
          reason: returnRequestData.reason,
          paymentMethod: returnRequestData.paymentMethod,
          ...(returnForm.paymentMethod === 'upi' ? { 
            upiId: returnForm.upiId 
          } : {
            accountNumber: returnForm.accountNumber,
            ifscCode: returnForm.ifscCode,
            accountHolderName: returnForm.accountHolderName
          }),
          requestedAt: new Date(),
          status: 'pending'
        }
      });

      console.log('Order updated with return request');

      alert('Return request submitted successfully! Our team will review it shortly.');
      setShowReturnModal(false);
      setSelectedOrder(null);
      setReturnForm({
        reason: '',
        paymentMethod: 'upi',
        upiId: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: ''
      });
    } catch (error) {
      console.error('Error submitting return request:', error);
      alert('Failed to submit return request. Please try again. Error: ' + (error as Error).message);
    } finally {
      setSubmittingReturn(false);
    }
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
    <ProtectedRoute>
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

                {/* Tracking Progress - Horizontal Flow - Mobile Optimized with Truck Animation */}
                {!order.returnRequest && (
                  <div className="mb-6 px-2 md:px-4">
                    <div className="relative overflow-x-auto pb-2">
                      {/* Progress Line */}
                      <div className="absolute top-4 md:top-5 left-0 right-0 h-0.5 md:h-1 bg-gray-200" style={{ zIndex: 0 }}></div>
                      <div 
                        className="absolute top-4 md:top-5 left-0 h-0.5 md:h-1 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500" 
                        style={{ 
                          width: `${(getTrackingSteps(order.status).filter(s => s.status === 'completed').length / (getTrackingSteps(order.status).length - 1)) * 100}%`,
                          zIndex: 1
                        }}
                      ></div>
                      
                      {/* Animated Truck Video */}
                      <div 
                        className="absolute top-[-8px] md:top-[-6px] truck-container"
                        style={{ 
                          left: `${truckPositions[order.id] !== undefined ? truckPositions[order.id] : 0}%`,
                          transform: 'translateX(-50%)',
                          zIndex: 3,
                          transition: isAnimating[order.id] ? 'left 3s linear' : 'none'
                        }}
                      >
                        <div className="relative">
                          {/* Glow effect behind truck */}
                          <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-30 scale-150 animate-pulse"></div>
                          
                          {/* Truck Video Animation */}
                          <video 
                            className="relative w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-2xl filter drop-shadow-[0_4px_16px_rgba(37,99,235,0.7)]"
                            autoPlay
                            loop
                            muted
                            playsInline
                          >
                            <source src="/truck.webm" type="video/webm" />
                            {/* Fallback to icon if video doesn't load */}
                            <Truck className="w-12 h-12 md:w-14 md:h-14 text-blue-600" strokeWidth={2.5} />
                          </video>
                          
                          {/* Enhanced shadow with movement */}
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-md opacity-50 animate-pulse"></div>
                          
                          {/* Animated speed lines - only show when moving */}
                          {isAnimating[order.id] && (
                            <div className="absolute top-1/2 -left-5 transform -translate-y-1/2 flex flex-col gap-1 opacity-80">
                              <div className="flex gap-1 animate-speed-line">
                                <div className="w-3 h-0.5 bg-blue-500 rounded-full"></div>
                                <div className="w-2 h-0.5 bg-blue-400 rounded-full"></div>
                                <div className="w-1.5 h-0.5 bg-blue-300 rounded-full"></div>
                              </div>
                              <div className="flex gap-1 animate-speed-line" style={{ animationDelay: '0.15s' }}>
                                <div className="w-2.5 h-0.5 bg-blue-400 rounded-full"></div>
                                <div className="w-1.5 h-0.5 bg-blue-300 rounded-full"></div>
                              </div>
                            </div>
                          )}
                          
                          {/* Dust cloud effect - only when moving */}
                          {isAnimating[order.id] && (
                            <div className="absolute -bottom-1 -left-3 flex gap-1.5 opacity-40">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-dust-cloud"></div>
                              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-dust-cloud" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-1 h-1 bg-gray-200 rounded-full animate-dust-cloud" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Steps - Reduced Gap */}
                      <div className="relative flex justify-between min-w-[400px] md:min-w-0 gap-2" style={{ zIndex: 2 }}>
                        {getTrackingSteps(order.status).map((step, index) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1 md:mb-2 text-xs md:text-base font-bold transition-all duration-300 ${
                              step.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-110' :
                              step.status === 'current' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-110 animate-pulse animate-pulse-ring' :
                              'bg-gray-200 text-gray-400'
                            }`}>
                              {step.status === 'completed' ? '✓' : index + 1}
                            </div>
                            <p className={`text-[10px] md:text-xs text-center max-w-[60px] md:max-w-[70px] transition-all leading-tight ${
                              step.status === 'completed' || step.status === 'current' ? 'text-gray-800 font-semibold' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Return Tracking Progress - Mobile Optimized with Truck Animation */}
                {order.returnRequest && (
                  <div className="mb-6 px-2 md:px-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 md:p-3 mb-4">
                      <p className="text-xs md:text-sm font-semibold text-orange-800 flex items-center gap-2">
                        <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
                        Return Request Active - Tracking Return Process
                      </p>
                      {/* Debug: Show actual return status */}
                      <p className="text-xs text-gray-600 mt-1">
                        Debug: returnStatus = "{order.returnRequest?.returnStatus || 'undefined'}"
                      </p>
                    </div>
                    <div className="relative overflow-x-auto pb-2">
                      {/* Progress Line */}
                      <div className="absolute top-4 md:top-5 left-0 right-0 h-0.5 md:h-1 bg-gray-200" style={{ zIndex: 0 }}></div>
                      <div 
                        className="absolute top-4 md:top-5 left-0 h-0.5 md:h-1 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" 
                        style={{ 
                          width: `${(getReturnTrackingSteps(order.returnRequest.returnStatus || 'pending').filter(s => s.status === 'completed').length / (getReturnTrackingSteps(order.returnRequest.returnStatus || 'pending').length - 1)) * 100}%`,
                          zIndex: 1
                        }}
                      ></div>
                      
                      {/* Animated Return Truck Video */}
                      <div 
                        className="absolute top-[-8px] md:top-[-6px] truck-container"
                        style={{ 
                          left: `${truckPositions[order.id] !== undefined ? truckPositions[order.id] : 0}%`,
                          transform: 'translateX(-50%)',
                          zIndex: 3,
                          transition: isAnimating[order.id] ? 'left 3s linear' : 'none'
                        }}
                      >
                        {/* Determine which icon to show based on return status */}
                        {/* TRUCK: Show for pending, approved, pickup-scheduled, picked-up, or undefined */}
                        {/* MONEY: Show ONLY for refund-completed */}
                        {(() => {
                          const returnStatus = order.returnRequest?.returnStatus;
                          const showMoney = returnStatus === 'refund-completed';
                          
                          if (showMoney) {
                            // MONEY ANIMATION - Only at final stage
                            return (
                          <div className="relative">
                            <div className="money-handover-animation">
                              {/* Person receiving money */}
                              <div className="flex items-center gap-1">
                                <div className="relative">
                                  {/* Glow effect */}
                                  <div className="absolute inset-0 bg-green-400 rounded-full blur-lg opacity-30 scale-150"></div>
                                  
                                  {/* Person icon - larger */}
                                  <svg className="relative w-8 h-8 md:w-10 md:h-10 text-green-600 drop-shadow-xl" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                  </svg>
                                  
                                  {/* Money bills flying to person - larger */}
                                  <div className="absolute -top-3 -right-3 animate-money-fly">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-green-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M2 6h20v12H2V6zm2 2v8h16V8H4zm7 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                                    </svg>
                                  </div>
                                  <div className="absolute -top-2 -right-4 animate-money-fly" style={{ animationDelay: '0.2s' }}>
                                    <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M2 6h20v12H2V6zm2 2v8h16V8H4zm7 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                                    </svg>
                                  </div>
                                  <div className="absolute -top-1 -right-5 animate-money-fly" style={{ animationDelay: '0.4s' }}>
                                    <svg className="w-4 h-4 md:w-5 md:h-5 text-green-300 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M2 6h20v12H2V6zm2 2v8h16V8H4zm7 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              {/* Success checkmark - larger */}
                              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 animate-scale-in shadow-lg">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                            );
                          } else {
                            // TRUCK ANIMATION - All other stages
                            return (
                          <div className="relative">
                            {/* Glow effect behind truck */}
                            <div className="absolute inset-0 bg-orange-400 rounded-full blur-lg opacity-30 scale-150 animate-pulse"></div>
                            
                            {/* Truck Video Animation */}
                            <video 
                              className="relative w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-2xl filter drop-shadow-[0_4px_16px_rgba(234,88,12,0.7)]"
                              autoPlay
                              loop
                              muted
                              playsInline
                            >
                              <source src="/truck.webm" type="video/webm" />
                              {/* Fallback to icon if video doesn't load */}
                              <Truck className="w-12 h-12 md:w-14 md:h-14 text-orange-600" strokeWidth={2.5} />
                            </video>
                            
                            {/* Enhanced shadow with movement */}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-md opacity-50 animate-pulse"></div>
                            
                            {/* Animated speed lines - only show when moving */}
                            {isAnimating[order.id] && (
                              <div className="absolute top-1/2 -left-5 transform -translate-y-1/2 flex flex-col gap-1 opacity-80">
                                <div className="flex gap-1 animate-speed-line">
                                  <div className="w-3 h-0.5 bg-orange-500 rounded-full"></div>
                                  <div className="w-2 h-0.5 bg-orange-400 rounded-full"></div>
                                  <div className="w-1.5 h-0.5 bg-orange-300 rounded-full"></div>
                                </div>
                                <div className="flex gap-1 animate-speed-line" style={{ animationDelay: '0.15s' }}>
                                  <div className="w-2.5 h-0.5 bg-orange-400 rounded-full"></div>
                                  <div className="w-1.5 h-0.5 bg-orange-300 rounded-full"></div>
                                </div>
                              </div>
                            )}
                            
                            {/* Dust cloud effect - only when moving */}
                            {isAnimating[order.id] && (
                              <div className="absolute -bottom-1 -left-3 flex gap-1.5 opacity-40">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-dust-cloud"></div>
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-dust-cloud" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1 h-1 bg-gray-200 rounded-full animate-dust-cloud" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            )}
                          </div>
                            );
                          }
                        })()}
                      </div>
                      
                      {/* Steps - Reduced Gap */}
                      <div className="relative flex justify-between min-w-[350px] md:min-w-0 gap-2" style={{ zIndex: 2 }}>
                        {getReturnTrackingSteps(order.returnRequest.returnStatus || 'pending').map((step, index) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1 md:mb-2 text-xs md:text-base font-bold transition-all duration-300 ${
                              step.status === 'completed' ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-110' :
                              step.status === 'current' ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg scale-110 animate-pulse animate-pulse-ring' :
                              'bg-gray-200 text-gray-400'
                            }`}>
                              {step.status === 'completed' ? '✓' : index + 1}
                            </div>
                            <p className={`text-[10px] md:text-xs text-center max-w-[60px] md:max-w-[70px] transition-all leading-tight ${
                              step.status === 'completed' || step.status === 'current' ? 'text-gray-800 font-semibold' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Details - Mobile Optimized */}
                <div className="border-t pt-4">
                  <div className="flex flex-col gap-4">
                    <div>
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
                      
                      {/* Delivery Status */}
                      {order.status === 'delivered' && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-green-600 font-semibold mb-1">
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="text-sm md:text-base">Successfully Delivered</span>
                          </div>
                          {(order.deliveredAt || order.createdAt) && (
                            <p className="text-xs text-gray-500">
                              Delivered on {formatDate(order.deliveredAt || order.createdAt)}
                            </p>
                          )}
                          
                          {/* Return Status or Button */}
                          {order.returnRequest ? (
                            <div className="mt-2">
                              <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold ${
                                order.returnRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.returnRequest.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                order.returnRequest.status === 'refunded' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                <RotateCcw className="w-3 h-3" />
                                Return {order.returnRequest.status.charAt(0).toUpperCase() + order.returnRequest.status.slice(1)}
                              </span>
                            </div>
                          ) : canReturnOrder(order) && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 mb-1">
                                {getDaysLeftForReturn(order)} days left to return
                              </p>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowReturnModal(true);
                                }}
                                className="text-xs md:text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
                                Return Product
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-xl md:text-2xl font-bold text-primary">
                          ₹{order.total.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Tracking Modal - Mobile Optimized */}
      {selectedOrder && !showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-2xl font-bold text-gray-800">
                  {selectedOrder.returnRequest ? 'Return Tracking' : 'Order Tracking'}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-mono text-sm md:text-base font-semibold text-gray-800 break-all">
                    #{selectedOrder.id.substring(0, 12).toUpperCase()}
                  </p>
                </div>

                {selectedOrder.returnRequest && (
                  <div className="bg-orange-50 border-2 border-orange-300 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                      <p className="text-sm md:text-base font-semibold text-orange-800">Return Request Active</p>
                    </div>
                    <p className="text-xs md:text-sm text-orange-700">
                      Current Status: <span className="font-semibold capitalize">
                        {(selectedOrder.returnRequest.returnStatus || 'pending').replace(/-/g, ' ')}
                      </span>
                    </p>
                  </div>
                )}

                {selectedOrder.shippingAddress && (
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                      {selectedOrder.returnRequest ? 'Pickup Address' : 'Delivery Address'}
                    </p>
                    <p className="text-sm md:text-base text-gray-600">{selectedOrder.shippingAddress}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-700 mb-3 md:mb-4">
                    {selectedOrder.returnRequest ? 'Return Tracking History' : 'Tracking History'}
                  </p>
                  <div className="space-y-3 md:space-y-4">
                    {selectedOrder.returnRequest && selectedOrder.returnRequest.returnTrackingHistory ? (
                      // Show return tracking history
                      selectedOrder.returnRequest.returnTrackingHistory.map((track, index) => (
                        <div key={index} className="flex gap-3 md:gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-orange-500"></div>
                            {index < (selectedOrder.returnRequest?.returnTrackingHistory?.length || 0) - 1 && (
                              <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-3 md:pb-4">
                            <p className="text-sm md:text-base font-semibold text-gray-800">{track.status}</p>
                            <p className="text-xs md:text-sm text-gray-600">{track.description}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                              {new Date(track.date).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : selectedOrder.trackingStatus ? (
                      // Show order tracking history
                      selectedOrder.trackingStatus.map((track, index) => (
                        <div key={index} className="flex gap-3 md:gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-primary"></div>
                            {index < (selectedOrder.trackingStatus?.length || 0) - 1 && (
                              <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-3 md:pb-4">
                            <p className="text-sm md:text-base font-semibold text-gray-800">{track.status}</p>
                            <p className="text-xs md:text-sm text-gray-600">{track.description}</p>
                            <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                              {new Date(track.date).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs md:text-sm text-gray-500 text-center py-4">
                        No tracking history available yet
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-700 mb-2">Order Items</p>
                  <div className="space-y-2">
                    {selectedOrder.productDetails?.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs md:text-sm border-b pb-2">
                        <span className="text-gray-700">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold text-base md:text-lg mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {selectedOrder.returnRequest && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm font-medium text-blue-800 mb-2">Return Information</p>
                    <p className="text-xs md:text-sm text-blue-700">
                      <strong>Reason:</strong> {selectedOrder.returnRequest.reason}
                    </p>
                    <p className="text-xs md:text-sm text-blue-700 mt-1">
                      <strong>Refund Method:</strong> {selectedOrder.returnRequest.paymentMethod.toUpperCase()}
                      {selectedOrder.returnRequest.paymentMethod === 'upi' 
                        ? ` - ${selectedOrder.returnRequest.upiId}`
                        : ` - ${selectedOrder.returnRequest.accountNumber}`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Return Product</h3>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturnForm({
                      reason: '',
                      paymentMethod: 'upi',
                      upiId: '',
                      accountNumber: '',
                      ifscCode: '',
                      accountHolderName: ''
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-mono font-semibold text-gray-800 mb-3">
                    #{selectedOrder.id.substring(0, 12).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-primary">
                    ₹{selectedOrder.total.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Return Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Return <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={returnForm.reason}
                    onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={4}
                    placeholder="Please describe why you want to return this product..."
                  />
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Refund Payment Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setReturnForm({ ...returnForm, paymentMethod: 'upi' })}
                      className={`p-4 border-2 rounded-lg transition ${
                        returnForm.paymentMethod === 'upi'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">UPI</p>
                      <p className="text-xs text-gray-500 mt-1">Google Pay, PhonePe, etc.</p>
                    </button>
                    <button
                      onClick={() => setReturnForm({ ...returnForm, paymentMethod: 'bank' })}
                      className={`p-4 border-2 rounded-lg transition ${
                        returnForm.paymentMethod === 'bank'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">Bank Account</p>
                      <p className="text-xs text-gray-500 mt-1">Direct bank transfer</p>
                    </button>
                  </div>
                </div>

                {/* UPI Details */}
                {returnForm.paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={returnForm.upiId}
                      onChange={(e) => setReturnForm({ ...returnForm, upiId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="yourname@paytm or 9876543210@ybl"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your UPI ID (e.g., yourname@paytm, phonenumber@ybl, yourname@oksbi)
                    </p>
                  </div>
                )}

                {/* Bank Account Details */}
                {returnForm.paymentMethod === 'bank' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={returnForm.accountHolderName}
                        onChange={(e) => setReturnForm({ ...returnForm, accountHolderName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Full name as per bank account"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={returnForm.accountNumber}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setReturnForm({ ...returnForm, accountNumber: value });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter account number (9-18 digits)"
                        maxLength={18}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter 9-18 digit bank account number
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={returnForm.ifscCode}
                        onChange={(e) => {
                          // Convert to uppercase and limit to 11 characters
                          const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                          setReturnForm({ ...returnForm, ifscCode: value });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="SBIN0001234"
                        maxLength={11}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter 11-character IFSC code (e.g., SBIN0001234, HDFC0000123)
                      </p>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your return request will be reviewed by our team within 24-48 hours. 
                    Once approved, the refund will be processed to your provided payment details within 5-7 business days.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    onClick={handleReturnRequest}
                    disabled={submittingReturn}
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submittingReturn ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-5 h-5" />
                        Submit Return Request
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowReturnModal(false);
                      setReturnForm({
                        reason: '',
                        paymentMethod: 'upi',
                        upiId: '',
                        accountNumber: '',
                        ifscCode: '',
                        accountHolderName: ''
                      });
                    }}
                    disabled={submittingReturn}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Poll Voting Prompt Modal */}
      {showPollPrompt && pollProducts.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Rate Your Products!</h3>
                <button
                  onClick={() => setShowPollPrompt(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <p className="text-center text-gray-700 mb-2">
                  Your order has been delivered successfully!
                </p>
                <p className="text-center text-sm text-gray-600">
                  Help other customers by rating the products you received
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {pollProducts.slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">₹{product.price}</p>
                    </div>
                  </div>
                ))}
                {pollProducts.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{pollProducts.length - 3} more products
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPollPrompt(false);
                    // Navigate to first product
                    if (pollProducts[0].firestoreId) {
                      router.push(`/product/${pollProducts[0].firestoreId}`);
                    }
                  }}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
                >
                  Rate Now
                </button>
                <button
                  onClick={() => setShowPollPrompt(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
