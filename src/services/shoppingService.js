// src/services/shoppingService.js
import { 
  collection, 
  doc, 
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const shoppingService = {

  getShoppingCollection(familyId) {
    return collection(db, 'families', familyId, 'shopping');
  },

  getCategoriesCollection(familyId) {
    return collection(db, 'families', familyId, 'categories');
  },

  async addShoppingItem(familyId, itemData) {
    try {
      const shoppingRef = this.getShoppingCollection(familyId);
      const itemDoc = {
        ...itemData,
        checked: false,
        checkedAt: null,
        checkedBy: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(shoppingRef, itemDoc);
      return docRef.id;
    } catch (error) {
      console.error('Erreur ajout article shopping:', error);
      throw error;
    }
  },

  async toggleShoppingItem(familyId, itemId, checked, memberId) {
    try {
      const itemRef = doc(db, 'families', familyId, 'shopping', itemId);
      const updateData = {
        checked,
        updatedAt: serverTimestamp()
      };

      if (checked) {
        updateData.checkedAt = serverTimestamp();
        updateData.checkedBy = memberId;
      } else {
        updateData.checkedAt = null;
        updateData.checkedBy = null;
      }

      await updateDoc(itemRef, updateData);
    } catch (error) {
      console.error('Erreur toggle article shopping:', error);
      throw error;
    }
  },

  async clearCheckedItems(familyId, checkedItems) {
    try {
      const promises = checkedItems.map(item => 
        this.deleteShoppingItem(familyId, item.id)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Erreur vider panier:', error);
      throw error;
    }
  },

  async deleteShoppingItem(familyId, itemId) {
    try {
      const itemRef = doc(db, 'families', familyId, 'shopping', itemId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error('Erreur suppression article shopping:', error);
      throw error;
    }
  },

  subscribeToShoppingList(familyId, callback) {
    const shoppingRef = this.getShoppingCollection(familyId);
    const q = query(shoppingRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      callback(items);
    }, (error) => {
      console.error('Erreur écoute shopping:', error);
      callback([], error);
    });
  },

  calculateShoppingStats(items) {
    const stats = {
      total: items.length,
      toBuy: 0,
      inBasket: 0
    };

    items.forEach(item => {
      if (item.checked) {
        stats.inBasket++;
      } else {
        stats.toBuy++;
      }
    });

    return stats;
  }
};
