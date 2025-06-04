// src/types/calendar.ts
import { Timestamp } from 'firebase/firestore';

export type EventType = 'family' | 'personal' | 'reminder' | 'task' | 'appointment';
export type EventRecurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  allDay: boolean;
  type: EventType;
  createdBy: string;      // ID du membre qui a créé l'événement
  assignees?: string[];   // IDs des membres assignés à l'événement
  color?: string;         // Couleur de l'événement
  recurrence?: EventRecurrence;
  recurrenceEndDate?: Date | Timestamp;
  reminder?: number;      // Minutes avant l'événement pour le rappel
  completed?: boolean;    // Pour les événements de type 'task' ou 'reminder'
  completedBy?: string;   // ID du membre qui a complété l'événement
  completedAt?: Date | Timestamp;
  tribs?: number;         // Points Tribs associés (pour tâches)
}

export interface CalendarViewState {
  selectedDate: Date;
  currentMonth: Date;
  events: Record<string, CalendarEvent[]>; // Clé: YYYY-MM-DD, Valeur: événements du jour
  view: 'month' | 'week' | 'day' | 'agenda';
}