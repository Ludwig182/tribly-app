// create-test-family.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA6UwjNedf-O2EnAtQ3PM10jhRmOTPm8Zk",
  authDomain: "tribly-fd1d8.firebaseapp.com",
  projectId: "tribly-fd1d8",
  storageBucket: "tribly-fd1d8.firebasestorage.app",
  messagingSenderId: "172169964683",
  appId: "1:172169964683:web:c14e63a6bbac279c25b88e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestFamily() {
  try {
    console.log('🔥 Création famille Questroy...');
    
    const familyData = {
      name: 'Questroy',
      createdAt: serverTimestamp(),
      members: [
        {
          id: 'rosaly-001',
          name: 'Rosaly',
          role: 'parent',
          age: 35,
          tribs: 235,
          avatar: '👩‍💼',
          color: '#FF8A80'
        },
        {
          id: 'ludwig-002', 
          name: 'Ludwig',
          role: 'parent',
          age: 37,
          tribs: 180,
          avatar: '👨‍💼',
          color: '#7986CB'
        },
        {
          id: 'clementine-003',
          name: 'Clémentine',
          role: 'child',
          age: 12,
          tribs: 120,
          avatar: '👧',
          color: '#FFCC80'
        },
        {
          id: 'jacob-004',
          name: 'Jacob', 
          role: 'child',
          age: 8,
          tribs: 85,
          avatar: '👦',
          color: '#81C784'
        }
      ],
      settings: {
        tribsGoal: 500,
        notifications: true,
        theme: 'neutral'
      }
    };

    await setDoc(doc(db, 'families', 'famille-questroy-test'), familyData);
    console.log('✅ Famille Questroy créée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createTestFamily();
