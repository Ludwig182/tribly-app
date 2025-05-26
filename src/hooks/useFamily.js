// src/hooks/useFamily.js - Version intégrée avec authentification
import { useState, useEffect, useContext, createContext } from 'react';
import { familyService } from '../services/familyService';
import { tasksService } from '../services/tasksService';
import { shoppingService } from '../services/shoppingService';

const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
  // 🗃️ États principaux
  const [familyData, setFamilyData] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔐 Intégration avec l'authentification
  const [familyId, setFamilyId] = useState(null);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  // 🔗 Hook pour se connecter à l'auth (si disponible)
  useEffect(() => {
    // Tenter d'importer useAuth de manière conditionnelle
    const tryConnectAuth = async () => {
      try {
        const { useAuth } = await import('./useAuth');
        const authContext = useAuth();
        
        if (authContext) {
          const { familyId: authFamilyId, familyMember, isAuthenticated } = authContext;
          
          if (isAuthenticated && authFamilyId && familyMember) {
            console.log('🔗 Connexion auth réussie:', familyMember.name);
            setFamilyId(authFamilyId);
            setCurrentMember(familyMember);
            setAuthenticatedUser(familyMember);
            return;
          }
        }
      } catch (error) {
        console.log('⚠️ Auth non disponible, utilisation mode test');
      }
      
      // 🧪 Fallback : mode test avec données statiques
      console.log('🧪 Mode test activé');
      setFamilyId('famille-questroy-test');
      
      // Utiliser Rosaly comme utilisateur par défaut
      const defaultMember = {
        id: 'user-002',
        name: 'Rosaly',
        role: 'parent',
        email: 'rosaly@questroy.com',
        tribs: 235
      };
      setCurrentMember(defaultMember);
    };

    tryConnectAuth();
  }, []);

  // 🔄 Effet principal pour les données Firebase
  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    console.log('🔄 Initialisation données famille:', familyId);
    setLoading(true);
    
    // 👥 Écouter les données famille
    const unsubscribeFamily = familyService.subscribeToFamily(familyId, (family, error) => {
      if (error) {
        console.error('❌ Erreur famille:', error);
        setError(error);
        setLoading(false);
        return;
      }
      
      if (family) {
        console.log('✅ Données famille reçues:', family.familyName || family.name);
        setFamilyData(family);
        
        // 🎯 Si pas de membre actuel ET pas d'auth, utiliser le premier parent
        if (!currentMember && !authenticatedUser && family.members) {
          const firstParent = family.members.find(m => m.role === 'parent' || m.role === 'admin');
          const fallbackMember = firstParent || family.members[0];
          
          if (fallbackMember) {
            console.log('👤 Membre par défaut:', fallbackMember.name);
            setCurrentMember(fallbackMember);
          }
        }
      }
      
      setLoading(false);
    });

    // ✅ Écouter les tâches
    const unsubscribeTasks = tasksService.subscribeToTasks(familyId, (tasksList, error) => {
      if (error) {
        console.error('❌ Erreur tâches:', error);
        return;
      }
      
      if (tasksList) {
        console.log('✅ Tâches reçues:', tasksList.length);
        setTasks(tasksList);
      }
    });

    // 🛒 Écouter la liste de courses
    const unsubscribeShopping = shoppingService.subscribeToShoppingList(familyId, (items, error) => {
      if (error) {
        console.error('❌ Erreur shopping:', error);
        return;
      }
      
      if (items) {
        console.log('✅ Articles shopping reçus:', items.length);
        setShoppingItems(items);
      }
    });

    // 🧹 Cleanup
    return () => {
      console.log('🧹 Cleanup useFamily');
      unsubscribeFamily();
      unsubscribeTasks();
      unsubscribeShopping();
    };
  }, [familyId]);

  // 📊 Statistiques calculées
  const stats = {
    tasks: tasks.length > 0 
      ? tasksService.calculateTaskStats(tasks) 
      : { urgent: 0, todo: 0, completed: 0, tribsEarned: 0 },
      
    shopping: shoppingItems.length > 0 
      ? shoppingService.calculateShoppingStats(shoppingItems) 
      : { total: 0, toBuy: 0, inBasket: 0 },
      
    totalTribs: familyData?.members?.reduce((sum, member) => sum + (member.tribs || 0), 0) || 0,
    
    membersOnline: familyData?.members?.filter(m => m.status === 'online' || true).length || 0,
    totalMembers: familyData?.members?.length || 0
  };

  // 🎯 Actions famille
  const familyActions = {
    // 👤 Changer d'utilisateur actuel (pour tests ou changement de profil)
    switchMember: (member) => {
      console.log('👤 Changement membre:', member.name);
      setCurrentMember(member);
    },

    // 🏆 Mettre à jour les Tribs d'un membre
    updateTribs: async (memberId, tribsChange) => {
      try {
        console.log('🏆 Mise à jour Tribs:', { memberId, tribsChange });
        await familyService.updateMemberTribs(familyId, memberId, tribsChange);
      } catch (error) {
        console.error('❌ Erreur update Tribs:', error);
        setError(error.message);
      }
    },

    // 🛒 Toggle article de courses
    toggleShoppingItem: async (itemId, checked) => {
      try {
        const memberId = currentMember?.id;
        if (!memberId) {
          throw new Error('Aucun membre sélectionné');
        }
        
        console.log('🛒 Toggle article:', { itemId, checked, memberId });
        await shoppingService.toggleShoppingItem(familyId, itemId, checked, memberId);
        
      } catch (error) {
        console.error('❌ Erreur toggle article:', error);
        setError(error.message);
      }
    },

    // ✅ Marquer tâche comme terminée
    completeTask: async (taskId) => {
      try {
        const memberId = currentMember?.id;
        if (!memberId) {
          throw new Error('Aucun membre sélectionné');
        }
        
        console.log('✅ Complétion tâche:', { taskId, memberId });
        await tasksService.completeTask(familyId, taskId, memberId);
        
        // Calculer les Tribs gagnés
        const task = tasks.find(t => t.id === taskId);
        if (task && task.tribs) {
          await familyActions.updateTribs(memberId, task.tribs);
        }
        
      } catch (error) {
        console.error('❌ Erreur complétion tâche:', error);
        setError(error.message);
      }
    },

    // 🔄 Rafraîchir les données
    refresh: async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (familyId) {
          const freshFamily = await familyService.getFamily(familyId);
          setFamilyData(freshFamily);
        }
        
      } catch (error) {
        console.error('❌ Erreur rafraîchissement:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },

    // 🧹 Effacer l'erreur
    clearError: () => {
      setError(null);
    }
  };

  // 🎯 Valeur du contexte
  const value = {
    // États principaux
    familyData,
    currentMember,
    tasks,
    shoppingItems,
    loading,
    error,
    stats,
    
    // Infos auth
    familyId,
    authenticatedUser,
    isAuthenticated: !!authenticatedUser,
    
    // États calculés utiles
    familyName: familyData?.familyName || familyData?.name || 'Famille',
    familyCode: familyData?.familyCode || 'QUESTROY-L4K8',
    
    // Actions
    ...familyActions
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily doit être utilisé dans un FamilyProvider');
  }
  return context;
};