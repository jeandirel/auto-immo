// Firebase Configuration
// IMPORTANT: Replace these values with your Firebase project credentials
// Get them from: https://console.firebase.google.com/ > Project Settings > General

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBSq4wz0Jc-ikrS81Wq1hUXSgjHLWfunuc",
    authDomain: "auto-immo-gabon.firebaseapp.com",
    projectId: "auto-immo-gabon",
    storageBucket: "auto-immo-gabon.firebasestorage.app",
    messagingSenderId: "874959998800",
    appId: "1:874959998800:web:deacfc05405a78953c2655"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
