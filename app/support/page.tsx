'use client';

import { useState } from 'react';
import { Mail, Phone, MessageCircle, Send, Headphones } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    email: '',
    phone: ''
  });
  const [submitted, setSubmitted] = useState(false);

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
                    <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
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
                  Go to &quot;My Orders&quot; section and click on any order to see detailed tracking information with real-time updates.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  What is your return policy?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  We offer a 7-day return policy from the date of delivery. Products must be unused and in original packaging.
                </p>
              </details>

              <details className="border-b border-gray-200 pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  How long does shipping take?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery.
                </p>
              </details>

              <details className="pb-4">
                <summary className="font-semibold text-gray-800 cursor-pointer hover:text-primary">
                  What payment methods do you accept?
                </summary>
                <p className="text-sm text-gray-600 mt-2 pl-4">
                  We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery for orders under ₹50,000.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
