import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
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
import EventModal from './EventModal';
import { CalendarEvent, ViewMode } from '../../types/calendar';

type CalendarScreenProps = {
  initialViewMode?: ViewMode;
};

const CalendarScreen: React.FC<CalendarScreenProps> = ({ 
  initialViewMode = 'month' 
}) => {
  const theme = useTheme();
  const { familyData } = useFamily();
  const {    currentDate,    selectedDate,    viewMode,    events,    filteredEvents,    filters,    isLoading,    error,    navigateToNext,    navigateToPrevious,    navigateToToday,    setCurrentDate,    selectDate,    setViewMode,    createEvent,    updateEvent,    deleteEvent,    completeEvent,    setFilters  } = useCalendar();
  
  const familyMembers = familyData?.members || [];

  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

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

  const handleEventCreate = () => {
    setSelectedEvent(undefined);
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
  };

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
            events={filteredEvents}
            onEventSelect={handleEventSelect}
            onDateSelect={selectDate}
            onEventCreate={handleEventCreate}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={selectedDate || currentDate}
            events={filteredEvents}
            onEventSelect={handleEventSelect}
            onEventCreate={handleEventCreate}
          />
        );
      case 'agenda':
        return (
          <AgendaView
            events={filteredEvents}
            onEventSelect={handleEventSelect}
            onEventCreate={handleEventCreate}
          />
        );
      default:
        return (
          <CalendarGrid
            currentDate={currentDate}
            events={filteredEvents}
            selectedDate={selectedDate}
            onDateSelect={selectDate}
            onEventSelect={handleEventSelect}
            onEventCreate={handleEventCreate}
          />
        );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingBottom: 20,
      position: 'relative',
      overflow: 'hidden',
      minHeight: 120,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    circle: {
      position: 'absolute',
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    circle1: {
      width: 100,
      height: 100,
      top: -30,
      right: -20,
    },
    circle2: {
      width: 60,
      height: 60,
      top: 40,
      right: 80,
    },
    circle3: {
      width: 80,
      height: 80,
      top: -10,
      left: -25,
    },
    headerSafeAreaInternal: {
      flex: 1,
      minHeight: 160,
    },
    headerActualContent: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      paddingTop: 4,
      zIndex: 12,
      position: 'relative',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 5,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      textTransform: 'capitalize',
    },
    navigationSection: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
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
            <Text style={styles.headerTitle}>📅 Calendrier Familial</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      <View style={styles.navigationSection}>
        <CalendarHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          familyMembers={familyMembers}
          onFiltersChange={setFilters}
          onNavigateNext={navigateToNext}
          onNavigatePrevious={navigateToPrevious}
          onNavigateToday={navigateToToday}
          currentDate={currentDate}
        />
      </View>
      
      <View style={styles.content}>
        {renderCalendarView()}
      </View>

      <EventModal
        visible={isEventModalVisible}
        event={selectedEvent}
        selectedDate={selectedDate}
        familyMembers={familyMembers}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        onClose={handleEventCancel}
      />
    </View>
  );
};

export default CalendarScreen;