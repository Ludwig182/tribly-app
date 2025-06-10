// src/config/firebase.js - Version multi-plateforme
import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth,
  connectAuthEmulator 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 🔧 Auth avec persistence adaptée à la plateforme
export let auth;

try {
  // Détection de la plateforme
  const isWeb = Platform.OS === 'web';
  
  if (isWeb) {
    // 🌐 Version WEB : utilise l'auth par défaut
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialisé pour le WEB');
    
  } else {
    // 📱 Version MOBILE : utilise AsyncStorage
    const { getReactNativePersistence } = require('firebase/auth');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('✅ Firebase Auth initialisé pour MOBILE (AsyncStorage)');
  }
  
} catch (error) {
  console.error('❌ Erreur initialisation Firebase Auth:', error);
  
  // Fallback : utiliser l'auth par défaut
  auth = getAuth(app);
  console.log('⚠️ Firebase Auth initialisé en mode fallback');
}

export const storage = getStorage(app);

// Configuration des notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}