// src/hooks/useFamily.js - Version sans Auth
import { useState, useEffect, useContext, createContext } from 'react';
import { familyService } from '../services/familyService';
import { tasksService } from '../services/tasksService';
import { shoppingService } from '../services/shoppingService';

const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
  const [familyData, setFamilyData] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ID de famille temporaire pour les tests
  const [familyId, setFamilyId] = useState('famille-questroy-test');

  useEffect(() => {
    if (!familyId) return;

    setLoading(true);
    
    const unsubscribeFamily = familyService.subscribeToFamily(familyId, (family, error) => {
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
      
      setFamilyData(family);
      
      if (family?.members && !currentMember) {
        const firstParent = family.members.find(m => m.role === 'parent');
        setCurrentMember(firstParent || family.members[0]);
      }
      setLoading(false);
    });

    const unsubscribeTasks = tasksService.subscribeToTasks(familyId, (tasksList, error) => {
      if (error) {
        console.error('Erreur tâches:', error);
        return;
      }
      setTasks(tasksList);
    });

    const unsubscribeShopping = shoppingService.subscribeToShoppingList(familyId, (items, error) => {
      if (error) {
        console.error('Erreur shopping:', error);
        return;
      }
      setShoppingItems(items);
    });

    return () => {
      unsubscribeFamily();
      unsubscribeTasks();
      unsubscribeShopping();
    };
  }, [familyId]);

  const familyActions = {
    switchMember: (member) => {
      setCurrentMember(member);
    },

    updateTribs: async (memberId, tribsChange) => {
      try {
        await familyService.updateMemberTribs(familyId, memberId, tribsChange);
      } catch (error) {
        console.error('Erreur update Tribs:', error);
      }
    },

    toggleShoppingItem: async (itemId, checked) => {
      try {
        await shoppingService.toggleShoppingItem(familyId, itemId, checked, currentMember?.id);
      } catch (error) {
        console.error('Erreur toggle article:', error);
      }
    }
  };

  const stats = {
    tasks: tasks.length > 0 ? tasksService.calculateTaskStats(tasks) : { urgent: 0, todo: 0, completed: 0, tribsEarned: 0 },
    shopping: shoppingItems.length > 0 ? shoppingService.calculateShoppingStats(shoppingItems) : { total: 0, toBuy: 0, inBasket: 0 },
    totalTribs: familyData?.members?.reduce((sum, member) => sum + (member.tribs || 0), 0) || 0
  };

  const value = {
    familyData,
    currentMember,
    tasks,
    shoppingItems,
    loading,
    error,
    stats,
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
