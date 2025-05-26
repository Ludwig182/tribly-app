// src/hooks/useAuth.js - Version ultra-minimale
import { useState, useEffect, useContext, createContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  console.log('🔄 AuthProvider démarré (version minimale)');
  
  // 🗃️ États d'authentification
  const [user, setUser] = useState(null);                    // Firebase User
  const [familyMember, setFamilyMember] = useState(null);    // Membre de la famille
  const [familyId, setFamilyId] = useState(null);            // ID famille actuelle
  const [loading, setLoading] = useState(false);             // Chargement actions
  const [initializing, setInitializing] = useState(true);    // Initialisation Firebase
  const [error, setError] = useState(null);

  // 🔄 Initialisation simplifiée (pas de Firebase Auth pour l'instant)
  useEffect(() => {
    console.log('🚀 Initialisation useAuth minimal...');
    
    // Simuler l'initialisation
    setTimeout(() => {
      setInitializing(false);
      console.log('✅ Initialisation terminée');
    }, 1000);
    
  }, []);

  // 🔐 ACTIONS D'AUTHENTIFICATION (version ultra-minimale)
  const authActions = {
    
    // 🧪 Mode test (connexion bypass pour développement)
    signInTestMode: async (testUserName = 'Ludwig Test') => {
      console.log('🧪 Mode test activé:', testUserName);
      
      setLoading(true);
      
      try {
        // Simuler un délai
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simuler un utilisateur Firebase pour les tests
        const mockUser = {
          uid: 'test-user-001',
          email: 'ludwig.test@tribly.com',
          displayName: testUserName,
          emailVerified: true
        };

        // Simuler un membre famille
        const mockMember = {
          id: 'user-001',
          name: testUserName,
          email: mockUser.email,
          role: 'admin',
          avatar: '👤',
          color: '#7986CB',
          tribs: 0
        };

        setUser(mockUser);
        setFamilyMember(mockMember);
        setFamilyId('famille-questroy-test');
        
        console.log('✅ Mode test connecté:', testUserName);
        
      } catch (error) {
        console.error('❌ Erreur mode test:', error);
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // 📧 Connexion Email (version simplifiée)
    signInWithEmail: async (email, password) => {
      console.log('🔄 Connexion email:', email);
      
      setLoading(true);
      setError(null);
      
      try {
        // Importer authService dynamiquement pour éviter les erreurs au démarrage
        const { authService } = await import('../services/authService');
        
        const result = await authService.signInWithEmail(email, password);
        
        if (result.user) {
          // Récupérer les données famille
          const familyData = await authService.getOrCreateFamilyMember(result.user);
          
          setUser(result.user);
          setFamilyMember(familyData.member);
          setFamilyId(familyData.familyId);
          
          console.log('✅ Connexion email réussie:', familyData.member.name);
        }
        
        return result;
        
      } catch (error) {
        console.error('❌ Erreur connexion email:', error);
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    
    // 📝 Inscription Email (version simplifiée)
    signUpWithEmail: async (email, password, displayName) => {
      console.log('🔄 Inscription email:', email);
      
      setLoading(true);
      setError(null);
      
      try {
        // Importer authService dynamiquement
        const { authService } = await import('../services/authService');
        
        const result = await authService.signUpWithEmail(email, password, displayName);
        
        if (result.user) {
          // Récupérer les données famille
          const familyData = await authService.getOrCreateFamilyMember(result.user);
          
          setUser(result.user);
          setFamilyMember(familyData.member);
          setFamilyId(familyData.familyId);
          
          console.log('✅ Inscription email réussie:', familyData.member.name);
        }
        
        return result;
        
      } catch (error) {
        console.error('❌ Erreur inscription email:', error);
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    
    // 🚪 Déconnexion
    signOut: async () => {
      console.log('🔄 Déconnexion...');
      
      setLoading(true);
      
      try {
        // Si on est en mode test, juste clear les états
        if (user?.uid === 'test-user-001') {
          setUser(null);
          setFamilyMember(null);
          setFamilyId(null);
          console.log('✅ Déconnexion mode test');
        } else {
          // Sinon utiliser Firebase Auth
          const { authService } = await import('../services/authService');
          await authService.signOut();
        }
        
      } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
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
    
    // Infos utilisateur faciles d'accès
    userEmail: user?.email || null,
    userName: familyMember?.name || user?.displayName || null,
    userRole: familyMember?.role || null,
    userTribs: familyMember?.tribs || 0,
    userAvatar: familyMember?.avatarUrl || familyMember?.avatar || '👤',
    
    // Actions
    ...authActions
  };

  console.log('🔄 AuthProvider render, isAuthenticated:', authState.isAuthenticated, 'initializing:', initializing);

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