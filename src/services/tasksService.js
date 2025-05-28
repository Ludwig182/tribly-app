// src/services/tasksService.js - Version étendue avec permissions et Tribs
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { familyService } from './familyService';

export const tasksService = {

  // ===== MÉTHODES DE BASE =====

  getTasksCollection(familyId) {
    return collection(db, 'families', familyId, 'tasks');
  },

  // 🆕 Calcul Tribs selon difficulté + bonus
  calculateTribs(difficulty = 'medium', hasDeadline = false, isUrgent = false) {
    const baseTribsMap = {
      easy: 10,
      medium: 20,  
      hard: 40
    };
    
    let tribs = baseTribsMap[difficulty] || 20;
    
    // Bonus pour deadline
    if (hasDeadline) {
      tribs += 5;
    }
    
    // Bonus pour urgence
    if (isUrgent) {
      tribs += 10;
    }
    
    return tribs;
  },

  // 🆕 Validation des permissions pour les tâches
  validateTaskPermissions(currentUser, action, targetTask = null) {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    const permissions = {
      admin: {
        canCreateTask: true,
        canAssignToAnyone: true,
        canEditAnyTask: true,
        canDeleteAnyTask: true,
        canCompleteAnyTask: true
      },
      parent: {
        canCreateTask: true,
        canAssignToChildren: true,
        canEditOwnTasks: true,
        canEditChildrenTasks: true,
        canCompleteOwnTasks: true,
        canCompleteChildrenTasks: true
      },
      child: {
        canCreateTask: false, // Les enfants ne peuvent pas créer de tâches
        canCompleteOwnTasks: true,
        canEditOwnTasks: false // Les enfants ne peuvent pas modifier leurs tâches
      }
    };

    const userPerms = permissions[currentUser.role] || permissions.child;

    switch (action) {
      case 'createTask':
        return userPerms.canCreateTask;
        
      case 'assignTask':
        if (userPerms.canAssignToAnyone) return true;
        if (userPerms.canAssignToChildren && targetTask?.assigneeRole === 'child') return true;
        return false;
        
      case 'editTask':
        if (userPerms.canEditAnyTask) return true;
        if (userPerms.canEditOwnTasks && targetTask?.createdBy === currentUser.id) return true;
        if (userPerms.canEditChildrenTasks && targetTask?.assigneeRole === 'child') return true;
        return false;
        
      case 'completeTask':
        if (userPerms.canCompleteAnyTask) return true;
        if (userPerms.canCompleteOwnTasks && targetTask?.assigneeId === currentUser.id) return true;
        if (userPerms.canCompleteChildrenTasks && targetTask?.assigneeRole === 'child') return true;
        return false;
        
      case 'deleteTask':
        if (userPerms.canDeleteAnyTask) return true;
        return targetTask?.createdBy === currentUser.id;
        
      default:
        return false;
    }
  },

  // 🆕 Ajouter une tâche avec validation permissions
  async addTask(familyId, taskData, currentUser) {
    try {
      console.log('🔄 Ajout tâche:', { familyId, taskData, currentUser: currentUser.name });
      
      // 1. Validation permissions
      if (!this.validateTaskPermissions(currentUser, 'createTask')) {
        throw new Error('Permissions insuffisantes pour créer une tâche');
      }

      // 2. Récupérer les données famille pour validation
      const family = await familyService.getFamily(familyId);
      const assignee = family.members.find(m => m.id === taskData.assigneeId);
      
      if (!assignee) {
        throw new Error('Membre assigné introuvable');
      }

      // 3. Validation assignment
      const assignmentData = {
        ...taskData,
        assigneeRole: assignee.role
      };
      
      if (!this.validateTaskPermissions(currentUser, 'assignTask', assignmentData)) {
        throw new Error('Permissions insuffisantes pour assigner cette tâche');
      }

      // 4. Calcul automatique des Tribs
      const isUrgent = taskData.dueDate ? 
        new Date(taskData.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) : 
        false;
        
      const calculatedTribs = this.calculateTribs(
        taskData.difficulty || 'medium',
        !!taskData.dueDate,
        isUrgent
      );

      // 5. Préparer le document tâche
      const tasksRef = this.getTasksCollection(familyId);
      const taskDoc = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || null,
        assigneeId: taskData.assigneeId,
        assigneeName: assignee.name,
        assigneeRole: assignee.role,
        difficulty: taskData.difficulty || 'medium',
        tribs: calculatedTribs,
        dueDate: taskData.dueDate || null,
        
        // Métadonnées
        completed: false,
        completedAt: null,
        completedBy: null,
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Famille
        familyId: familyId
      };

      // 6. Sauvegarder dans Firebase
      const docRef = await addDoc(tasksRef, taskDoc);
      
      console.log('✅ Tâche créée:', {
        id: docRef.id,
        title: taskDoc.title,
        assignee: taskDoc.assigneeName,
        tribs: taskDoc.tribs
      });
      
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Erreur ajout tâche:', error);
      throw new Error(error.message || 'Impossible de créer la tâche');
    }
  },

  // 🆕 Compléter une tâche avec attribution Tribs automatique
  async completeTask(familyId, taskId, currentUserId) {
    try {
      console.log('🔄 Completion tâche:', { familyId, taskId, currentUserId });
      
      // 1. Récupérer la tâche et l'utilisateur
      const taskRef = doc(db, 'families', familyId, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }
      
      const taskData = taskSnap.data();
      const family = await familyService.getFamily(familyId);
      const currentUser = family.members.find(m => m.id === currentUserId);
      
      if (!currentUser) {
        throw new Error('Utilisateur introuvable');
      }

      // 2. Validation permissions
      const taskPermissionData = {
        ...taskData,
        assigneeId: taskData.assigneeId,
        assigneeRole: taskData.assigneeRole,
        createdBy: taskData.createdBy
      };
      
      if (!this.validateTaskPermissions(currentUser, 'completeTask', taskPermissionData)) {
        throw new Error('Permissions insuffisantes pour compléter cette tâche');
      }

      // 3. Marquer comme terminée
      await updateDoc(taskRef, {
        completed: true,
        completedAt: serverTimestamp(),
        completedBy: currentUserId,
        completedByName: currentUser.name,
        updatedAt: serverTimestamp()
      });

      // 4. Attribution automatique des Tribs
      if (taskData.assigneeId && taskData.tribs > 0) {
        try {
          await familyService.updateMemberTribs(familyId, taskData.assigneeId, taskData.tribs);
          
          console.log('✅ Tribs attribués:', {
            assignee: taskData.assigneeName,
            tribs: taskData.tribs,
            total: 'mis à jour automatiquement'
          });
          
        } catch (tribsError) {
          console.error('⚠️ Erreur attribution Tribs:', tribsError);
          // Ne pas fail la completion si les Tribs échouent
        }
      }

      console.log('✅ Tâche complétée:', {
        title: taskData.title,
        assignee: taskData.assigneeName,
        tribs: taskData.tribs
      });
      
      return {
        taskTitle: taskData.title,
        assigneeName: taskData.assigneeName,
        tribsEarned: taskData.tribs
      };
      
    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
      throw new Error(error.message || 'Impossible de compléter la tâche');
    }
  },

  // 🆕 Annuler la completion d'une tâche
  async uncompleteTask(familyId, taskId, currentUserId) {
    try {
      console.log('🔄 Annulation tâche:', { familyId, taskId, currentUserId });
      
      // 1. Récupérer la tâche
      const taskRef = doc(db, 'families', familyId, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }
      
      const taskData = taskSnap.data();
      const family = await familyService.getFamily(familyId);
      const currentUser = family.members.find(m => m.id === currentUserId);
      
      if (!currentUser) {
        throw new Error('Utilisateur introuvable');
      }

      // 2. Validation permissions (admin ou celui qui a complété)
      if (currentUser.role !== 'admin' && taskData.completedBy !== currentUserId) {
        throw new Error('Seul l\'admin ou celui qui a complété la tâche peut l\'annuler');
      }

      // 3. Retirer les Tribs si possible
      if (taskData.assigneeId && taskData.tribs > 0) {
        try {
          await familyService.updateMemberTribs(familyId, taskData.assigneeId, -taskData.tribs);
          console.log('✅ Tribs retirés:', { tribs: taskData.tribs });
        } catch (tribsError) {
          console.warn('⚠️ Erreur retrait Tribs:', tribsError);
        }
      }

      // 4. Remettre en cours
      await updateDoc(taskRef, {
        completed: false,
        completedAt: null,
        completedBy: null,
        completedByName: null,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Tâche remise en cours:', taskData.title);
      
    } catch (error) {
      console.error('❌ Erreur annulation tâche:', error);
      throw new Error(error.message || 'Impossible d\'annuler la tâche');
    }
  },

  // ===== MÉTHODES EXISTANTES AMÉLIORÉES =====

  subscribeToTasks(familyId, callback) {
    const tasksRef = this.getTasksCollection(familyId);
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('✅ Tâches Firebase synchronisées:', tasks.length);
      callback(tasks);
    }, (error) => {
      console.error('❌ Erreur écoute tâches:', error);
      callback([], error);
    });
  },

  // 🆕 Statistiques avancées des tâches
  calculateTaskStats(tasks) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const stats = {
      urgent: 0,
      todo: 0,
      completed: 0,
      tribsEarned: 0,
      overdue: 0,
      thisWeek: 0,
      assignedToMe: 0,
      createdByMe: 0
    };

    tasks.forEach(task => {
      if (task.completed) {
        stats.completed++;
        stats.tribsEarned += task.tribs || 0;
      } else {
        stats.todo++;
        
        if (task.dueDate) {
          const dueDate = task.dueDate.seconds ? 
            new Date(task.dueDate.seconds * 1000) : 
            new Date(task.dueDate);
            
          const diffTime = dueDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            stats.overdue++;
          } else if (diffDays <= 1) {
            stats.urgent++;
          } else if (diffDays <= 6) {
            stats.thisWeek++;
          }
        }
      }
    });

    return stats;
  },

  /**
   * 🗑️ Supprimer une tâche (admin/parent seulement)
   */
  async deleteTask(familyId, taskId, currentUserId) {
    try {
      console.log('🗑️ Suppression tâche:', { familyId, taskId, currentUserId });
      
      // 1. Récupérer la tâche et l'utilisateur
      const taskRef = doc(db, 'families', familyId, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Tâche introuvable');
      }
      
      const taskData = taskSnap.data();
      const family = await familyService.getFamily(familyId);
      const currentUser = family.members.find(m => m.id === currentUserId);
      
      if (!currentUser) {
        throw new Error('Utilisateur introuvable');
      }

      // 2. Validation permissions
      const canDelete = 
        currentUser.role === 'admin' || 
        currentUser.role === 'parent' ||
        taskData.createdBy === currentUserId;
        
      if (!canDelete) {
        throw new Error('Permissions insuffisantes pour supprimer cette tâche');
      }

      // 3. Si la tâche était complétée, retirer les Tribs
      if (taskData.completed && taskData.assigneeId && taskData.tribs > 0) {
        try {
          await familyService.updateMemberTribs(familyId, taskData.assigneeId, -taskData.tribs);
          console.log('✅ Tribs retirés avant suppression:', { tribs: taskData.tribs });
        } catch (tribsError) {
          console.warn('⚠️ Erreur retrait Tribs:', tribsError);
        }
      }

      // 4. Supprimer la tâche
      await deleteDoc(taskRef);

      console.log('✅ Tâche supprimée:', taskData.title);
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      throw new Error(error.message || 'Impossible de supprimer la tâche');
    }
  },

  // 🆕 Analytics famille pour les tâches
  async getFamilyTaskAnalytics(familyId, timeframe = '7days') {
    try {
      const family = await familyService.getFamily(familyId);
      const tasksRef = this.getTasksCollection(familyId);
      
      // TODO: Implémenter requêtes avec date range
      // Pour l'instant retourner des stats de base
      
      const analytics = {
        totalTasks: 0,
        completionRate: 0,
        averageTribs: 0,
        topPerformer: null,
        familyTribsEarned: 0,
        tasksByDifficulty: {
          easy: 0,
          medium: 0,
          hard: 0
        },
        memberStats: family.members.map(member => ({
          id: member.id,
          name: member.name,
          tasksAssigned: 0,
          tasksCompleted: 0, 
          tribsEarned: 0,
          completionRate: 0
        }))
      };
      
      return analytics;
      
    } catch (error) {
      console.error('❌ Erreur analytics tâches:', error);
      throw error;
    }
  },

  // 🆕 Suggestions de tâches intelligentes
  generateTaskSuggestions(familyMembers, completedTasks = []) {
    const suggestions = [];
    
    // Suggestions basées sur l'âge
    familyMembers.forEach(member => {
      if (member.role === 'child') {
        const age = member.birthDate ? 
          new Date().getFullYear() - new Date(member.birthDate).getFullYear() : 
          10;
          
        if (age >= 8) {
          suggestions.push({
            title: 'Ranger sa chambre',
            assigneeId: member.id,
            difficulty: 'medium',
            reason: `Adapté pour ${member.name} (${age} ans)`
          });
        }
        
        if (age >= 12) {
          suggestions.push({
            title: 'Aider à préparer le dîner',
            assigneeId: member.id,
            difficulty: 'medium',
            reason: `${member.name} peut commencer à cuisiner`
          });
        }
      }
    });
    
    // Suggestions générales famille
    suggestions.push(
      {
        title: 'Sortir les poubelles',
        difficulty: 'easy',
        reason: 'Tâche rapide et utile'
      },
      {
        title: 'Arroser les plantes',
        difficulty: 'easy',
        reason: 'Parfait pour développer la responsabilité'
      }
    );
    
    return suggestions.slice(0, 5); // Max 5 suggestions
  }
};