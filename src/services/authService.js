// src/services/authService.js - Service Firebase Web SDK + Expo Auth Session
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCredential, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { familyService } from './familyService';

// 🔧 Configuration nécessaire pour expo-auth-session
WebBrowser.maybeCompleteAuthSession();

export const authService = {
  
  // 🔥 Instance Firebase (utilise la config existante de ton firebase.js)
  app: null,
  auth: null,

  // 🚀 Initialisation (à appeler au démarrage)
  initialize() {
    if (!this.app) {
      // Utiliser la même config que ton firebase.js existant
      const firebaseConfig = {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      };

      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      
      console.log('✅ Firebase Auth Web SDK initialisé');
    }
    
    return this.auth;
  },

  // 📱 Configuration Google Auth (pour le hook useAuth)
  getGoogleAuthConfig() {
    return {
      expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
      responseType: 'code',
    };
  },

  // 🔐 CONNEXION GOOGLE (Expo Auth Session + Firebase)
  async signInWithGoogle(authRequest, authResponse) {
    try {
      console.log('🔄 Démarrage connexion Google...');
      
      if (!this.auth) this.initialize();
      
      if (authResponse?.type !== 'success') {
        throw new Error('Connexion Google annulée ou échouée');
      }

      // 1. Échanger le code d'autorisation contre un token
      const tokenResponse = await Google.exchangeCodeAsync(
        {
          clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
          code: authResponse.params.code,
          extraParams: {},
          redirectUri: authRequest.redirectUri,
        },
        Google.Discovery
      );

      // 2. Créer un credential Firebase avec le token Google
      const credential = GoogleAuthProvider.credential(
        tokenResponse.idToken,
        tokenResponse.accessToken
      );

      // 3. Se connecter à Firebase avec le credential
      const userCredential = await signInWithCredential(this.auth, credential);
      
      console.log('✅ Connexion Google réussie:', userCredential.user.email);
      
      return {
        user: userCredential.user,
        tokenResponse: tokenResponse
      };
      
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
      throw this.handleAuthError(error);
    }
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
      
      // Erreurs Google OAuth
      'access_denied': 'Accès refusé par l\'utilisateur',
      'invalid_request': 'Requête invalide',
      
      // Erreurs génériques
      'default': error.message || 'Erreur d\'authentification inconnue'
    };
    
    const friendlyMessage = errorMap[error.code] || errorMap[error.error] || errorMap['default'];
    
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