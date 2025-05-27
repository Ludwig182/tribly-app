// src/services/authService.js – Version multi-plateforme
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup
} from 'firebase/auth';
import { Platform } from 'react-native';
import { familyService } from './familyService';

export const authService = {
  /* ───────── Auth Email ───────── */
  async signInWithEmail(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: cred.user };
  },

  async signUpWithEmail(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    return { user: cred.user };
  },

  /* ───────── Auth Google Multi-plateforme ───────── */
  async signInWithGoogle() {
    try {
      console.log('🔄 Début authentification Google...');
      
      // Détection de la plateforme
      const isWeb = Platform.OS === 'web';
      
      if (isWeb) {
        // 🌐 VERSION WEB : signInWithPopup
        return await this.signInWithGoogleWeb();
      } else {
        // 📱 VERSION MOBILE : expo-auth-session
        return await this.signInWithGoogleMobile();
      }
      
    } catch (error) {
      console.error('❌ Erreur Google Sign-In:', error);
      throw this.formatGoogleError(error);
    }
  },

  /* ───────── Auth Google WEB ───────── */
  async signInWithGoogleWeb() {
    console.log('🌐 Authentification Google Web...');
    
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    
    console.log('✅ Authentification Google Web réussie:', result.user.email);
    return { user: result.user };
  },

  /* ───────── Auth Google MOBILE ───────── */
  async signInWithGoogleMobile() {
    console.log('📱 Authentification Google Mobile...');
    
    // Import dynamique pour éviter les erreurs web
    const AuthSession = await import('expo-auth-session');
    const WebBrowser = await import('expo-web-browser');
    
    WebBrowser.maybeCompleteAuthSession();

    // Configuration OAuth Google
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
                     '172169964683-your-web-client-id.apps.googleusercontent.com';
    
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    console.log('🔗 Redirect URI:', redirectUri);

    // Configuration de la requête OAuth
    const request = new AuthSession.AuthRequest({
      clientId: clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      additionalParameters: {},
      extraParams: {
        nonce: Math.random().toString(36).substring(2, 15),
      },
    });

    // Déclencher le flow OAuth
    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      useProxy: true,
    });

    console.log('📱 Résultat OAuth:', result.type);

    if (result.type !== 'success') {
      if (result.type === 'cancel') {
        throw new Error('Connexion annulée par l\'utilisateur');
      }
      throw new Error('Échec de l\'authentification Google');
    }

    // Extraire l'ID token de la réponse
    const { id_token } = result.params;
    
    if (!id_token) {
      throw new Error('Token Google non reçu');
    }

    console.log('✅ Token Google reçu (Mobile)');

    // Créer les credentials Firebase
    const googleCredential = GoogleAuthProvider.credential(id_token);

    // Se connecter à Firebase
    const cred = await signInWithCredential(auth, googleCredential);

    console.log('✅ Authentification Firebase réussie (Mobile):', cred.user.email);
    return { user: cred.user };
  },

  /* ───────── Helpers ───────── */
  formatGoogleError(error) {
    let friendlyMessage = error.message;

    if (error.code === 'auth/network-request-failed') {
      friendlyMessage = 'Problème de connexion internet';
    } else if (error.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Connexion annulée par l\'utilisateur';
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      friendlyMessage = 'Un compte existe déjà avec cet email';
    } else if (error.toString().includes('Invalid client ID')) {
      friendlyMessage = 'Configuration Google incomplète';
    } else if (error.code === 'auth/popup-blocked') {
      friendlyMessage = 'Popup bloquée par le navigateur. Autorisez les popups pour ce site.';
    }

    return new Error(friendlyMessage);
  },

  async signOut() {
    try {
      // Déconnexion Firebase (compatible toutes plateformes)
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw error;
    }
  },

  /* ───────── Famille ───────── */
  async getOrCreateFamilyMember(firebaseUser, familyId = 'famille-questroy-test') {
    console.log('🧩 Firebase user reçu :', {
      email: firebaseUser.email,
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL
    });
    
    const family = await familyService.getFamily(familyId);
    console.log('👪 Famille récupérée :', family.familyName);
    console.log('🔎 Membres de la famille :', family.members.map(m => ({
      name: m.name,
      email: m.email,
      firebaseUid: m.firebaseUid
    })));
    
    const found = family.members?.find(m =>
      m.email === firebaseUser.email || m.firebaseUid === firebaseUser.uid
    );
    console.log('🔗 Membre correspondant trouvé :', found ? found.name : '❌ Aucun');

    if (found) {
      // Si le membre existe mais n'a pas de photo et que Google en fournit une
      if (!found.avatarUrl && firebaseUser.photoURL) {
        try {
          await familyService.updateMember(familyId, found.id, {
            avatarUrl: firebaseUser.photoURL
          });
          console.log('📸 Photo Google ajoutée au profil');
          found.avatarUrl = firebaseUser.photoURL;
        } catch (error) {
          console.warn('⚠️ Impossible d\'ajouter la photo Google:', error);
        }
      }
      
      return { member: found, familyId, isNewMember: false };
    }

    const newMemberData = {
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      email: firebaseUser.email,
      firebaseUid: firebaseUser.uid,
      role: family.members?.length ? 'child' : 'admin',
      avatar: '👤',
      avatarUrl: firebaseUser.photoURL || null,
      color: '#7986CB',
      tribs: 0,
      joinedAt: new Date().toISOString()
    };
    
    console.log('➕ Nouveau membre à créer :', newMemberData);
    const member = await familyService.addMember(familyId, newMemberData);

    return { member, familyId, isNewMember: true };
  }
};