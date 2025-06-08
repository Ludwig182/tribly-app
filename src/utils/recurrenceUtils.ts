// src/utils/recurrenceUtils.ts
import { CalendarEvent, EventRecurrence } from '../types/calendar';

/**
 * Génère les occurrences d'un événement récurrent dans une plage de dates donnée
 * @param baseEvent L'événement de base à partir duquel générer les occurrences
 * @param startRange Début de la plage de dates pour laquelle générer les occurrences
 * @param endRange Fin de la plage de dates pour laquelle générer les occurrences
 * @returns Un tableau d'événements représentant toutes les occurrences dans la plage
 */
export const generateRecurrenceOccurrences = (
  baseEvent: CalendarEvent,
  startRange: Date,
  endRange: Date
): CalendarEvent[] => {
  // Si l'événement n'a pas de récurrence, retourner simplement l'événement lui-même
  if (!baseEvent.recurrence) {
    return [baseEvent];
  }

  const recurrence = baseEvent.recurrence;
  const occurrences: CalendarEvent[] = [];
  
  // Date de début de l'événement de base
  const baseStartDate = new Date(baseEvent.startDate);
  
  // Calculer la durée de l'événement (pour maintenir la même durée pour chaque occurrence)
  const duration = baseEvent.endDate 
    ? new Date(baseEvent.endDate).getTime() - baseStartDate.getTime() 
    : 0;

  // Déterminer la date de fin de récurrence
  let recurrenceEndDate: Date | null = null;
  
  if (recurrence.endDate) {
    recurrenceEndDate = new Date(recurrence.endDate);
  } else if (recurrence.occurrences) {
    // Calculer la date de fin basée sur le nombre d'occurrences
    recurrenceEndDate = calculateEndDateFromOccurrences(baseStartDate, recurrence);
  }

  // Si la date de fin de récurrence est avant la plage demandée, aucune occurrence à générer
  if (recurrenceEndDate && recurrenceEndDate < startRange) {
    return [];
  }

  // Générer les occurrences en fonction du type de récurrence
  let currentDate = new Date(baseStartDate);
  let occurrenceCount = 0;
  
  while (
    (!recurrenceEndDate || currentDate <= recurrenceEndDate) && 
    currentDate <= endRange && 
    (!recurrence.occurrences || occurrenceCount < recurrence.occurrences)
  ) {
    // Vérifier si l'occurrence est dans la plage demandée
    if (currentDate >= startRange && currentDate <= endRange) {
      // Vérifier les conditions spécifiques au type de récurrence
      if (shouldIncludeOccurrence(currentDate, recurrence)) {
        // Créer une nouvelle occurrence
        const occurrence: CalendarEvent = {
          ...baseEvent,
          id: `${baseEvent.id}_${currentDate.toISOString()}`, // ID unique pour chaque occurrence
          startDate: new Date(currentDate),
          endDate: duration > 0 ? new Date(currentDate.getTime() + duration) : undefined,
          isRecurrenceInstance: true,
          recurrenceParentId: baseEvent.id,
        };
        
        occurrences.push(occurrence);
      }
    }
    
    // Passer à la prochaine date potentielle
    currentDate = getNextOccurrenceDate(currentDate, recurrence);
    occurrenceCount++;
  }

  return occurrences;
};

/**
 * Calcule la date de fin basée sur le nombre d'occurrences
 */
const calculateEndDateFromOccurrences = (startDate: Date, recurrence: EventRecurrence): Date => {
  let endDate = new Date(startDate);
  const occurrences = recurrence.occurrences || 1;
  
  for (let i = 0; i < occurrences - 1; i++) {
    endDate = getNextOccurrenceDate(endDate, recurrence);
  }
  
  return endDate;
};

/**
 * Détermine si une date spécifique doit être incluse comme occurrence
 * en fonction des règles de récurrence (jours de la semaine, jour du mois, etc.)
 */
const shouldIncludeOccurrence = (date: Date, recurrence: EventRecurrence): boolean => {
  switch (recurrence.type) {
    case 'daily':
      return true; // Toutes les dates sont incluses pour une récurrence quotidienne
      
    case 'weekly':
      // Vérifier si le jour de la semaine est inclus dans daysOfWeek
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        // Convertir le jour de la semaine JavaScript (0-6, dimanche-samedi) au format utilisé dans l'application (1-7, lundi-dimanche)
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        return recurrence.daysOfWeek.includes(dayOfWeek);
      }
      return true; // Si aucun jour spécifié, inclure tous les jours
      
    case 'monthly':
      // Vérifier si le jour du mois correspond
      if (recurrence.dayOfMonth) {
        return date.getDate() === recurrence.dayOfMonth;
      }
      return true; // Si aucun jour spécifié, inclure tous les jours
      
    case 'yearly':
      // Vérifier si le mois correspond
      if (recurrence.monthOfYear) {
        // Les mois JavaScript sont 0-11, mais notre modèle utilise 1-12
        return date.getMonth() + 1 === recurrence.monthOfYear;
      }
      return true; // Si aucun mois spécifié, inclure tous les mois
      
    default:
      return true;
  }
};

/**
 * Calcule la date de la prochaine occurrence potentielle
 */
