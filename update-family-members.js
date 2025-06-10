// Script pour ajouter les IDs utilisateur Firebase aux membres de famille

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBOqKI8xJtlM8tJQQQJQQQJQQQJQQQJQQQ",
  authDomain: "tribly-app.firebaseapp.com",
  projectId: "tribly-app",
  storageBucket: "tribly-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateFamilyMembers() {
  try {
    console.log('🔄 Mise à jour des membres de famille avec les IDs utilisateur...');
    
    const familyId = 'famille-questroy-test';
    
    // Mapping des IDs de membres famille vers les IDs utilisateur Firebase
    const memberUserIdMapping = {
      'rosaly-001': 'user-002',    // Rosaly -> user-002 (comme mentionné par l'utilisateur)
      'ludwig-002': 'user-001',    // Ludwig -> user-001 (utilisateur de test principal)
      'clementine-003': 'user-003', // Clémentine -> user-003
      'jacob-004': 'user-004'      // Jacob -> user-004
    };
    
    // Mettre à jour chaque membre avec son userId
    const familyRef = doc(db, 'families', familyId);
    
    // Récupérer les données actuelles de la famille
    const { getDoc } = await import('firebase/firestore');
    const familyDoc = await getDoc(familyRef);
    
    if (!familyDoc.exists()) {
      throw new Error('Famille non trouvée');
    }
    
    const familyData = familyDoc.data();
    const updatedMembers = familyData.members.map(member => ({
      ...member,
      userId: memberUserIdMapping[member.id] || member.id // Ajouter le userId correspondant
    }));
    
    // Mettre à jour la famille avec les nouveaux membres
    await updateDoc(familyRef, {
      members: updatedMembers
    });
    
    console.log('✅ Membres mis à jour avec succès:');
    updatedMembers.forEach(member => {
      console.log(`  - ${member.name} (${member.id}) -> userId: ${member.userId}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  }
}

// Exécuter le script
updateFamilyMembers();