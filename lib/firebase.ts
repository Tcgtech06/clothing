import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCfKOAnasrr0o5qCk6TXz2xxt6a83ZCocw",
  authDomain: "lewore.firebaseapp.com",
  projectId: "lewore",
  storageBucket: "lewore.firebasestorage.app",
  messagingSenderId: "626499157972",
  appId: "1:626499157972:web:8ad04a09d4949c943a2041",
  measurementId: "G-9PNHJ2SDHP"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Analytics (only in browser)
let analytics: any;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, db, auth, analytics, storage };
