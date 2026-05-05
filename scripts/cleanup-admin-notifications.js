// Script to delete all admin notifications from Firebase
// Run with: node scripts/cleanup-admin-notifications.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // You'll need to download this from Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteAllAdminNotifications() {
  try {
    console.log('🗑️ Starting to delete all admin notifications...');
    
    const snapshot = await db.collection('adminNotifications').get();
    
    console.log(`Found ${snapshot.size} admin notifications`);
    
    if (snapshot.empty) {
      console.log('✅ No notifications to delete');
      return;
    }
    
    const batch = db.batch();
    let count = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });
    
    await batch.commit();
    
    console.log(`✅ Successfully deleted ${count} admin notifications`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting notifications:', error);
    process.exit(1);
  }
}

deleteAllAdminNotifications();
