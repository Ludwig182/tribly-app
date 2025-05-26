// src/services/familyService.js
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const familyService = {
  
  async updateFamily(familyId, updateData) {
    try {
      const familyRef = doc(db, 'families', familyId);
      const dataWithTimestamp = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(familyRef, dataWithTimestamp);
      console.log('✅ Famille mise à jour avec succès');
      
    } catch (error) {
      console.error('❌ Erreur mise à jour famille:', error);
      throw error;
    }
  },

  async createFamily(familyData) {
    try {
      const familyRef = doc(collection(db, 'families'));
      const familyDoc = {
        ...familyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          tribsGoal: 500,
          notifications: true,
          theme: 'neutral'
        },
        subscription: {
          plan: 'free',
          status: 'active'
        }
      };
      
      await setDoc(familyRef, familyDoc);
      return familyRef.id;
    } catch (error) {
      console.error('Erreur création famille:', error);
      throw error;
    }
  },

  async getFamily(familyId) {
    try {
      const familyRef = doc(db, 'families', familyId);
      const familySnap = await getDoc(familyRef);
      
      if (familySnap.exists()) {
        return { id: familySnap.id, ...familySnap.data() };
      } else {
        throw new Error('Famille non trouvée');
      }
    } catch (error) {
      console.error('Erreur récupération famille:', error);
      throw error;
    }
  },

  subscribeToFamily(familyId, callback) {
    const familyRef = doc(db, 'families', familyId);
    
    return onSnapshot(familyRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Erreur écoute famille:', error);
      callback(null, error);
    });
  },

  async updateFamily(familyId, updateData) {
    try {
      const familyRef = doc(db, 'families', familyId);
      const dataWithTimestamp = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(familyRef, dataWithTimestamp);
      console.log('✅ Famille mise à jour avec succès');
      
    } catch (error) {
      console.error('❌ Erreur mise à jour famille:', error);
      throw error;
    }
  },

  async updateMemberTribs(familyId, memberId, tribsChange) {
    try {
      const familyRef = doc(db, 'families', familyId);
      const familySnap = await getDoc(familyRef);
      
      if (familySnap.exists()) {
        const members = familySnap.data().members || [];
        const updatedMembers = members.map(member => {
          if (member.id === memberId) {
            return {
              ...member,
              tribs: Math.max(0, (member.tribs || 0) + tribsChange)
            };
          }
          return member;
        });
        
        await updateDoc(familyRef, {
          members: updatedMembers,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Erreur mise à jour Tribs:', error);
      throw error;
    }
  }
};
