'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';

export default function CleanupNotifications() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<string>('');

  const deleteAllNotifications = async () => {
    if (!confirm('Are you sure you want to delete ALL admin notifications from Firebase?')) {
      return;
    }

    setIsDeleting(true);
    setResult('');

    try {
      console.log('🗑️ Starting to delete all admin notifications...');
      
      // Get all admin notifications
      const querySnapshot = await getDocs(collection(db, 'adminNotifications'));
      
      console.log(`📊 Found ${querySnapshot.size} admin notifications`);
      
      if (querySnapshot.empty) {
        setResult('✅ No notifications found to delete');
        setIsDeleting(false);
        return;
      }
      
      // Delete all notifications one by one
      let deleted = 0;
      for (const document of querySnapshot.docs) {
        try {
          console.log(`Deleting: ${document.id}`);
          await deleteDoc(doc(db, 'adminNotifications', document.id));
          deleted++;
        } catch (error) {
          console.error(`Failed to delete ${document.id}:`, error);
        }
      }
      
      console.log(`✅ Successfully deleted ${deleted} admin notifications`);
      setResult(`✅ Successfully deleted ${deleted} out of ${querySnapshot.size} admin notifications`);
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Error deleting notifications:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={deleteAllNotifications}
        disabled={isDeleting}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <Trash2 className="w-4 h-4" />
        {isDeleting ? 'Deleting...' : 'Delete All Notifications'}
      </button>
      
      {result && (
        <div className={`mt-2 p-3 rounded-lg text-sm ${
          result.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {result}
        </div>
      )}
    </div>
  );
}
