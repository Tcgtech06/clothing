'use client';

import { useState } from 'react';
import { Mail, Phone, Send, Headphones, X, Minimize2, Maximize2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

export default function SupportPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    email: '',
    phone: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [whatsappData, setWhatsappData] = useState({
    queryType: '',
    query: '',
    orderNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the support request to your backend
    console.log('Support request:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ subject: '', message: '', email: '', phone: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWhatsAppFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setWhatsappData({
      ...whatsappData,
      [e.target.name]: e.target.value
    });
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct WhatsApp message
    const message = `Hello! I need help with the following:

*Query Type:* ${whatsappData.queryType}
*Order Number:* ${whatsappData.orderNumber || 'N/A'}
*Query:* ${whatsappData.query}

*User:* ${user?.email || 'Guest'}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp number (remove + and spaces)
    const whatsappNumber = '919791962802';
    
    // Redirect to WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Close form
    setShowWhatsAppForm(false);
    setWhatsappData({ queryType: '', query: '', orderNumber: '' });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Support</h1>
            <p className="text-gray-600">We&apos;re here to help! Reach out to us anytime.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Contact Methods */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Us</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Email Support</h3>
                    <p className="text-sm text-gray-600">support@eshop.com</p>
                    <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Phone Support</h3>
                    <p className="text-sm text-gray-600">+91 1800-123-4567</p>
                    <p className="text-xs text-gray-500 mt-1">Mon-Sat: 9 AM - 6 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">WhatsApp Chat</h3>
                    <p className="text-sm text-gray-600">Chat with us on WhatsApp</p>
                    <button
                      onClick={() => setShowWhatsAppForm(true)}
                      className="text-xs text-primary hover:underline mt-1 font-medium flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Start WhatsApp Chat →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Help</h2>
              
              <div className="space-y-3">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="font-semibold text-gray-800 text-sm">Order Tracking</h3>
                  <p className="text-xs text-gray-600">Track your orders in the &quot;My Orders&quot; section</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-800 text-sm">Returns & Refunds</h3>
                  <p className="text-xs text-gray-600">7-day return policy on all products</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-800 text-sm">Payment Issues</h3>
                  <p className="text-xs text-gray-600">We accept UPI, Cards, and Cash on Delivery</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-800 text-sm">Shipping Info</h3>
                  <p className="text-xs text-gray-600">Free shipping on orders above ₹999</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Send us a Message</h2>
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-600">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Related</option>
                    <option value="return">Return & Refund</option>
                    <option value="payment">Payment Issue</option>
                    <option value="product">Product Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Describe your issue or question..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* FAQ Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  How do I track my order?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  Go to &quot;My Orders&quot; section and click on any order to see detailed tracking information with real-time updates including Order Placed, Processing, Shipped, Out for Delivery, and Delivered status.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  What is your return policy?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  We offer a 7-day return policy from the date of delivery. Products must be unused, unwashed, and in original packaging with all tags attached. Return shipping is free for defective items.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  How long does shipping take?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery. You&apos;ll receive tracking updates via notifications and can track your order in real-time.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  What payment methods do you accept?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery. Online payments are processed securely through Razorpay. COD is available for orders under ₹50,000.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  How do I request a return or refund?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  Go to &quot;My Orders&quot;, select the delivered order, and click &quot;Return Product&quot;. Choose your reason, select refund method (UPI or Bank Transfer), and submit. Our team will review and process your request within 24-48 hours.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  Can I cancel my order?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  Yes, you can cancel your order before it&apos;s shipped. Go to &quot;My Orders&quot;, select the order, and contact support. Once shipped, you&apos;ll need to wait for delivery and then initiate a return.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  Do you offer free shipping?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  Yes! We offer free standard shipping on all orders above ₹999. For orders below ₹999, a nominal shipping fee of ₹99 applies.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  How do I change my delivery address?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  You can update your delivery address in the &quot;Profile&quot; section before placing an order. For orders already placed, contact our support team immediately if the order hasn&apos;t been shipped yet.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  What if I receive a damaged or wrong product?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  We sincerely apologize for any inconvenience. Please contact our support team within 24 hours of delivery with photos of the product. We&apos;ll arrange a free return pickup and send you a replacement or full refund immediately.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  How long does it take to receive my refund?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  Once your return is approved and picked up, refunds are processed within 5-7 business days. UPI refunds are faster (1-2 days) while bank transfers may take 5-7 days depending on your bank.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  Can I exchange a product for a different size or color?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  Currently, we don&apos;t offer direct exchanges. Please return the product for a refund and place a new order for the desired size or color. We&apos;re working on adding an exchange feature soon!
                </p>
              </details>

              <details className="pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  How do I contact customer support?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  You can reach us via email at support@eshop.com, call us at +91 1800-123-4567 (Mon-Sat, 9 AM - 6 PM), or use our live chat feature available 24/7 on this page.
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* WhatsApp Chat Form Modal */}
        {showWhatsAppForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
              {/* Header */}
              <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">WhatsApp Support</h3>
                    <p className="text-xs text-white/80">Chat with us on WhatsApp</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWhatsAppForm(false)}
                  className="hover:bg-white/20 p-2 rounded transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleWhatsAppSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Query Type *
                  </label>
                  <select
                    name="queryType"
                    value={whatsappData.queryType}
                    onChange={handleWhatsAppFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select query type</option>
                    <option value="Order Status">Order Status</option>
                    <option value="Return/Refund">Return/Refund</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Product Inquiry">Product Inquiry</option>
                    <option value="Delivery Issue">Delivery Issue</option>
                    <option value="Account Issue">Account Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={whatsappData.orderNumber}
                    onChange={handleWhatsAppFormChange}
                    placeholder="e.g., 4RXQTRKY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can find this in &quot;My Orders&quot; section
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Query *
                  </label>
                  <textarea
                    name="query"
                    value={whatsappData.query}
                    onChange={handleWhatsAppFormChange}
                    required
                    rows={4}
                    placeholder="Please describe your issue or question..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Note:</strong> You&apos;ll be redirected to WhatsApp to continue the conversation with our support team.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Open WhatsApp
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
