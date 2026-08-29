import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDl_VlsePCv0SsTdsnQkDm09EcW8eaiuUA",
  authDomain: "hospital-management-syst-66109.firebaseapp.com",
  projectId: "hospital-management-syst-66109",
  storageBucket: "hospital-management-syst-66109.firebasestorage.app",
  messagingSenderId: "443139300031",
  appId: "1:443139300031:web:4e4e3989cb8d950f0fc40a",
  measurementId: "G-KN95P5VGXQ"
};

// Initialize Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication & Cloud Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export { app };
export default app;
