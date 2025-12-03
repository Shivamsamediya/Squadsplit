import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC9ydJCyn2-pCeC7USXEQLJJ2QPBRGwflg",
  authDomain: "squadsplit-59e86.firebaseapp.com",
  projectId: "squadsplit-59e86",
  storageBucket: "squadsplit-59e86.firebasestorage.app",
  messagingSenderId: "109800043786",
  appId: "1:109800043786:web:c4a1bc456b262c8dd4f6f3",
  measurementId: "G-80C37LRW99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
