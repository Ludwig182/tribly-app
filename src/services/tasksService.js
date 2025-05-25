// src/services/tasksService.js
import { 
  collection, 
  doc, 
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const tasksService = {

  getTasksCollection(familyId) {
    return collection(db, 'families', familyId, 'tasks');
  },

  async addTask(familyId, taskData) {
    try {
      const tasksRef = this.getTasksCollection(familyId);
      const taskDoc = {
        ...taskData,
        completed: false,
        completedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tribs: this.calculateTribs(taskData.difficulty || 'medium')
      };

      const docRef = await addDoc(tasksRef, taskDoc);
      return docRef.id;
    } catch (error) {
      console.error('Erreur ajout tâche:', error);
      throw error;
    }
  },

  calculateTribs(difficulty) {
    const tribsMap = {
      easy: 10,
      medium: 20,
      hard: 40
    };
    return tribsMap[difficulty] || 20;
  },

  async completeTask(familyId, taskId, memberId) {
    try {
      const taskRef = doc(db, 'families', familyId, 'tasks', taskId);
      await updateDoc(taskRef, {
        completed: true,
        completedAt: serverTimestamp(),
        completedBy: memberId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur completion tâche:', error);
      throw error;
    }
  },

  async uncompleteTask(familyId, taskId) {
    try {
      const taskRef = doc(db, 'families', familyId, 'tasks', taskId);
      await updateDoc(taskRef, {
        completed: false,
        completedAt: null,
        completedBy: null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur annulation tâche:', error);
      throw error;
    }
  },

  subscribeToTasks(familyId, callback) {
    const tasksRef = this.getTasksCollection(familyId);
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      callback(tasks);
    }, (error) => {
      console.error('Erreur écoute tâches:', error);
      callback([], error);
    });
  },

  calculateTaskStats(tasks) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const stats = {
      urgent: 0,
      todo: 0,
      completed: 0,
      tribsEarned: 0
    };

    tasks.forEach(task => {
      if (task.completed) {
        stats.completed++;
        stats.tribsEarned += task.tribs || 0;
      } else {
        stats.todo++;
        
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate.seconds * 1000);
          if (dueDate < today) {
            stats.urgent++;
          }
        }
      }
    });

    return stats;
  }
};
