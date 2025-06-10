// src/hooks/useCalendar.js
import React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFamily } from './useFamily';
import { calendarService } from '../services/calendarService';
import { expandRecurringEvents } from '../utils/recurrenceUtils';

// Création du contexte
const CalendarContext = createContext();

// Hook pour utiliser le contexte
export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar doit être utilisé à l'intérieur d'un CalendarProvider");
  }
  return context;
};

// Provider du contexte
export const CalendarProvider = ({ children }) => {
  // Récupération des données de la famille
  const { familyData, currentMember, loading: familyLoading } = useFamily();
  
  // États
  const [events, setEvents] = useState([]);
  const [eventsByDate, setEventsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day', 'agenda'
  const [viewMode, setViewMode] = useState('month'); // Alias pour view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    // eventTypes: [], // Supprimé - plus de catégories
    priorities: [],
    assignedMembers: [],
    dateRange: { start: null, end: null },
    showCompleted: true,
    showOverdue: true,
    hasTribs: false
  });
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  // État pour stocker les événements bruts (avant expansion des récurrences)
  const [rawEvents, setRawEvents] = useState([]);
  
  // Fonction pour calculer la plage de dates pour l'expansion des événements récurrents
  const getRecurrenceRange = useCallback(() => {
    const today = new Date();
    // Par défaut, on génère les occurrences pour les 3 prochains mois
    const startRange = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Mois précédent
    const endRange = new Date(today.getFullYear(), today.getMonth() + 3, 0); // 3 mois après
    return { startRange, endRange };
  }, []);
  
  // Fonction pour étendre les événements récurrents
  const expandEvents = useCallback((eventsData) => {
    const { startRange, endRange } = getRecurrenceRange();
    const expandedEvents = expandRecurringEvents(eventsData || [], startRange, endRange);
    console.log('📅 Événements après expansion des récurrences:', expandedEvents.length);
    return expandedEvents;
  }, [getRecurrenceRange]);
  
  // Abonnement aux événements
  useEffect(() => {
    if (!familyData?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    console.log('🔄 Initialisation abonnement événements');
    
    // Abonnement aux événements
    const unsubscribe = calendarService.subscribeToEvents(familyData.id, (eventsData, err) => {
      if (err) {
        console.error('❌ Erreur récupération événements:', err);
        setError(err.message);
        setLoading(false);
        return;
      }
      
      console.log('📅 Événements reçus:', eventsData?.length || 0);
      
      // Stocker les événements bruts
      setRawEvents(eventsData || []);
      
      // Étendre les événements récurrents
      const expandedEvents = expandEvents(eventsData);
      setEvents(expandedEvents);
      
      // Organiser les événements par date
      const organized = calendarService.organizeEventsByDate(expandedEvents);
      setEventsByDate(organized);
      
      setLoading(false);
    });
    
    return () => {
      console.log('🔄 Nettoyage abonnement événements');
      unsubscribe();
    };
  }, [familyData?.id, expandEvents]);
  
  // Effet pour filtrer les événements
  useEffect(() => {
    console.log('[useCalendar] Initial events for filtering:', JSON.parse(JSON.stringify(events)));
    console.log('[useCalendar] Current filters:', JSON.parse(JSON.stringify(filters)));
    if (!events.length) {
      console.log('[useCalendar] No events to filter, setting filteredEvents to empty array.');
      setFilteredEvents([]);
      return;
    }
    
    let filtered = [...events];
    console.log('[useCalendar] Before any filtering, copied events:', JSON.parse(JSON.stringify(filtered)));
    
    // Filtre par recherche
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
      console.log('[useCalendar] After search query filter:', JSON.parse(JSON.stringify(filtered)));
    }
    
    // Filtrage par type supprimé - plus de catégories
    
    // Filtre par priorité
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(event => 
        filters.priorities.includes(event.priority)
      );
      console.log('[useCalendar] After priorities filter:', JSON.parse(JSON.stringify(filtered)));
    }
    
    // Filtre par membres assignés
    if (filters.assignedMembers.length > 0) {
      filtered = filtered.filter(event => 
        event.assignedMembers?.some(memberId => 
          filters.assignedMembers.includes(memberId)
        )
      );
      console.log('[useCalendar] After assigned members filter:', JSON.parse(JSON.stringify(filtered)));
    }
    
    // Filtre par plage de dates
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startDate);
        // Ensure to compare date parts only if time is not relevant or set to start/end of day
        const filterStartDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const filterEndDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (filterStartDate) filterStartDate.setHours(0,0,0,0); // Compare from start of day
        if (filterEndDate) filterEndDate.setHours(23,59,59,999); // Compare till end of day
        
        const currentEventDate = new Date(eventDate);
        currentEventDate.setHours(0,0,0,0); // Normalize event date for comparison if needed, or use full timestamp

        if (filterStartDate && currentEventDate < filterStartDate) return false;
        if (filterEndDate && currentEventDate > filterEndDate) return false;
        return true;
      });
      console.log('[useCalendar] After date range filter:', JSON.parse(JSON.stringify(filtered)));
    }
    
    // Filtre événements terminés
    if (!filters.showCompleted) {
      filtered = filtered.filter(event => !event.completed);
      console.log('[useCalendar] After showCompleted=false filter:', JSON.parse(JSON.stringify(filtered)));
    }
    
    // Filtre événements en retard
    if (!filters.showOverdue) {
      const now = new Date();
      now.setHours(0,0,0,0); // Compare with the start of today for overdue
      filtered = filtered.filter(event => {
        const eventStartDate = new Date(event.startDate);
        eventStartDate.setHours(0,0,0,0);
        // An event is NOT overdue if its start date is today or in the future, OR if it's completed
        return eventStartDate >= now || event.completed;
      });
      console.log('[useCalendar] After showOverdue=false filter:', JSON.parse(JSON.stringify(filtered)));
    }
    
    // Filtre événements avec Tribs
    if (filters.hasTribs) {
      filtered = filtered.filter(event => event.tribsReward > 0);
      console.log('[useCalendar] After hasTribs filter:', JSON.parse(JSON.stringify(filtered)));
    }
    
    console.log('[useCalendar] Final filteredEvents to be set:', JSON.parse(JSON.stringify(filtered)));
    setFilteredEvents(filtered);
  }, [events, filters]);
  
  // Fonctions d'action
  const changeMonth = useCallback((direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  }, [currentMonth]);
  
  const changeView = useCallback((newView) => {
    setView(newView);
  }, []);
  
  const addEvent = useCallback(async (eventData) => {
    if (!familyData?.id) return;
    
    try {
      await calendarService.addEvent(familyData.id, {
        ...eventData,
        createdBy: currentMember?.id || 'unknown'
      });
    } catch (error) {
      console.error('❌ Erreur ajout événement:', error);
      setError(error.message);
    }
  }, [familyData?.id, currentMember]);
  
  const updateEvent = useCallback(async (eventId, updates) => {
    if (!familyData?.id) return;
    
    try {
      await calendarService.updateEvent(familyData.id, eventId, updates);
    } catch (error) {
      console.error('❌ Erreur mise à jour événement:', error);
      setError(error.message);
    }
  }, [familyData?.id]);
  
  const deleteEvent = useCallback(async (eventId) => {
    if (!familyData?.id) return;
    
    try {
      await calendarService.deleteEvent(familyData.id, eventId);
    } catch (error) {
      console.error('❌ Erreur suppression événement:', error);
      setError(error.message);
    }
  }, [familyData?.id]);
  
  const completeEvent = useCallback(async (eventId) => {
    if (!familyData?.id || !currentMember) return;
    
    try {
      await calendarService.completeEvent(familyData.id, eventId, currentMember);
    } catch (error) {
      console.error('❌ Erreur complétion événement:', error);
      setError(error.message);
    }
  }, [familyData?.id, currentMember]);
  
  const uncompleteEvent = useCallback(async (eventId) => {
    if (!familyData?.id) return;
    
    try {
      await calendarService.uncompleteEvent(familyData.id, eventId);
    } catch (error) {
      console.error('❌ Erreur annulation complétion événement:', error);
      setError(error.message);
    }
  }, [familyData?.id]);
  
  const getEventsForDate = useCallback((date) => {
    const dateStr = date.toISOString().split('T')[0];
    return eventsByDate[dateStr] || [];
  }, [eventsByDate]);

  // Fonctions de navigation
  const navigateToNextDay = useCallback(() => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
    setSelectedDate(nextDay); // Mettre à jour selectedDate aussi pour la vue jour
  }, [currentDate, selectedDate]);

  const navigateToPreviousDay = useCallback(() => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDay);
    setSelectedDate(prevDay); // Mettre à jour selectedDate aussi pour la vue jour
  }, [currentDate, selectedDate]);

  const navigateToNextWeek = useCallback(() => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
  }, [currentDate]);

  const navigateToPreviousWeek = useCallback(() => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
  }, [currentDate]);

  const navigateToNextMonth = useCallback(() => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(nextMonth);
  }, [currentDate]);

  const navigateToPreviousMonth = useCallback(() => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prevMonth);
  }, [currentDate]);

  const navigateToNext = useCallback(() => {
    if (viewMode === 'day') {
      navigateToNextDay();
    } else if (viewMode === 'week') {
      navigateToNextWeek();
    } else {
      navigateToNextMonth();
    }
  }, [viewMode, navigateToNextDay, navigateToNextWeek, navigateToNextMonth]);

  const navigateToPrevious = useCallback(() => {
    if (viewMode === 'day') {
      navigateToPreviousDay();
    } else if (viewMode === 'week') {
      navigateToPreviousWeek();
    } else {
      navigateToPreviousMonth();
    }
  }, [viewMode, navigateToPreviousDay, navigateToPreviousWeek, navigateToPreviousMonth]);

  const navigateToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today); // Assurer que selectedDate est aussi aujourd'hui
  }, []);

  const createEvent = useCallback(async (eventData) => {
    return await addEvent(eventData);
  }, [addEvent]);
  
  // Valeur du contexte simple sans useMemo
  const value = {
    // États
    events,
    eventsByDate,
    filteredEvents,
    selectedDate,
    currentDate,
    currentMonth,
    view,
    viewMode,
    isLoading: loading || familyLoading,
    loading: loading || familyLoading,
    error,
    filters,
    
    // Actions
    setSelectedDate,
    selectDate: setSelectedDate, // Alias pour compatibilité
    setCurrentDate,
    setViewMode,
    changeMonth,
    changeView,
    navigateToNext,
    navigateToPrevious,
    navigateToToday,
    navigateToNextDay,
    navigateToPreviousDay,
    navigateToNextWeek,
    navigateToPreviousWeek,
    navigateToNextMonth,
    navigateToPreviousMonth,
    addEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    uncompleteEvent,
    getEventsForDate,
    setFilters,
  };
  
  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};