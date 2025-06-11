// src/types/calendar.ts
import { Timestamp } from 'firebase/firestore';

export type EventPriority = 'normal' | 'urgent';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface EventRecurrence {
  type: RecurrenceType;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: string;
  occurrences?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  allDay: boolean;
  // type: EventType; // Supprimé - plus de catégories
  priority?: EventPriority; // Priorité de l'événement
  createdBy: string;      // ID du membre qui a créé l'événement
  assignees?: string[];   // IDs des membres assignés à l'événement
  color?: string;         // Couleur de l'événement
  recurrence?: EventRecurrence;
  recurrenceEndDate?: Date | Timestamp;
  reminders?: number[] | null; // Minutes avant l'événement pour les rappels
  status?: 'pending' | 'completed' | 'in_progress';
  completed?: boolean;    // Pour les événements de type 'task' ou 'reminder'
  completedBy?: string;   // ID du membre qui a complété l'événement
  completedAt?: Date | Timestamp;
  tribs?: number;         // Points Tribs associés (pour tâches)
  // Propriétés pour les instances d'événements récurrents
  isRecurrenceInstance?: boolean; // Indique si c'est une instance générée d'un événement récurrent
  recurrenceParentId?: string;    // ID de l'événement parent pour les instances récurrentes
}

export interface CalendarViewState {
  selectedDate: Date;
  currentMonth: Date;
  events: Record<string, CalendarEvent[]>; // Clé: YYYY-MM-DD, Valeur: événements du jour
  view: 'month' | 'week' | 'day' | 'agenda';
}