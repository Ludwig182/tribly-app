import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/useTheme';
import { useCalendar } from '../../hooks/useCalendar';
import { useFamily } from '../../hooks/useFamily';
import CalendarGrid from './CalendarGrid';
import WeekView from './WeekView';
import DayView from './DayView';
import AgendaView from './AgendaView';
import CalendarHeader from './CalendarHeader';
import ViewModeSelector from './ViewModeSelector';
import EventModal from './EventModal';
import CalendarIcon from './CalendarIcon';
import EventCounters from './EventCounters';
import PeriodFilters, { PeriodFilter } from './PeriodFilters';
import { CalendarEvent, ViewMode } from '../../types/calendar';

const screenWidth = Dimensions.get('window').width;

// Gradient adaptatif selon le thème
const getHeaderGradient = (theme: any) => ({
  light: theme.colors.headerGradient?.light || ['#FF6B6B', '#4ECDC4'],
  dark: theme.colors.headerGradient?.dark || ['#2C3E50', '#3498DB']
});

type CalendarScreenProps = {
  initialViewMode?: ViewMode;
};

const CalendarScreen: React.FC<CalendarScreenProps> = ({ 
  initialViewMode = 'month' 
}) => {
  const theme = useTheme();
  const { familyData } = useFamily();
  const {
    currentDate,
    selectedDate,
    viewMode,
    events,
    filteredEvents,
    filters,
    isLoading,
    error,
    navigateNext,
    navigatePrevious,
    navigateToday,
    setCurrentDate,
    selectDate,
    setViewMode,
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    setFilters
  } = useCalendar();
  
  const familyMembers = familyData?.members || [];

  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [eventCreationDate, setEventCreationDate] = useState<Date | undefined>();
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<PeriodFilter>('all');

  // Initialiser le viewMode avec la valeur du prop
  useEffect(() => {
    if (initialViewMode && initialViewMode !== viewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode, setViewMode]);

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalVisible(true);
  };

  const handleEventCreate = (dateWithTime?: Date) => {
    console.log('📅 CalendarScreen - Date reçue:', dateWithTime instanceof Date ? dateWithTime.toISOString() : 'undefined', 'Date utilisée:', (dateWithTime || currentDate).toISOString());
    setSelectedEvent(undefined);
    setEventCreationDate(dateWithTime);
    setIsEventModalVisible(true);
  };

  const handleEventSave = async (event: CalendarEvent) => {
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, event);
      } else {
        await createEvent(event);
      }
      setIsEventModalVisible(false);
      setSelectedEvent(undefined);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'événement:', error);
    }
  };

  const handleEventCancel = () => {
    setIsEventModalVisible(false);
    setSelectedEvent(undefined);
    setEventCreationDate(undefined);
  };

  // Filtrer les événements selon la période sélectionnée
  const getFilteredEventsByPeriod = (events: CalendarEvent[]): CalendarEvent[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (selectedPeriodFilter) {
      case 'today':
        return events.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate.toDateString() === today.toDateString();
        });
      
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return events.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= weekStart && eventDate <= weekEnd;
        });
      
      default: // 'all'
        return events;
    }
  };

  // Appliquer le filtre de période aux événements filtrés
  const finalFilteredEvents = getFilteredEventsByPeriod(filteredEvents);

  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      setIsEventModalVisible(false);
      setSelectedEvent(undefined);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
    }
  };

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            events={finalFilteredEvents}
            onEventSelect={handleEventSelect}
            onDateSelect={selectDate}
            onEventCreate={handleEventCreate}
            familyMembers={familyMembers}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={selectedDate || currentDate}
            events={finalFilteredEvents}
            onEventSelect={handleEventSelect}
            onEventCreate={handleEventCreate}
          />
        );
      case 'agenda':
        return (
          <AgendaView
            events={finalFilteredEvents}
            onEventSelect={handleEventSelect}
            onEventCreate={handleEventCreate}
            currentDate={currentDate}
          />
        );
      default:
        return (
          <CalendarGrid
            currentDate={currentDate}
            events={finalFilteredEvents}
            selectedDate={selectedDate}
            onDateSelect={selectDate}
            onEventSelect={handleEventSelect}
            onEventCreate={handleEventCreate}
            familyMembers={familyMembers}
          />
        );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    headerContainer: {
      position: 'relative',
      zIndex: 10,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      marginBottom: 8,
    },
    header: {
      minHeight: screenWidth < 375 ? 130 : 170,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      overflow: 'hidden',
    },
    headerPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    circle: {
      position: 'absolute',
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    circle1: {
      width: 100,
      height: 100,
      top: 80,
      right: -20,
    },
    circle2: {
      width: 60,
      height: 60,
      top: 30,
      right: 80,
    },
    circle3: {
      width: 80,
      height: 80,
      top: 10,
      left: -25,
    },
    headerSafeAreaInternal: {
      flex: 1,
      minHeight: screenWidth < 375 ? 110 : 150,
      justifyContent: 'center',
    },
    headerActualContent: {
      paddingHorizontal: 20,
      paddingVertical: screenWidth < 375 ? 12 : 16,
      zIndex: 12,
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: screenWidth < 375 ? 20 : 24,
      fontWeight: '600',
      color: 'white',
      textAlign: 'left',
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'left',
      textTransform: 'capitalize',
    },
    navigationSection: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    content: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={getHeaderGradient(theme).light}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerPattern}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>
          <SafeAreaView style={styles.headerSafeAreaInternal}>
            <View style={styles.headerActualContent}>
              <View style={styles.headerIconContainer}>
                <CalendarIcon size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Calendrier Familial</Text>
                <Text style={styles.headerSubtitle}>
                  {currentDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
      
      {/* View Mode Selector - Fixed below header */}
        <ViewModeSelector
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          familyMembers={familyMembers}
          onFiltersChange={setFilters}
        />
        
        {/* Period Filters - Below view selector, only for agenda */}
        {viewMode === 'agenda' && (
          <PeriodFilters
            selectedFilter={selectedPeriodFilter}
            onFilterChange={setSelectedPeriodFilter}
          />
        )}
        
        {/* Date Navigation - Below period filters for month/week/day */}
        {viewMode !== 'agenda' && (
          <View style={styles.navigationSection}>
            <CalendarHeader
              viewMode={viewMode}
              onNavigateNext={navigateNext}
              onNavigatePrevious={navigatePrevious}
              onNavigateToday={navigateToday}
              currentDate={currentDate}
            />
          </View>
        )}
      

      
      <View style={styles.content}>
        {renderCalendarView()}
      </View>

      <EventModal
        key={eventCreationDate?.getTime() || selectedDate?.getTime() || 'default'}
        visible={isEventModalVisible}
        event={selectedEvent}
        selectedDate={eventCreationDate || selectedDate}
        familyMembers={familyMembers}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        onClose={handleEventCancel}
      />
    </View>
  );
};

export default CalendarScreen;