const getNextOccurrenceDate = (currentDate: Date, recurrence: EventRecurrence): Date => {
  const nextDate = new Date(currentDate);
  const interval = recurrence.interval || 1;
  
  switch (recurrence.type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
      
    case 'weekly':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        // Si des jours spécifiques sont définis, trouver le prochain jour valide
        const currentDayOfWeek = nextDate.getDay() === 0 ? 7 : nextDate.getDay(); // Convertir dimanche (0) en 7
        const sortedDays = [...recurrence.daysOfWeek].sort((a, b) => a - b);
        
        // Trouver le prochain jour de la semaine
        const nextDayOfWeek = sortedDays.find(day => day > currentDayOfWeek);
        
        if (nextDayOfWeek) {
          // Il y a un jour cette semaine
          const daysToAdd = nextDayOfWeek - currentDayOfWeek;
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        } else {
          // Passer à la semaine suivante et prendre le premier jour défini
          const daysToAdd = 7 - currentDayOfWeek + sortedDays[0];
          nextDate.setDate(nextDate.getDate() + daysToAdd + (interval - 1) * 7);
        }
      } else {
        // Si aucun jour spécifique n'est défini, simplement ajouter des semaines
        nextDate.setDate(nextDate.getDate() + interval * 7);
      }
      break;
      
    case 'monthly':
      if (recurrence.dayOfMonth) {
        // Si un jour du mois est spécifié
        const currentMonth = nextDate.getMonth();
        nextDate.setMonth(currentMonth + interval);
        
        // S'assurer que le jour est valide pour le mois
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(recurrence.dayOfMonth, lastDayOfMonth));
      } else {
        // Si aucun jour spécifique n'est défini
        nextDate.setMonth(nextDate.getMonth() + interval);
      }
      break;
      
    case 'yearly':
      if (recurrence.monthOfYear) {
        // Si un mois spécifique est défini
        let yearToAdd = interval;
        
        // Si le mois actuel est avant le mois spécifié, on peut rester dans la même année
        if (nextDate.getMonth() + 1 < recurrence.monthOfYear && interval === 1) {
          yearToAdd = 0;
        }
        
        nextDate.setFullYear(nextDate.getFullYear() + yearToAdd);
        nextDate.setMonth(recurrence.monthOfYear - 1); // Convertir 1-12 en 0-11
      } else {
        // Si aucun mois spécifique n'est défini
        nextDate.setFullYear(nextDate.getFullYear() + interval);
      }
      break;
  }
  
  return nextDate;
};

/**
 * Étend les événements récurrents pour une plage de dates donnée
 * @param events Liste des événements de base
 * @param startRange Début de la plage de dates
 * @param endRange Fin de la plage de dates
 * @returns Liste étendue incluant toutes les occurrences récurrentes
 */
export const expandRecurringEvents = (
  events: CalendarEvent[],
  startRange: Date,
  endRange: Date
): CalendarEvent[] => {
  console.log('[expandRecurringEvents] Expanding events. Start range:', startRange, 'End range:', endRange);
  const result: CalendarEvent[] = [];
  
  // Traiter chaque événement
  events.forEach(event => {
    console.log('[expandRecurringEvents] Processing event:', event.id, 'Start date:', event.startDate, 'Recurrence:', event.recurrence);
    // Ajouter l'événement de base s'il est dans la plage
    const eventStartDate = new Date(event.startDate);
    if (eventStartDate >= startRange && eventStartDate <= endRange) {
      result.push(event);
    }
    
    // Si l'événement est récurrent, générer et ajouter ses occurrences
    if (event.recurrence) {
      const occurrences = generateRecurrenceOccurrences(event, startRange, endRange);
      console.log('[expandRecurringEvents] Event ID:', event.id, 'Generated occurrences:', occurrences.length);
      result.push(...occurrences);
    }
  });
  
  // Trier les événements par date
  return result.sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateA - dateB;
  });
};

/**
 * Trouve l'événement parent d'une instance récurrente
 * @param instance L'instance récurrente
 * @param events Liste des événements
 * @returns L'événement parent ou undefined si non trouvé
 */
export const findRecurrenceParent = (
  instance: CalendarEvent,
  events: CalendarEvent[]
): CalendarEvent | undefined => {
  if (!instance.isRecurrenceInstance || !instance.recurrenceParentId) {
    return undefined;
  }
  
  return events.find(event => event.id === instance.recurrenceParentId);
};

/**
 * Génère un ID unique pour une instance d'événement récurrent
 * @param parentId ID de l'événement parent
 * @param date Date de l'occurrence
 * @returns ID unique pour l'instance
 */
export const generateRecurrenceInstanceId = (parentId: string, date: Date): string => {
  return `${parentId}_${date.toISOString()}`;
};

/**
 * Vérifie si un événement est une instance récurrente
 * @param event L'événement à vérifier
 * @returns true si c'est une instance récurrente, false sinon
 */
export const isRecurrenceInstance = (event: CalendarEvent): boolean => {
  return !!event.isRecurrenceInstance && !!event.recurrenceParentId;
};

/**
 * Extrait la date d'une instance récurrente à partir de son ID
 * @param instanceId ID de l'instance récurrente
 * @returns La date de l'instance ou null si le format est invalide
 */
export const extractDateFromInstanceId = (instanceId: string): Date | null => {
  const parts = instanceId.split('_');
  if (parts.length < 2) return null;
  
  try {
    // L'ID est au format parentId_ISO8601Date
    const dateString = parts.slice(1).join('_'); // Rejoindre au cas où l'ID parent contient des underscores
    return new Date(dateString);
  } catch (error) {
    console.error('Format d\'ID d\'instance invalide:', instanceId);
    return null;
  }
};

/**
 * Détermine si une instance récurrente est la première occurrence
 * @param instance L'instance récurrente
 * @param parent L'événement parent
 * @returns true si c'est la première occurrence, false sinon
 */
export const isFirstOccurrence = (instance: CalendarEvent, parent: CalendarEvent): boolean => {
  if (!isRecurrenceInstance(instance) || !parent.recurrence) return false;
  
  const instanceDate = new Date(instance.startDate).getTime();
  const parentDate = new Date(parent.startDate).getTime();
  
  return instanceDate === parentDate;
};