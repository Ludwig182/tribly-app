// src/services/imageOptimizationService.js
import * as ImageManipulator from 'expo-image-manipulator';

export const imageOptimizationService = {
  
  // 🎯 Configuration optimale pour avatars
  AVATAR_CONFIG: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.7,        // 70% qualité = bon compromis
    format: 'jpeg',      // Plus léger que PNG pour photos
  },

  // 📏 Optimise une image pour avatar
  async optimizeAvatar(imageUri) {
    try {
      console.log('🔄 Optimisation image avatar...');
      
      // 1. Obtenir les informations originales (taille fichier)
      const originalResponse = await fetch(imageUri);
      const originalBlob = await originalResponse.blob();
      const originalSize = originalBlob.size;
      
      console.log(`📐 Taille originale: ${this.formatFileSize(originalSize)}`);
      
      // 2. Configuration optimisation
      const targetSize = Math.min(
        this.AVATAR_CONFIG.maxWidth,
        this.AVATAR_CONFIG.maxHeight
      );
      
      // 3. Appliquer redimensionnement et compression avec expo-image-manipulator
      const optimizedResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          // Redimensionner en gardant le ratio, puis crop au centre pour avoir un carré
          { resize: { width: targetSize, height: targetSize } }
        ],
        {
          compress: this.AVATAR_CONFIG.quality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );
      
      // 4. Obtenir la nouvelle taille
      const optimizedResponse = await fetch(optimizedResult.uri);
      const optimizedBlob = await optimizedResponse.blob();
      const optimizedSize = optimizedBlob.size;
      
      // 5. Calculer les gains
      const savings = originalSize > 0 ? Math.round((1 - optimizedSize/originalSize) * 100) : 0;
      
      console.log('✅ Optimisation terminée:');
      console.log(`📐 Redimensionné à ${targetSize}x${targetSize}px`);
      console.log(`💾 ${this.formatFileSize(originalSize)} → ${this.formatFileSize(optimizedSize)} (-${savings}%)`);
      
      return {
        uri: optimizedResult.uri,
        width: targetSize,
        height: targetSize,
        fileSize: optimizedSize,
        originalSize: originalSize,
        compressionRatio: savings
      };
      
    } catch (error) {
      console.error('❌ Erreur optimisation image:', error);
      // En cas d'erreur, retourner l'image originale
      const originalResponse = await fetch(imageUri).catch(() => null);
      const originalSize = originalResponse ? (await originalResponse.blob()).size : 0;
      
      return {
        uri: imageUri,
        width: 0,
        height: 0, 
        fileSize: originalSize,
        originalSize: originalSize,
        compressionRatio: 0,
        error: error.message
      };
    }
  },

  // 🔍 Obtenir les informations d'une image (React Native compatible)
  async getImageInfo(imageUri) {
    try {
      // Utiliser fetch pour obtenir les métadonnées
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // En React Native, on ne peut pas facilement obtenir les dimensions d'un blob
      // On va utiliser expo-image-manipulator pour ça
      try {
        const imageInfo = await ImageManipulator.manipulateAsync(
          imageUri,
          [], // Pas de transformation, juste obtenir les infos
          { format: ImageManipulator.SaveFormat.JPEG }
        );
        
        // expo-image-manipulator ne retourne pas width/height directement
        // On va estimer ou utiliser des valeurs par défaut
        return {
          width: 0, // Non disponible facilement en React Native
          height: 0, // Non disponible facilement en React Native  
          fileSize: blob.size,
          type: blob.type
        };
        
      } catch (manipulatorError) {
        console.log('⚠️ Impossible d\'obtenir dimensions, utilisation valeurs par défaut');
        return {
          width: 0,
          height: 0, 
          fileSize: blob.size,
          type: blob.type
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur info image:', error);
      return {
        width: 0,
        height: 0,
        fileSize: 0,
        type: 'unknown'
      };
    }
  },

  // 📊 Formater la taille de fichier
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  // 🎨 Optimisations spécialisées pour différents usages
  async optimizeForThumbnail(imageUri) {
    try {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 100, height: 100 } }],
        {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      return result.uri;
      
    } catch (error) {
      console.error('❌ Erreur thumbnail:', error);
      return imageUri;
    }
  },

  // 🔧 Fonction de test de performance
  async benchmarkOptimization(imageUri) {
    const startTime = Date.now();
    
    try {
      const result = await this.optimizeAvatar(imageUri);
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      console.log('⏱️ Benchmark optimisation:');
      console.log(`🕐 Temps de traitement: ${processingTime}ms`);
      console.log(`💾 Gain de taille: ${result.compressionRatio}%`);
      console.log(`📐 Dimensions finales: ${result.width}x${result.height}`);
      
      return {
        ...result,
        processingTime
      };
      
    } catch (error) {
      console.error('❌ Erreur benchmark:', error);
      return null;
    }
  },

  // 🎯 Validation des limites de taille
  validateImageSize(fileSize, maxSizeBytes = 5 * 1024 * 1024) {
    if (fileSize > maxSizeBytes) {
      throw new Error(`Image trop volumineuse: ${this.formatFileSize(fileSize)}. Maximum autorisé: ${this.formatFileSize(maxSizeBytes)}`);
    }
    return true;
  },

  // 📱 Détection du type d'appareil pour ajuster l'optimisation
  getOptimizationLevel() {
    // Sur des appareils plus anciens, on peut être plus agressif
    // Cette logique peut être étendue selon les besoins
    return {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.7
    };
  }
};