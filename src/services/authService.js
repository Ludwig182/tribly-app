// src/services/authService.js – version unifiée (utilise l'auth partagée)
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { familyService } from './familyService';

export const authService = {
  /* ───────── Auth Email ───────── */
  async signInWithEmail(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: cred.user };
  },

  async signUpWithEmail(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    return { user: cred.user };
  },

  async signOut() {
    await firebaseSignOut(auth);
  },

  /* ───────── Famille ───────── */
  async getOrCreateFamilyMember(firebaseUser, familyId = 'famille-questroy-test') {
      console.log('🧩 Firebase user reçu :', {
      email: firebaseUser.email,
      uid: firebaseUser.uid
    });
    const family = await familyService.getFamily(familyId);
    console.log('👪 Famille récupérée :', family.familyName);
  console.log('🔎 Membres de la famille :', family.members.map(m => ({
    name: m.name,
    email: m.email,
    firebaseUid: m.firebaseUid
  })));
    const found = family.members?.find(m =>
      m.email === firebaseUser.email || m.firebaseUid === firebaseUser.uid
    );
console.log('🔗 Membre correspondant trouvé :', found ? found.name : '❌ Aucun');

    if (found) return { member: found, familyId, isNewMember: false };

    const newMemberData = {
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      email: firebaseUser.email,
      firebaseUid: firebaseUser.uid,
      role: family.members?.length ? 'child' : 'admin',
      avatar: '👤',
      color: '#7986CB',
      tribs: 0,
      joinedAt: new Date().toISOString()
    };
    console.log('➕ Nouveau membre à créer :', newMemberData);
    const member = await familyService.addMember(familyId, newMemberData);

    return { member, familyId, isNewMember: true };
  }
};
