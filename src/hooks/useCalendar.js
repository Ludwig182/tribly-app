// src/hooks/useCalendar.js
import React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFamily } from './useFamily';
import { calendarService } from '../services/calendarService';

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
    eventTypes: [],
    priorities: [],
    assignedMembers: [],
    dateRange: { start: null, end: null },
    showCompleted: true,
    showOverdue: true,
    hasTribs: false
  });
  const [filteredEvents, setFilteredEvents] = useState([]);
  
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
      setEvents(eventsData || []);
      
      // Organiser les événements par date
      const organized = calendarService.organizeEventsByDate(eventsData || []);
      setEventsByDate(organized);
      
      setLoading(false);
    });
    
    return () => {
      console.log('🔄 Nettoyage abonnement événements');
      unsubscribe();
    };
  }, [familyData?.id]);
  
  // Effet pour filtrer les événements
  useEffect(() => {
    if (!events.length) {
      setFilteredEvents([]);
      return;
    }
    
    let filtered = [...events];
    
    // Filtre par recherche
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    }
    
    // Filtre par type d'événement
    if (filters.eventTypes.length > 0) {
      filtered = filtered.filter(event => 
        filters.eventTypes.includes(event.type)
      );
    }
    
    // Filtre par priorité
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(event => 
        filters.priorities.includes(event.priority)
      );
    }
    
    // Filtre par membres assignés
    if (filters.assignedMembers.length > 0) {
      filtered = filtered.filter(event => 
        event.assignedMembers?.some(memberId => 
          filters.assignedMembers.includes(memberId)
        )
      );
    }
    
    // Filtre par plage de dates
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        if (filters.dateRange.start && eventDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && eventDate > filters.dateRange.end) return false;
        return true;
      });
    }
    
    // Filtre événements terminés
    if (!filters.showCompleted) {
      filtered = filtered.filter(event => !event.completed);
    }
    
    // Filtre événements en retard
    if (!filters.showOverdue) {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now || event.completed;
      });
    }
    
    // Filtre événements avec Tribs
    if (filters.hasTribs) {
      filtered = filtered.filter(event => event.tribsReward > 0);
    }
    
    setFilteredEvents(filtered);
  }, [events, filters]);
  
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
      setEvents(eventsData || []);
      
      // Organiser les événements par date
      const organized = calendarService.organizeEventsByDate(eventsData || []);
      setEventsByDate(organized);
      
      setLoading(false);
    });
    
    return () => {
      console.log('🔄 Nettoyage abonnement événements');
      unsubscribe();
    };
  }, [familyData?.id]);
  
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
  const navigateToNext = useCallback(() => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(nextMonth);
  }, [currentDate]);

  const navigateToPrevious = useCallback(() => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prevMonth);
  }, [currentDate]);

  const navigateToToday = useCallback(() => {
    setCurrentDate(new Date());
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