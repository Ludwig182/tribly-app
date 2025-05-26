// src/debug/testStorage.js - Outil de débogage Firebase Storage
// À utiliser temporairement pour identifier le problème

import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const debugStorage = {
  
  // 🔍 Test 1 : Configuration Firebase
  async testConfig() {
    console.log('🔥 === TEST CONFIGURATION FIREBASE ===');
    
    try {
      console.log('- Storage instance:', storage ? '✅' : '❌');
      console.log('- Storage app name:', storage.app.name);
      console.log('- Storage bucket:', storage._bucket || 'Non défini');
      return true;
    } catch (error) {
      console.error('❌ Erreur config:', error);
      return false;
    }
  },

  // 🔍 Test 2 : Créer une référence
  async testReference() {
    console.log('🔥 === TEST RÉFÉRENCE STORAGE ===');
    
    try {
      const testRef = ref(storage, 'avatars/test-family/test-member/profile.jpg');
      console.log('✅ Référence créée:', testRef.fullPath);
      console.log('- Bucket:', testRef.bucket);
      console.log('- Full path:', testRef.fullPath);
      return testRef;
    } catch (error) {
      console.error('❌ Erreur référence:', error);
      return null;
    }
  },

  // 🔍 Test 3 : Upload d'un blob minimal
  async testUpload() {
    console.log('🔥 === TEST UPLOAD MINIMAL ===');
    
    try {
      // Créer un blob de test (1x1 pixel transparent PNG)
      const testBlob = new Blob([
        new Uint8Array([
          137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 
          0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 
          0, 0, 11, 73, 68, 65, 84, 120, 156, 99, 248, 15, 0, 1, 1, 1, 
          0, 24, 221, 141, 219, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
        ])
      ], { type: 'image/png' });

      console.log('- Blob créé:', testBlob.size, 'bytes');
      
      const testRef = ref(storage, 'debug/test-upload.png');
      console.log('- Référence:', testRef.fullPath);
      
      console.log('⏳ Upload en cours...');
      const snapshot = await uploadBytes(testRef, testBlob);
      console.log('✅ Upload réussi:', snapshot.metadata.fullPath);
      
      const downloadURL = await getDownloadURL(testRef);
      console.log('✅ URL récupérée:', downloadURL);
      
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Erreur upload test:', error);
      console.error('- Code:', error.code);
      console.error('- Message:', error.message);
      
      // Diagnostics spécifiques
      if (error.code === 'storage/unauthorized') {
        console.error('🔒 Problème de permissions - vérifier les Storage Rules');
      } else if (error.code === 'storage/bucket-not-found') {
        console.error('🪣 Bucket introuvable - vérifier storageBucket dans config');
      } else if (error.code === 'storage/unknown') {
        console.error('❓ Erreur inconnue - vérifier la console Firebase');
      }
      
      return null;
    }
  },

  // 🔍 Test complet
  async runAllTests() {
    console.log('🧪 === DÉMARRAGE TESTS STORAGE ===');
    
    const configOK = await this.testConfig();
    if (!configOK) return false;
    
    const refOK = await this.testReference();
    if (!refOK) return false;
    
    const uploadOK = await this.testUpload();
    if (!uploadOK) return false;
    
    console.log('🎉 === TOUS LES TESTS RÉUSSIS ===');
    return true;
  }
};

// 🧪 Utilisation dans un composant :
/*
import { debugStorage } from '../debug/testStorage';

// Dans un bouton ou useEffect :
const testStorage = async () => {
  await debugStorage.runAllTests();
};
*/