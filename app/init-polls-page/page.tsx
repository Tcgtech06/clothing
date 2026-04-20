'use client';

import { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function InitPollsPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ updated: number; skipped: number } | null>(null);

  const initializePolls = async () => {
    setLoading(true);
    setStatus('Starting poll initialization...');
    
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      
      let updated = 0;
      let skipped = 0;
      
      setStatus(`Found ${snapshot.size} products. Checking each one...`);
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Check if poll data exists
        if (!data.poll) {
          // Add poll data
          await updateDoc(doc(db, 'products', docSnap.id), {
            poll: {
              best: 0,
              good: 0,
              average: 0,
              worst: 0
            }
          });
          setStatus(`✓ Initialized poll for: ${data.name}`);
          updated++;
        } else {
          setStatus(`- Skipped (already has poll): ${data.name}`);
          skipped++;
        }
      }
      
      setResults({ updated, skipped });
      setStatus('✅ Poll initialization complete!');
    } catch (error: any) {
      console.error('Error initializing polls:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Initialize Poll Data</h1>
        <p className="text-gray-600 mb-6">
          This page will add poll data (Best/Good/Average/Worst = 0) to all products in Firestore that don&apos;t have it yet.
        </p>

        <button
          onClick={initializePolls}
          disabled={loading}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {loading ? 'Initializing...' : 'Initialize Polls for All Products'}
        </button>

        {status && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-800 font-mono whitespace-pre-wrap">{status}</p>
          </div>
        )}

        {results && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2">Results:</h3>
            <p className="text-green-700">✓ Updated: {results.updated} products</p>
            <p className="text-green-700">- Skipped: {results.skipped} products (already had polls)</p>
            <p className="text-sm text-green-600 mt-4">
              You can now go back to the home page and all products should show poll colors!
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <Link href="/" className="text-primary hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
