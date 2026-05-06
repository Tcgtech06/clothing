'use client';

import { useState } from 'react';
import { Mail, Phone, MessageCircle, Send, Headphones, X, Minimize2, Maximize2 } from 'lucide-react';
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
  const [showChat, setShowChat] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{text: string, sender: 'user' | 'support', time: string}>>([
    { text: 'Hello! How can we help you today?', sender: 'support', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);

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

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage = {
      text: chatMessage,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatMessage('');

    // Simulate support response after 2 seconds
    setTimeout(() => {
      const responses = [
        "Thank you for your message! Our team will assist you shortly.",
        "I understand your concern. Let me help you with that.",
        "Could you please provide more details about your issue?",
        "I'm checking that for you. Please hold on.",
        "Thank you for contacting us! How else can I help you?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setChatMessages(prev => [...prev, {
        text: randomResponse,
        sender: 'support',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 2000);
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
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Live Chat</h3>
                    <p className="text-sm text-gray-600">Chat with our team</p>
                    <button
                      onClick={() => setShowChat(true)}
                      className="text-xs text-primary hover:underline mt-1 font-medium"
                    >
                      Start Chat →
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

        {/* Live Chat Widget */}
        {showChat && (
          <div className={`fixed ${chatMinimized ? 'bottom-4 right-4' : 'bottom-0 right-0 md:bottom-4 md:right-4'} z-50 ${chatMinimized ? 'w-auto' : 'w-full md:w-96'} transition-all duration-300`}>
            {chatMinimized ? (
              <button
                onClick={() => setChatMinimized(false)}
                className="bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary/90 transition flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Chat Support</span>
                {chatMessages.length > 1 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chatMessages.length - 1}
                  </span>
                )}
              </button>
            ) : (
              <div className="bg-white rounded-t-lg md:rounded-lg shadow-2xl flex flex-col h-[600px] md:h-[500px]">
                {/* Chat Header */}
                <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Customer Support</h3>
                      <p className="text-xs text-white/80">Online • Typically replies instantly</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChatMinimized(true)}
                      className="hover:bg-white/20 p-2 rounded transition"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowChat(false)}
                      className="hover:bg-white/20 p-2 rounded transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-gray-800'} rounded-lg p-3 shadow`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChatMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
