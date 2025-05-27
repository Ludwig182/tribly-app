// src/hooks/useAuth.js – Version avec Google Auth
import React, { useState, useEffect, useContext, createContext } from 'react';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext(null);

/* -------------------------------------------------------------------------- */
/*                                AuthProvider                                */
/* -------------------------------------------------------------------------- */
export const AuthProvider = ({ children }) => {
  /** États principaux */
  const [user, setUser] = useState(null);
  const [familyMember, setFamilyMember] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Écoute Firebase – persiste entre relances grâce à AsyncStorage */
  useEffect(() => {
    console.log('🚀 Initialisation useAuth');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🧩 [onAuthStateChanged] firebaseUser:', firebaseUser);
      if (firebaseUser) {
        // Récupère ou crée le membre dans la famille
        const { authService } = await import('../services/authService');
        const { member, familyId: famId } =
          await authService.getOrCreateFamilyMember(firebaseUser);

        setUser(firebaseUser);
        setFamilyMember(member);
        setFamilyId(famId);
      } else {
        // Déconnexion
        setUser(null);
        setFamilyMember(null);
        setFamilyId(null);
      }
      setLoading(false);
    });

    return unsubscribe; // nettoyage on unmount
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                                 Actions                                */
  /* ---------------------------------------------------------------------- */

  /** 🔧 Mode test (aucune requête Firebase) */
  const signInTestMode = async (testName = 'Ludwig Test') => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));   // petit délai visuel

      const mockUser = {
        uid: 'test-user-001',
        email: 'ludwig.test@tribly.com',
        displayName: testName
      };
      const mockMember = {
        id: 'user-001',
        name: testName,
        role: 'admin',
        tribs: 0,
        color: '#7986CB',
        avatar: '👤'
      };
      setUser(mockUser);
      setFamilyMember(mockMember);
      setFamilyId('famille-questroy-test');
    } finally {
      setLoading(false);
    }
  };

  /** 📧 Connexion e-mail */
  const signInWithEmail = async (email, pwd) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pwd);
      // getOrCreateFamilyMember est appelé par le listener onAuthStateChanged
      return cred.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** 🟦 Connexion Google */
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { authService } = await import('../services/authService');
      const result = await authService.signInWithGoogle();
      // getOrCreateFamilyMember est appelé par le listener onAuthStateChanged
      return result.user;
    } catch (err) {
      console.error('❌ Erreur Google Sign-In dans useAuth:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** 📝 Inscription e-mail */
  const signUpWithEmail = async (email, pwd, displayName) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pwd);
      // listener fera la suite
      if (displayName) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(cred.user, { displayName });
      }
      return cred.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** 🚪 Déconnexion */
  const signOut = async () => {
    setLoading(true);
    try {
      // si on est en mode test, simple reset local
      if (user?.uid === 'test-user-001') {
        setUser(null);
        setFamilyMember(null);
        setFamilyId(null);
      } else {
        // Utiliser authService pour gérer Google + Firebase
        const { authService } = await import('../services/authService');
        await authService.signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                               Valeur fournie                           */
  /* ---------------------------------------------------------------------- */
  const value = {
    /* données */
    user,
    familyMember,
    familyId,
    loading,
    error,

    /* helpers booléens */
    isAuthenticated: !!user,
    isLoading: loading,
    isAdmin: familyMember?.role === 'admin',
    isParent: ['admin', 'parent'].includes(familyMember?.role),

    /* infos rapides */
    userName: familyMember?.name || user?.displayName || null,
    userEmail: user?.email || null,
    userTribs: familyMember?.tribs || 0,
    userAvatar: familyMember?.avatarUrl || familyMember?.avatar || '👤',

    /* actions */
    signInTestMode,
    signInWithEmail,
    signInWithGoogle,  // 🆕 Ajout Google Auth
    signUpWithEmail,
    signOut,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* -------------------------------------------------------------------------- */
/*                                   Hooks                                   */
/* -------------------------------------------------------------------------- */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const useAuthState = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
};