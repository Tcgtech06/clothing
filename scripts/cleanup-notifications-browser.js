// Browser Console Script to Delete All Admin Notifications
// 
// INSTRUCTIONS:
// 1. Open your admin dashboard in the browser
// 2. Open browser console (F12 or Right-click > Inspect > Console)
// 3. Copy and paste this entire script into the console
// 4. Press Enter to run
//
// This will delete ALL admin notifications from Firebase

(async function deleteAllAdminNotifications() {
  try {
    console.log('🗑️ Starting to delete all admin notifications...');
    
    // Import Firebase functions
    const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase.ts');
    
    // Get all admin notifications
    const querySnapshot = await getDocs(collection(db, 'adminNotifications'));
    
    console.log(`📊 Found ${querySnapshot.size} admin notifications`);
    
    if (querySnapshot.empty) {
      console.log('✅ No notifications to delete');
      return;
    }
    
    // Delete all notifications
    const deletePromises = [];
    querySnapshot.forEach((document) => {
      console.log(`Deleting: ${document.id}`);
      deletePromises.push(deleteDoc(doc(db, 'adminNotifications', document.id)));
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully deleted ${deletePromises.length} admin notifications from Firebase`);
    alert(`✅ Deleted ${deletePromises.length} admin notifications!`);
    
  } catch (error) {
    console.error('❌ Error deleting notifications:', error);
    alert('❌ Error: ' + error.message);
  }
})();
