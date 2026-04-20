import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDP11WcYT0lwfV8h46tJFPDtYrDqwgJ_do",
  authDomain: "vilvah.firebaseapp.com",
  projectId: "vilvah",
  storageBucket: "vilvah.firebasestorage.app",
  messagingSenderId: "774110630764",
  appId: "1:774110630764:web:83d266dedd45b729c71949",
  measurementId: "G-F9HLDTDYPD"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, db, auth, analytics, storage };
