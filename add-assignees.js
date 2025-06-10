const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA6UwjNedf-O2EnAtQ3PM10jhRmOTPm8Zk",
  authDomain: "tribly-fd1d8.firebaseapp.com",
  projectId: "tribly-fd1d8",
  storageBucket: "tribly-fd1d8.firebasestorage.app",
  messagingSenderId: "172169964683",
  appId: "1:172169964683:web:c14e63a6bbac279c25b88e"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addAssigneesToEvents() {
  try {
    console.log('🔍 Récupération des événements de la famille de test...');
    const familyId = 'famille-questroy-test';
    const eventsSnapshot = await getDocs(collection(db, 'families', familyId, 'events'));
    
    const updates = [];
    eventsSnapshot.docs.forEach(docSnapshot => {
      const eventData = docSnapshot.data();
      if (!eventData.assignees || eventData.assignees.length === 0) {
        updates.push({
          id: docSnapshot.id,
          title: eventData.title
        });
      }
    });
    
    console.log(`📝 ${updates.length} événements à mettre à jour`);
    
    for (const update of updates) {
      await updateDoc(doc(db, 'families', familyId, 'events', update.id), {
        assignees: ['rosaly-001', 'ludwig-002'] // IDs des parents de la famille de test
      });
      console.log(`✅ Événement mis à jour: ${update.title}`);
    }
    
    console.log('🎉 Tous les événements ont été mis à jour avec des assignés!');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

addAssigneesToEvents();