// src/hooks/useAuth.js - Hook Authentication global Expo + Firebase Web SDK  
import { useState, useEffect, useContext, createContext } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 🗃️ États d'authentification
  const [user, setUser] = useState(null);                    // Firebase User
  const [familyMember, setFamilyMember] = useState(null);    // Membre de la famille
  const [familyId, setFamilyId] = useState(null);            // ID famille actuelle
  const [loading, setLoading] = useState(true);              // Chargement actions
  const [initializing, setInitializing] = useState(true);    // Initialisation Firebase
  const [error, setError] = useState(null);

  // 📱 Configuration Google Auth Request (Expo Hook)
  const [googleAuthRequest, googleAuthResponse, promptGoogleAsync] = Google.useAuthRequest(
    authService.getGoogleAuthConfig()
  );

  // 🔄 Effet pour traiter la réponse Google Auth
  useEffect(() => {
    if (googleAuthResponse) {
      handleGoogleAuthResponse();
    }
  }, [googleAuthResponse]);

  // 🔄 Fonction appelée quand l'état d'auth Firebase change
  const onAuthStateChanged = async (firebaseUser) => {
    console.log('🔄 AuthState changed:', firebaseUser ? firebaseUser.email : 'Déconnecté');
    
    try {
      setLoading(true);
      setError(null);
      
      if (firebaseUser) {
        // Utilisateur connecté → récupérer/créer profil famille
        const familyData = await authService.getOrCreateFamilyMember(firebaseUser);
        
        setUser(firebaseUser);
        setFamilyMember(familyData.member);
        setFamilyId(familyData.familyId);
        
        console.log('✅ Utilisateur authentifié:', familyData.member.name);
        
      } else {
        // Utilisateur déconnecté → clear state
        setUser(null);
        setFamilyMember(null);
        setFamilyId(null);
        
        console.log('✅ Utilisateur déconnecté');
      }
      
    } catch (error) {
      console.error('❌ Erreur AuthState:', error);
      setError(error.message);
      
      // En cas d'erreur, déconnecter proprement
      setUser(null);
      setFamilyMember(null);
      setFamilyId(null);
      
    } finally {
      setLoading(false);
      if (initializing) setInitializing(false);
    }
  };

  // 🔄 Traiter la réponse Google Auth
  const handleGoogleAuthResponse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Traitement réponse Google Auth...');
      
      const result = await authService.signInWithGoogle(googleAuthRequest, googleAuthResponse);
      
      // L'état sera mis à jour automatiquement via onAuthStateChanged
      console.log('✅ Connexion Google traitée');
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur traitement Google Auth:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // 🚀 Initialisation du hook
  useEffect(() => {
    console.log('🚀 Initialisation useAuth...');
    
    // 1. Initialiser Firebase Auth
    authService.initialize();
    
    // 2. Écouter les changements d'authentification Firebase
    const unsubscribe = authService.onAuthStateChanged(onAuthStateChanged);
    
    // 3. Cleanup function
    return () => {
      console.log('🧹 Cleanup useAuth');
      unsubscribe();
    };
  }, []);

  // 🔐 ACTIONS D'AUTHENTIFICATION
  const authActions = {
    
    // 🔑 Connexion Google (déclenche le flow Expo)
    signInWithGoogle: async () => {
      try {
        setError(null);
        
        console.log('🔄 Déclenchement connexion Google...');
        
        if (!googleAuthRequest) {
          throw new Error('Requête Google Auth non prête');
        }
        
        // Déclencher le flow OAuth Google via Expo
        await promptGoogleAsync();
        
        // La suite sera traitée dans handleGoogleAuthResponse
        console.log('✅ Flow Google Auth déclenché');
        
      } catch (error) {
        console.error('❌ Erreur déclenchement Google:', error);
        setError(error.message);
        throw error;
      }
    },
    
    // 📧 Connexion Email
    signInWithEmail: async (email, password) => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Tentative connexion email...');
        const result = await authService.signInWithEmail(email, password);
        
        console.log('✅ Connexion email initiée');
        return result;
        
      } catch (error) {
        console.error('❌ Erreur connexion email:', error);
        setError(error.message);
        setLoading(false);
        throw error;
      }
    },
    
    // 📝 Inscription Email
    signUpWithEmail: async (email, password, displayName) => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Tentative inscription email...');
        const result = await authService.signUpWithEmail(email, password, displayName);
        
        console.log('✅ Inscription email initiée');
        return result;
        
      } catch (error) {
        console.error('❌ Erreur inscription email:', error);
        setError(error.message);
        setLoading(false);
        throw error;
      }
    },
    
    // 🚪 Déconnexion
    signOut: async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Déconnexion...');
        await authService.signOut();
        
        // L'état sera mis à jour automatiquement via onAuthStateChanged
        console.log('✅ Déconnexion initiée');
        
      } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
        setError(error.message);
        setLoading(false);
        throw error;
      }
    },
    
    // 👥 Rejoindre famille avec code
    joinFamilyWithCode: async (familyCode) => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Rejoindre famille:', familyCode);
        
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }
        
        const newFamilyId = await authService.joinFamilyWithCode(familyCode);
        
        // Re-initialiser avec la nouvelle famille
        const familyData = await authService.getOrCreateFamilyMember(user, newFamilyId);
        
        setFamilyMember(familyData.member);
        setFamilyId(familyData.familyId);
        
        console.log('✅ Famille rejointe:', newFamilyId);
        
        return familyData;
        
      } catch (error) {
        console.error('❌ Erreur rejoindre famille:', error);
        setError(error.message);
        setLoading(false);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    
    // 🔄 Rafraîchir profil membre
    refreshFamilyMember: async () => {
      try {
        if (!user || !familyId) {
          throw new Error('Utilisateur ou famille non défini');
        }
        
        const familyData = await authService.getOrCreateFamilyMember(user, familyId);
        setFamilyMember(familyData.member);
        
        console.log('✅ Profil membre rafraîchi');
        return familyData.member;
        
      } catch (error) {
        console.error('❌ Erreur rafraîchissement membre:', error);
        setError(error.message);
        throw error;
      }
    },
    
    // 🧹 Clear erreur
    clearError: () => {
      setError(null);
    }
  };

  // 🎯 États calculés
  const authState = {
    // États principaux
    user,                    // Firebase User (auth)
    familyMember,           // Membre famille (profil complet)
    familyId,               // ID famille actuelle
    
    // États UI
    loading,                // Loading des actions auth
    initializing,           // Initialisation Firebase en cours
    error,                  // Erreur auth
    
    // États booléens pratiques
    isAuthenticated: !!user,
    isLoading: loading || initializing,
    hasFamily: !!familyId,
    isAdmin: familyMember?.role === 'admin',
    isParent: familyMember?.role === 'admin' || familyMember?.role === 'parent',
    
    // États Google Auth
    googleAuthRequest,      // Requête Google Auth (Expo)
    googleAuthResponse,     // Réponse Google Auth (Expo)
    
    // Infos utilisateur faciles d'accès
    userEmail: user?.email || null,
    userName: familyMember?.name || user?.displayName || null,
    userRole: familyMember?.role || null,
    userTribs: familyMember?.tribs || 0,
    userAvatar: familyMember?.avatarUrl || familyMember?.avatar || '👤',
    
    // Actions
    ...authActions
  };

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// 🎯 Hook simplifié pour juste savoir si connecté
export const useAuthState = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
};