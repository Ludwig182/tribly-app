// src/services/familyService.js - Version étendue avec gestion complète membres
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
  
  // ===== MÉTHODES EXISTANTES =====
  
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
          theme: 'default'
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

  // ===== NOUVELLES MÉTHODES POUR GESTION MEMBRES =====

  /**
   * 👤 Met à jour les données d'un membre spécifique
   */
  async updateMember(familyId, memberId, memberData) {
    try {
      // console.log('🔄 Mise à jour membre:', { familyId, memberId, memberData });
      
      // 1. Récupérer la famille actuelle
      const familyRef = doc(db, 'families', familyId);
      const familySnap = await getDoc(familyRef);
      
      if (!familySnap.exists()) {
        throw new Error('Famille non trouvée');
      }
      
      const familyDoc = familySnap.data();
      const members = familyDoc.members || [];
      
      // 2. Trouver et mettre à jour le membre
      const memberIndex = members.findIndex(member => member.id === memberId);
      
      if (memberIndex === -1) {
        throw new Error('Membre non trouvé');
      }
      
      // 3. Mettre à jour les données du membre
      const updatedMembers = [...members];
      updatedMembers[memberIndex] = {
        ...updatedMembers[memberIndex],
        ...memberData,
        updatedAt: new Date().toISOString() // Timestamp pour le membre
      };
      
      // 4. Vérifications métier
      await this.validateMemberUpdate(updatedMembers, memberId, memberData);
      
      // 5. Sauvegarder dans Firebase
      await updateDoc(familyRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp()
      });
      
      // console.log('✅ Membre mis à jour avec succès');
      return updatedMembers[memberIndex];
      
    } catch (error) {
      console.error('❌ Erreur mise à jour membre:', error);
      throw new Error(error.message || 'Impossible de mettre à jour le membre');
    }
  },

  /**
   * 🛡️ Valide les modifications d'un membre selon les règles métier
   */
  async validateMemberUpdate(updatedMembers, memberId, newData) {
    // Règle 1: Maximum 2 parents (admin + parent)
    if (newData.role) {
      const parentsCount = updatedMembers.filter(
        member => member.role === 'parent' || member.role === 'admin'
      ).length;
      
      const currentMember = updatedMembers.find(m => m.id === memberId);
      const wasParent = currentMember?.role === 'parent' || currentMember?.role === 'admin';
      const willBeParent = newData.role === 'parent' || newData.role === 'admin';
      
      // Si on passe de non-parent à parent, vérifier la limite
      if (!wasParent && willBeParent && parentsCount >= 2) {
        throw new Error('Maximum 2 parents autorisés par famille');
      }
      
      // Si on passe d'admin à autre chose, vérifier qu'il reste au moins 1 admin
      if (currentMember?.role === 'admin' && newData.role !== 'admin') {
        const remainingAdmins = updatedMembers.filter(
          member => member.id !== memberId && member.role === 'admin'
        ).length;
        
        if (remainingAdmins === 0) {
          throw new Error('Au moins un administrateur requis');
        }
      }
    }
    
    // Règle 2: Validation nom
    if (newData.name) {
      if (newData.name.trim().length < 2) {
        throw new Error('Le nom doit contenir au moins 2 caractères');
      }
      if (newData.name.trim().length > 50) {
        throw new Error('Le nom ne peut pas dépasser 50 caractères');
      }
    }
    
    // Règle 3: Validation email
    if (newData.email && newData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newData.email.trim())) {
        throw new Error('Format email invalide');
      }
    }
    
    // Règle 4: Validation date de naissance
    if (newData.birthDate) {
      const birthDate = new Date(newData.birthDate);
      const today = new Date();
      
      if (birthDate > today) {
        throw new Error('La date de naissance ne peut pas être dans le futur');
      }
      
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age > 120 || age < 0) {
        throw new Error('Date de naissance invalide');
      }
    }
  },

  /**
   * ➕ Ajoute un nouveau membre à la famille
   */
  async addMember(familyId, memberData) {
    try {
      console.log('➕ Ajout nouveau membre:', { familyId, memberData });
      
      const familyRef = doc(db, 'families', familyId);
      const familySnap = await getDoc(familyRef);
      
      if (!familySnap.exists()) {
        throw new Error('Famille non trouvée');
      }
      
      const familyDoc = familySnap.data();
      const members = familyDoc.members || [];
      
      // Générer un nouvel ID membre
      const maxId = members.reduce((max, member) => {
        const match = member.id.match(/user-(\d+)/);
        return match ? Math.max(max, parseInt(match[1])) : max;
      }, 0);
      
      const newMemberId = `user-${String(maxId + 1).padStart(3, '0')}`;
      
      // Créer le nouveau membre avec données par défaut
      const newMember = {
        id: newMemberId,
        name: memberData.name,
        role: memberData.role || 'child',
        email: memberData.email || null,
        birthDate: memberData.birthDate || null,
        avatar: memberData.avatar || '😊',
        avatarUrl: null,
        color: memberData.color || '#48bb78',
        tribs: 0,
        joinedAt: new Date().toISOString(),
        status: 'active',
        invitedBy: memberData.invitedBy || null,
        approvedBy: memberData.approvedBy || null,
        approvedAt: new Date().toISOString()
      };
      
      const updatedMembers = [...members, newMember];
      
      // Valider avant ajout
      await this.validateMemberUpdate(updatedMembers, newMemberId, newMember);
      
      // Mettre à jour les compteurs famille
      const currentParents = updatedMembers.filter(m => m.role === 'parent' || m.role === 'admin').length;
      
      await updateDoc(familyRef, {
        members: updatedMembers,
        'limits.currentMembers': updatedMembers.length,
        'limits.currentParents': currentParents,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Membre ajouté avec succès:', newMemberId);
      return newMember;
      
    } catch (error) {
      console.error('❌ Erreur ajout membre:', error);
      throw new Error(error.message || 'Impossible d\'ajouter le membre');
    }
  },

  /**
   * 🗑️ Supprime un membre de la famille
   */
  async deleteMember(familyId, memberId, currentUserId) {
    try {
      console.log('🗑️ Suppression membre:', { familyId, memberId, currentUserId });
      
      const familyRef = doc(db, 'families', familyId);
      const familySnap = await getDoc(familyRef);
      
      if (!familySnap.exists()) {
        throw new Error('Famille non trouvée');
      }
      
      const familyDoc = familySnap.data();
      const members = familyDoc.members || [];
      
      // Vérifications de sécurité
      const memberToDelete = members.find(m => m.id === memberId);
      const currentUser = members.find(m => m.id === currentUserId);
      
      if (!memberToDelete) {
        throw new Error('Membre à supprimer non trouvé');
      }
      
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Seuls les administrateurs peuvent supprimer des membres');
      }
      
      if (memberToDelete.role === 'admin' && memberId === familyDoc.adminId) {
        throw new Error('Impossible de supprimer l\'administrateur principal');
      }
      
      // Supprimer le membre
      const updatedMembers = members.filter(member => member.id !== memberId);
      const currentParents = updatedMembers.filter(m => m.role === 'parent' || m.role === 'admin').length;
      
      await updateDoc(familyRef, {
        members: updatedMembers,
        'limits.currentMembers': updatedMembers.length,
        'limits.currentParents': currentParents,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Membre supprimé avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur suppression membre:', error);
      throw new Error(error.message || 'Impossible de supprimer le membre');
    }
  },

  /**
   * 📊 Récupère les statistiques de la famille
   */
  async getFamilyStats(familyId) {
    try {
      const family = await this.getFamily(familyId);
      const members = family.members || [];
      
      const stats = {
        totalMembers: members.length,
        admins: members.filter(m => m.role === 'admin').length,
        parents: members.filter(m => m.role === 'parent').length,
        children: members.filter(m => m.role === 'child').length,
        totalTribs: members.reduce((sum, member) => sum + (member.tribs || 0), 0),
        averageAge: 0,
        activeMembers: members.filter(m => m.status === 'active').length
      };
      
      // Calculer l'âge moyen si dates de naissance disponibles
      const membersWithBirthDate = members.filter(m => m.birthDate);
      if (membersWithBirthDate.length > 0) {
        const totalAge = membersWithBirthDate.reduce((sum, member) => {
          const birthDate = new Date(member.birthDate);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          return sum + age;
        }, 0);
        stats.averageAge = Math.round(totalAge / membersWithBirthDate.length);
      }
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur statistiques famille:', error);
      throw error;
    }
  },

  /**
   * 🔍 Trouve un membre par son ID
   */
  async getMember(familyId, memberId) {
    try {
      const family = await this.getFamily(familyId);
      const member = family.members?.find(m => m.id === memberId);
      
      if (!member) {
        throw new Error('Membre non trouvé');
      }
      
      return member;
    } catch (error) {
      console.error('❌ Erreur récupération membre:', error);
      throw error;
    }
  },

  /**
   * 🔐 Vérifie les permissions d'un utilisateur
   */
  checkPermissions(currentUser, targetMember, action) {
    if (!currentUser) return false;
    
    const permissions = {
      // Admin peut tout faire
      admin: {
        editAnyProfile: true,
        deleteMembers: true,
        changeRoles: true,
        manageFamily: true
      },
      
      // Parent peut modifier les enfants
      parent: {
        editChildProfiles: true,
        editOwnProfile: true,
        addMembers: true
      },
      
      // Enfant peut modifier son profil seulement
      child: {
        editOwnProfile: true
      }
    };
    
    const userPerms = permissions[currentUser.role] || {};
    
    switch (action) {
      case 'editProfile':
        return userPerms.editAnyProfile || 
               (userPerms.editChildProfiles && targetMember?.role === 'child') ||
               (userPerms.editOwnProfile && targetMember?.id === currentUser.id);
               
      case 'deleteUser':
        return userPerms.deleteMembers;
        
      case 'changeRole':
        return userPerms.changeRoles;
        
      default:
        return false;
    }
  },

  // ===== MÉTHODES EXISTANTES (maintenues pour compatibilité) =====
  
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