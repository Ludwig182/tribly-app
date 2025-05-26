// src/services/authService.js - Version minimale sans expo-auth-session
import { initializeApp } from 'firebase/app';
import { 
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { familyService } from './familyService';

export const authService = {
  
  // 🔥 Instance Firebase
  app: null,
  auth: null,

  // 🚀 Initialisation avec AsyncStorage persistence
  initialize() {
    if (!this.app) {
      console.log('🔄 Initialisation Firebase Auth avec persistence...');
      
      try {
        // Utiliser la même config que firebase.js
        const firebaseConfig = {
          apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        };

        this.app = initializeApp(firebaseConfig, 'auth-app');
        
        // 🗃️ Initialiser Auth avec AsyncStorage persistence
        this.auth = initializeAuth(this.app, {
          persistence: getReactNativePersistence(AsyncStorage)
        });
        
        console.log('✅ Firebase Auth initialisé avec persistence AsyncStorage');
        
      } catch (error) {
        console.error('❌ Erreur init Firebase Auth:', error);
        // Fallback sans persistence
        const { getAuth } = require('firebase/auth');
        this.auth = getAuth(this.app);
        console.log('⚠️ Firebase Auth initialisé sans persistence');
      }
    }
    
    return this.auth;
  },

  // 📧 CONNEXION EMAIL/PASSWORD
  async signInWithEmail(email, password) {
    try {
      if (!this.auth) this.initialize();
      
      console.log('🔄 Connexion email:', email);
      
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Connexion email réussie');
      
      return {
        user: userCredential.user
      };
      
    } catch (error) {
      console.error('❌ Erreur connexion email:', error);
      throw this.handleAuthError(error);
    }
  },

  // 📝 INSCRIPTION EMAIL/PASSWORD
  async signUpWithEmail(email, password, displayName) {
    try {
      if (!this.auth) this.initialize();
      
      console.log('🔄 Inscription email:', email);
      
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Mettre à jour le profil utilisateur
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      console.log('✅ Inscription email réussie');
      
      return {
        user: userCredential.user
      };
      
    } catch (error) {
      console.error('❌ Erreur inscription email:', error);
      throw this.handleAuthError(error);
    }
  },

  // 🚪 DÉCONNEXION
  async signOut() {
    try {
      if (!this.auth) this.initialize();
      
      console.log('🔄 Déconnexion...');
      await signOut(this.auth);
      console.log('✅ Déconnexion réussie');
      
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw this.handleAuthError(error);
    }
  },

  // 👤 UTILISATEUR ACTUEL
  getCurrentUser() {
    if (!this.auth) this.initialize();
    return this.auth.currentUser;
  },

  // 👂 ÉCOUTER LES CHANGEMENTS D'AUTHENTIFICATION
  onAuthStateChanged(callback) {
    if (!this.auth) this.initialize();
    return onAuthStateChanged(this.auth, callback);
  },

  // 🔍 RÉCUPÉRER OU CRÉER PROFIL MEMBRE DANS FAMILLE
  async getOrCreateFamilyMember(firebaseUser, familyId = null) {
    try {
      console.log('🔄 Récupération/création membre famille...');
      
      // 1. Si pas de familyId fourni, utiliser la famille de test
      const targetFamilyId = familyId || 'famille-questroy-test';
      
      // 2. Récupérer la famille
      const family = await familyService.getFamily(targetFamilyId);
      
      // 3. Chercher l'utilisateur dans les membres de la famille
      const existingMember = family.members?.find(member => 
        member.email === firebaseUser.email ||
        member.firebaseUid === firebaseUser.uid
      );
      
      if (existingMember) {
        console.log('✅ Membre existant trouvé:', existingMember.name);
        
        // Mettre à jour le firebaseUid si pas déjà fait
        if (!existingMember.firebaseUid) {
          await familyService.updateMember(targetFamilyId, existingMember.id, {
            firebaseUid: firebaseUser.uid,
            lastLoginAt: new Date().toISOString()
          });
        }
        
        return {
          member: existingMember,
          familyId: targetFamilyId,
          isNewMember: false
        };
      }
      
      // 4. Si pas trouvé, créer un nouveau membre
      console.log('🆕 Création nouveau membre famille...');
      
      const newMemberData = {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
        email: firebaseUser.email,
        firebaseUid: firebaseUser.uid,
        role: family.members?.length === 0 ? 'admin' : 'child', // Premier utilisateur = admin
        avatar: '👤',
        color: '#7986CB',
        tribs: 0,
        joinedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        invitedBy: null,
        approvedBy: 'auto',
        approvedAt: new Date().toISOString()
      };
      
      const newMember = await familyService.addMember(targetFamilyId, newMemberData);
      
      console.log('✅ Nouveau membre créé:', newMember.name);
      
      return {
        member: newMember,
        familyId: targetFamilyId,
        isNewMember: true
      };
      
    } catch (error) {  
      console.error('❌ Erreur gestion membre famille:', error);
      throw error;
    }
  },

  // 🔍 REJOINDRE FAMILLE AVEC CODE
  async joinFamilyWithCode(familyCode) {
    try {
      console.log('🔄 Rejoindre famille avec code:', familyCode);
      
      // TODO: Implémenter recherche par familyCode dans familyService
      if (familyCode.toUpperCase() === 'QUESTROY-L4K8') {
        return 'famille-questroy-test';
      }
      
      throw new Error('Code famille invalide');
      
    } catch (error) {
      console.error('❌ Erreur rejoindre famille:', error);
      throw error;
    }
  },

  // 🛠️ GESTION DES ERREURS
  handleAuthError(error) {
    const errorMap = {
      // Erreurs Firebase Auth
      'auth/user-not-found': 'Utilisateur non trouvé',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/email-already-in-use': 'Email déjà utilisé',
      'auth/weak-password': 'Mot de passe trop faible (min. 6 caractères)',
      'auth/invalid-email': 'Email invalide',
      'auth/user-disabled': 'Compte utilisateur désactivé',
      'auth/too-many-requests': 'Trop de tentatives, réessayez plus tard',
      'auth/network-request-failed': 'Erreur réseau',
      'auth/invalid-credential': 'Identifiants invalides',
      
      // Erreurs génériques
      'default': error.message || 'Erreur d\'authentification inconnue'
    };
    
    const friendlyMessage = errorMap[error.code] || errorMap['default'];
    
    return new Error(friendlyMessage);
  },

  // 🧪 MÉTHODES DE DEBUG/TEST  
  async debugCurrentAuth() {
    console.log('🔍 === DEBUG AUTHENTIFICATION ===');
    
    try {
      if (!this.auth) this.initialize();
      
      const currentUser = this.getCurrentUser();
      console.log('- Firebase User:', currentUser ? currentUser.email : 'Non connecté');
      console.log('- Firebase UID:', currentUser ? currentUser.uid : 'N/A');
      console.log('- Display Name:', currentUser ? currentUser.displayName : 'N/A');
      
    } catch (error) {
      console.error('❌ Erreur debug auth:', error);
    }
  }
};