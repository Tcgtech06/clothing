import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export async function POST() {
  try {
    console.log('🗑️ Starting to delete all admin notifications...');
    
    // Get all admin notifications
    const querySnapshot = await getDocs(collection(db, 'adminNotifications'));
    
    console.log(`📊 Found ${querySnapshot.size} admin notifications`);
    
    if (querySnapshot.empty) {
      return NextResponse.json({ 
        success: true, 
        message: 'No notifications to delete',
        count: 0 
      });
    }
    
    // Delete all notifications
    const deletePromises = querySnapshot.docs.map((document) => {
      console.log(`Deleting: ${document.id}`);
      return deleteDoc(doc(db, 'adminNotifications', document.id));
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully deleted ${deletePromises.length} admin notifications`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${deletePromises.length} admin notifications`,
      count: deletePromises.length 
    });
    
  } catch (error: any) {
    console.error('❌ Error deleting notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
