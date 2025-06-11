// src/services/calendarService.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { familyService } from './familyService';

export const calendarService = {

  // ===== MÉTHODES DE BASE =====

  getEventsCollection(familyId) {
    return collection(db, 'families', familyId, 'events');
  },

  // Formater une date pour l'utiliser comme clé dans un objet d'événements
  formatDateKey(date) {
    const d = date instanceof Date ? date : new Date(date.seconds * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  // Convertir une date en Timestamp Firebase
  toTimestamp(date) {
    if (!date) return null;
    if (date instanceof Timestamp) return date;
    return Timestamp.fromDate(date instanceof Date ? date : new Date(date));
  },

  // ===== OPÉRATIONS CRUD =====

  async addEvent(familyId, eventData, currentUser) {
    try {
      console.log('🔄 Ajout événement:', { familyId, eventData, currentUser: currentUser?.name || 'unknown' });
      
      // Validation de base
      if (!eventData.title) {
        throw new Error('Le titre est obligatoire');
      }

      if (!eventData.startDate) {
        throw new Error('La date de début est obligatoire');
      }

      // Préparation des données
      const eventsRef = this.getEventsCollection(familyId);
      const eventDoc = {
        ...eventData,
        startDate: this.toTimestamp(eventData.startDate),
        endDate: eventData.endDate ? this.toTimestamp(eventData.endDate) : null,
        recurrenceEndDate: eventData.recurrenceEndDate ? this.toTimestamp(eventData.recurrenceEndDate) : null,
        createdBy: typeof currentUser === 'string' ? currentUser : (currentUser?.id || 'unknown'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Ajout dans Firebase
      const docRef = await addDoc(eventsRef, eventDoc);
      console.log('✅ Événement ajouté:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur ajout événement:', error);
      throw error;
    }
  },

  async updateEvent(familyId, eventId, eventData) {
    try {
      console.log('🔄 Mise à jour événement:', { familyId, eventId, eventData });
      
      // Validation de base
      if (!eventId) {
        throw new Error('ID événement manquant');
      }

      // Préparation des données
      const eventRef = doc(db, 'families', familyId, 'events', eventId);
      const updateData = {
        ...eventData,
        updatedAt: serverTimestamp()
      };

      // Conversion des dates en Timestamp
      if (eventData.startDate) {
        updateData.startDate = this.toTimestamp(eventData.startDate);
      }
      
      if (eventData.endDate) {
        updateData.endDate = this.toTimestamp(eventData.endDate);
      }
      
      if (eventData.recurrenceEndDate) {
        updateData.recurrenceEndDate = this.toTimestamp(eventData.recurrenceEndDate);
      }

      if (eventData.completedAt) {
        updateData.completedAt = this.toTimestamp(eventData.completedAt);
      }

      // Mise à jour dans Firebase
      await updateDoc(eventRef, updateData);
      console.log('✅ Événement mis à jour:', eventId);
      return eventId;
    } catch (error) {
      console.error('❌ Erreur mise à jour événement:', error);
      throw error;
    }
  },

  async deleteEvent(familyId, eventId) {
    try {
      console.log('🗑️ Suppression événement:', { familyId, eventId });
      
      // Validation de base
      if (!eventId) {
        throw new Error('ID événement manquant');
      }

      // Suppression dans Firebase
      const eventRef = doc(db, 'families', familyId, 'events', eventId);
      await deleteDoc(eventRef);
      console.log('✅ Événement supprimé:', eventId);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression événement:', error);
      throw error;
    }
  },

  async getEvent(familyId, eventId) {
    try {
      console.log('🔍 Récupération événement:', { familyId, eventId });
      
      // Validation de base
      if (!eventId) {
        throw new Error('ID événement manquant');
      }

      // Récupération dans Firebase
      const eventRef = doc(db, 'families', familyId, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (!eventSnap.exists()) {
        throw new Error('Événement introuvable');
      }
      
      return { id: eventSnap.id, ...eventSnap.data() };
    } catch (error) {
      console.error('❌ Erreur récupération événement:', error);
      throw error;
    }
  },

  // ===== ABONNEMENTS =====

  subscribeToEvents(familyId, callback) {
    const eventsRef = this.getEventsCollection(familyId);
    const q = query(eventsRef, orderBy('startDate', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const events = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const event = {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : (data.startDate || null),
          endDate: data.endDate?.toDate ? data.endDate.toDate() : (data.endDate || null),
        };
        if (event.recurrence && event.recurrence.endDate?.toDate) {
          event.recurrence.endDate = event.recurrence.endDate.toDate();
        }
        if (data.completedAt?.toDate) {
          event.completedAt = data.completedAt.toDate();
        }
        events.push(event);
      });
      
      console.log('✅ Événements Firebase synchronisés:', events.length);
      callback(events);
    }, (error) => {
      console.error('❌ Erreur écoute événements:', error);
      callback([], error);
    });
  },

  subscribeToEventsForMonth(familyId, year, month, callback) {
    // Créer les dates de début et de fin du mois
    const startDate = new Date(year, month, 1, 0, 0, 0);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    
    const eventsRef = this.getEventsCollection(familyId);
    const q = query(
      eventsRef,
      where('startDate', '>=', this.toTimestamp(startDate)),
      where('startDate', '<=', this.toTimestamp(endDate)),
      orderBy('startDate', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const events = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const event = {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : (data.startDate || null),
          endDate: data.endDate?.toDate ? data.endDate.toDate() : (data.endDate || null),
        };
        if (event.recurrence && event.recurrence.endDate?.toDate) {
          event.recurrence.endDate = event.recurrence.endDate.toDate();
        }
        if (data.completedAt?.toDate) {
          event.completedAt = data.completedAt.toDate();
        }
        events.push(event);
      });
      
      console.log(`✅ Événements pour ${month+1}/${year} synchronisés:`, events.length);
      callback(events);
    }, (error) => {
      console.error('❌ Erreur écoute événements du mois:', error);
      callback([], error);
    });
  },

  // ===== UTILITAIRES =====

  // Organiser les événements par date
  organizeEventsByDate(events) {
    const eventsByDate = {};
    
    events.forEach(event => {
      const dateKey = this.formatDateKey(event.startDate);
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });
    
    return eventsByDate;
  },

  // Marquer un événement comme complété
  async completeEvent(familyId, eventId, currentUserId) {
    try {
      console.log('✅ Complétion événement:', { familyId, eventId, currentUserId });
      
      // Récupérer l'événement
      const event = await this.getEvent(familyId, eventId);
      
      // Mise à jour
      await this.updateEvent(familyId, eventId, {
        completed: true,
        status: 'completed',
        completedBy: currentUserId,
        completedAt: new Date()
      });
      
      // Si l'événement a des Tribs, les attribuer
      if (event.tribs && event.tribs > 0) {
        await familyService.updateMemberTribs(familyId, currentUserId, event.tribs);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur complétion événement:', error);
      throw error;
    }
  },

  // Annuler la complétion d'un événement
  async uncompleteEvent(familyId, eventId) {
    try {
      console.log('🔄 Annulation complétion événement:', { familyId, eventId });
      
      // Récupérer l'événement
      const event = await this.getEvent(familyId, eventId);
      
      // Si l'événement a des Tribs et était complété, les retirer
      if (event.completed && event.tribs && event.tribs > 0 && event.completedBy) {
        await familyService.updateMemberTribs(familyId, event.completedBy, -event.tribs);
      }
      
      // Mise à jour
      await this.updateEvent(familyId, eventId, {
        completed: false,
        status: 'pending',
        completedBy: null,
        completedAt: null
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erreur annulation complétion événement:', error);
      throw error;
    }
  }
};