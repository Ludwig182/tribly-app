// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';           // ← module principal

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: '…',
  authDomain: 'tribly-fd1d8.firebaseapp.com',
  projectId: 'tribly-fd1d8',
  storageBucket: 'tribly-fd1d8.appspot.com',
  messagingSenderId: '…',
  appId: '…'
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);     // ← instance Firestore partagée

/* Auth unique avec persistance AsyncStorage */
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

/* Log de contrôle — doit apparaître AVANT toute erreur */
console.log('✅ Firebase Auth initialisé (config/firebase.js)');
