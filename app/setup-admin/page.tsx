'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export default function SetupAdminPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [email, setEmail] = useState('admin@eshop.com');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSetup = async () => {
    setStatus('loading');
    setMessage('Creating admin account...');

    try {
      // Check if admin already exists
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setStatus('error');
        setMessage('Admin account already exists! You can now login.');
        return;
      }

      // Create admin document
      await addDoc(collection(db, 'admins'), {
        username: username,
        password: password,
        email: email,
        role: 'superadmin',
        createdAt: new Date(),
      });

      setStatus('success');
      setMessage('Admin account created successfully! You can now login at /admin-login');
    } catch (error: any) {
      console.error('Setup error:', error);
      setStatus('error');
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Setup</h1>
          <p className="text-purple-200">One-time setup to create admin account</p>
        </div>

        {/* Setup Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Admin@123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="admin@eshop.com"
              />
            </div>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              status === 'success' ? 'bg-green-50 border border-green-200' :
              status === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {status === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              {status === 'loading' && (
                <svg className="animate-spin w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <p className={`text-sm ${
                status === 'success' ? 'text-green-800' :
                status === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {message}
              </p>
            </div>
          )}

          {/* Setup Button */}
          <button
            onClick={handleSetup}
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Creating Admin Account...' : 
             status === 'success' ? 'Admin Account Created ✓' : 
             'Create Admin Account'}
          </button>

          {/* Success Actions */}
          {status === 'success' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <a
                href="/admin-login"
                className="block w-full text-center bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Go to Admin Login →
              </a>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800 font-medium mb-2">⚠️ Important:</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• This page should only be used once for initial setup</li>
                <li>• After creating the admin account, you can delete this page</li>
                <li>• Change the default password after first login</li>
                <li>• Make sure Firestore rules allow reading the admins collection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-purple-200">
            After setup, login at <span className="font-mono bg-purple-800 px-2 py-1 rounded">/admin-login</span>
          </p>
        </div>
      </div>
    </div>
  );
}
