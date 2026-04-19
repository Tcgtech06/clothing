'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import { CreditCard, Wallet, MapPin, User, Phone, Mail, Edit2, Plus, Check } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SavedAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Load saved address from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shippingAddress');
    if (saved) {
      const parsedAddress = JSON.parse(saved);
      setSavedAddress(parsedAddress);
      setFormData(parsedAddress);
    } else {
      setIsEditingAddress(true);
    }
  }, []);

  // Redirect if cart is empty (but not if order was just placed)
  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      router.push('/cart');
    }
  }, [cart.length, router, orderPlaced]);

  const handleSaveAddress = () => {
    localStorage.setItem('shippingAddress', JSON.stringify(formData));
    setSavedAddress(formData);
    setIsEditingAddress(false);
    setSaveAddress(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save address if checkbox is checked
    if (saveAddress && !savedAddress) {
      handleSaveAddress();
    }

    setIsProcessing(true);

    try {
      // Create order object
      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        status: 'new',
        total: getCartTotal(),
        items: cart.length,
        products: cart.map(item => `${item.product.name} (x${item.quantity})`),
        productDetails: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          color: item.selectedColor,
          size: item.selectedSize,
        })),
        createdAt: serverTimestamp(),
        isNew: true,
        trackingStatus: [
          {
            status: 'Order Placed',
            date: new Date().toISOString(),
            description: 'Your order has been placed successfully',
          }
        ],
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      console.log('Order created successfully:', docRef.id);
      
      // Mark order as placed to prevent cart redirect
      setOrderPlaced(true);

      // Clear cart
      clearCart();

      // Redirect to success page
      console.log('Redirecting to order success page...');
      window.location.href = `/order-success?orderId=${docRef.id}`;
    } catch (error: any) {
      console.error('Error placing order:', error);
      
      // Provide specific error messages
      if (error.code === 'permission-denied') {
        alert('Firebase permission error. Please contact support or check Firebase setup.\n\nError: Missing or insufficient permissions.\n\nFor developers: Update Firestore security rules in Firebase Console.');
      } else if (error.message) {
        alert(`Failed to place order: ${error.message}`);
      } else {
        alert('Failed to place order. Please try again.');
      }
      
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Payment Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Shipping Address
                  </h2>
                  {savedAddress && !isEditingAddress && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(true)}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {savedAddress && !isEditingAddress ? (
                  /* Display Saved Address */
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{savedAddress.name}</p>
                        <p className="text-sm text-gray-600">{savedAddress.email} • {savedAddress.phone}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {savedAddress.address}, {savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          name: '',
                          email: '',
                          phone: '',
                          address: '',
                          city: '',
                          state: '',
                          pincode: '',
                        });
                        setIsEditingAddress(true);
                      }}
                      className="mt-4 flex items-center gap-2 text-primary hover:text-primary/80 transition text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Use Different Address
                    </button>
                  </div>
                ) : (
                  /* Address Form */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={2}
                        placeholder="House No, Street, Area"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Maharashtra"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="400001"
                      />
                    </div>

                    {!savedAddress && (
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">Save this address for future orders</span>
                        </label>
                      </div>
                    )}

                    {savedAddress && isEditingAddress && (
                      <div className="md:col-span-2 flex gap-3">
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-medium"
                        >
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(savedAddress);
                            setIsEditingAddress(false);
                          }}
                          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-primary"
                    />
                    <Wallet className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive the product</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-4 h-4 text-primary"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Online Payment</p>
                      <p className="text-sm text-gray-600">UPI, Cards, Net Banking</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
                
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product.name} x {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-primary">₹{getCartTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
