// src/services/storageService.js - Version temporaire avec détection Spark Plan
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable 
} from 'firebase/storage';
import { storage } from '../config/firebase';
import { familyService } from './familyService';

export const storageService = {
  
  // 🔍 Vérifier si Firebase Storage est disponible
  async checkStorageAvailability() {
    try {
      const testRef = ref(storage, 'test-availability');
      console.log('✅ Storage disponible, référence créée');
      return true;
    } catch (error) {
      console.log('❌ Storage non disponible:', error.code);
      if (error.code === 'storage/unknown') {
        console.log('💡 Probable: Plan Spark - Storage nécessite plan Blaze');
      }
      return false;
    }
  },

  /**
   * 📁 Structure des chemins Firebase Storage :
   * /avatars/{familyId}/{memberId}/profile.jpg
   */
  
  // 🎯 Génère le chemin de stockage pour un avatar
  getAvatarPath(familyId, memberId) {
    return `avatars/${familyId}/${memberId}/profile.jpg`;
  },

  // 📤 Upload d'un avatar avec optimisation et vérification disponibilité
  async uploadAvatar(familyId, memberId, imageUri, onProgress = null) {
    try {
      console.log('🔄 Début upload avatar:', { familyId, memberId });
      
      // 0. Vérifier que Storage est disponible
      const storageAvailable = await this.checkStorageAvailability();
      if (!storageAvailable) {
        throw new Error(
          '🚨 Firebase Storage non disponible.\n\n' +
          'Ton projet Firebase est sur le plan Spark (gratuit).\n' +
          'Les photos de profil nécessitent le plan Blaze.\n\n' +
          '💡 Solutions :\n' +
          '• Activer plan Blaze (gratuit jusqu\'à 5GB)\n' +
          '• Utiliser les emojis pour l\'instant'
        );
      }
      
      // 1. Optimiser l'image avant upload
      const { imageOptimizationService } = await import('./imageOptimizationService');
      const optimizedImage = await imageOptimizationService.optimizeAvatar(imageUri);
      
      if (optimizedImage.error) {
        console.warn('⚠️ Optimisation échouée, utilisation image originale');
      } else {
        console.log(`✅ Image optimisée: ${optimizedImage.compressionRatio}% de réduction`);
      }
      
      // 2. Préparer l'image optimisée
      const finalImageUri = optimizedImage.error ? imageUri : optimizedImage.uri;
      const response = await fetch(finalImageUri);
      const blob = await response.blob();
      
      // 3. Vérifier la taille finale (après optimisation)
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error(`Image trop volumineuse après optimisation: ${(blob.size / 1024 / 1024).toFixed(1)}MB (max 5MB)`);
      }
      
      console.log(`📊 Taille finale: ${(blob.size / 1024).toFixed(1)}KB`);
      
      // 4. Créer la référence Firebase
      const avatarPath = this.getAvatarPath(familyId, memberId);
      const storageRef = ref(storage, avatarPath);
      
      // 5. Upload avec progression
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: blob.type || 'image/jpeg',
        customMetadata: {
          uploadedBy: memberId,
          uploadedAt: new Date().toISOString(),
          originalSize: blob.size.toString()
        }
      });
      
      // 6. Monitoring progression
      if (onProgress) {
        uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        });
      }
      
      // 7. Attendre completion
      await uploadTask;
      
      // 8. Récupérer URL de téléchargement
      const downloadURL = await getDownloadURL(storageRef);
      
      // 9. Mettre à jour le profil membre dans Firestore
      await this.updateMemberAvatar(familyId, memberId, downloadURL);
      
      console.log('✅ Avatar uploadé avec succès:', downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur upload avatar:', error);
      throw this.handleStorageError(error);
    }
  },

  // 🔗 Récupère l'URL d'un avatar (avec cache)
  async getAvatarUrl(familyId, memberId) {
    try {
      const avatarPath = this.getAvatarPath(familyId, memberId);
      const storageRef = ref(storage, avatarPath);
      
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
      
    } catch (error) {
      // Si l'avatar n'existe pas, retourner null (fallback emoji)
      if (error.code === 'storage/object-not-found') {
        return null;
      }
      throw this.handleStorageError(error);
    }
  },

  // 🗑️ Supprime un avatar existant
  async deleteAvatar(familyId, memberId) {
    try {
      const avatarPath = this.getAvatarPath(familyId, memberId);
      const storageRef = ref(storage, avatarPath);
      
      await deleteObject(storageRef);
      
      // Supprimer l'URL du profil membre
      await this.updateMemberAvatar(familyId, memberId, null);
      
      console.log('✅ Avatar supprimé avec succès');
      return true;
      
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        console.log('⚠️ Avatar déjà supprimé ou inexistant');
        return true;
      }
      throw this.handleStorageError(error);
    }
  },

  // 🔄 Met à jour l'URL de l'avatar dans le profil membre
  async updateMemberAvatar(familyId, memberId, avatarUrl) {
    try {
      const family = await familyService.getFamily(familyId);
      
      const updatedMembers = family.members.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            avatar: member.avatar, // Garder l'emoji de fallback
            avatarUrl: avatarUrl,  // Ajouter l'URL de la photo
            avatarUpdatedAt: avatarUrl ? new Date().toISOString() : null
          };
        }
        return member;
      });
      
      await familyService.updateFamily(familyId, { 
        members: updatedMembers 
      });
      
    } catch (error) {
      console.error('❌ Erreur mise à jour avatar membre:', error);
      throw error;
    }
  },

  // 📊 Statistiques storage famille (pour debug/admin)
  async getFamilyStorageStats(familyId) {
    try {
      const family = await familyService.getFamily(familyId);
      const stats = {
        totalMembers: family.members.length,
        membersWithAvatar: 0,
        membersWithoutAvatar: 0
      };
      
      for (const member of family.members) {
        if (member.avatarUrl) {
          stats.membersWithAvatar++;
        } else {
          stats.membersWithoutAvatar++;
        }
      }
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur stats storage:', error);
      return null;
    }
  },

  // 🛠️ Gestion centralisée des erreurs Storage avec messages user-friendly
  handleStorageError(error) {
    // Messages d'erreur plus user-friendly
    const errorMap = {
      'storage/unauthorized': 'Permissions insuffisantes pour accéder au stockage',
      'storage/canceled': 'Upload annulé par l\'utilisateur',
      'storage/unknown': '🚨 Firebase Storage non disponible\n\nTon projet est sur le plan Spark (gratuit).\nLes photos nécessitent le plan Blaze.\n\n💡 Active le plan Blaze (gratuit jusqu\'à 5GB) ou utilise les emojis.',
      'storage/object-not-found': 'Fichier introuvable',
      'storage/bucket-not-found': 'Espace de stockage introuvable',
      'storage/quota-exceeded': 'Quota de stockage dépassé',
      'storage/unauthenticated': 'Utilisateur non authentifié',
      'storage/retry-limit-exceeded': 'Trop de tentatives, réessayez plus tard'
    };
    
    const friendlyMessage = errorMap[error.code] || error.message || `Erreur de stockage: ${error.message}`;
    
    return new Error(friendlyMessage);
  },

  // 🔧 Utilitaires pour les formats d'image
  validateImageFormat(uri) {
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
    const lowerUri = uri.toLowerCase();
    
    return supportedFormats.some(format => 
      lowerUri.includes(format)
    );
  },

  // 📏 Calcule la taille d'affichage optimale
  getOptimalDisplaySize(containerWidth, originalWidth, originalHeight) {
    const aspectRatio = originalHeight / originalWidth;
    const displayWidth = Math.min(containerWidth, 400);
    const displayHeight = displayWidth * aspectRatio;
    
    return {
      width: displayWidth,
      height: displayHeight
    };
  }
};