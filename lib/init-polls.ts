// Utility to initialize poll data for all existing Firestore products
// Run this once to add poll data to products that don't have it

import { db } from './firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export async function initializePollsForAllProducts() {
  try {
    console.log('Starting poll initialization...');
    
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    let updated = 0;
    let skipped = 0;
    
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
        console.log(`✓ Initialized poll for: ${data.name}`);
        updated++;
      } else {
        console.log(`- Skipped (already has poll): ${data.name}`);
        skipped++;
      }
    }
    
    console.log(`\n✅ Poll initialization complete!`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Skipped: ${skipped} products`);
    
    return { updated, skipped };
  } catch (error) {
    console.error('Error initializing polls:', error);
    throw error;
  }
}
