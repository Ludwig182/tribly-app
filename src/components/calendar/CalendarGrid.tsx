import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent, FamilyMember } from '../../types/calendar';
import EventCard from './EventCard';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useCalendar } from '../../hooks/useCalendar'; // Importer useCalendar

type CalendarGridProps = {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate?: Date | null;
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (dateWithTime?: Date) => void;
  familyMembers: FamilyMember[];
};

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  selectedDate,
  onDateSelect,
  onEventSelect,
  onEventCreate,
  familyMembers
}) => {
  const theme = useTheme();
  const { navigateToNextMonth, navigateToPreviousMonth } = useCalendar(); // Utiliser les fonctions de navigation
  
  // Fonction pour calculer la couleur dynamiquement basée sur les assignés
  const getEventColor = (event: CalendarEvent) => {
    if (!event.assignees || event.assignees.length === 0) {
      return theme.colors.primary; // Couleur par défaut si aucun assigné
    }
    
    if (event.assignees.length === 1) {
      // Un seul assigné : utiliser sa couleur
      // Chercher d'abord par userId, puis par id en fallback
      const member = familyMembers?.find(m => m.userId === event.assignees[0]) || 
                     familyMembers?.find(m => m.id === event.assignees[0]);
      return member?.color || theme.colors.primary;
    }
    
    // Plusieurs assignés : utiliser une couleur neutre (gris-bleu)
    return '#6B7280'; // Gris-bleu pour différencier les événements multi-assignés
  };
  const [calendarDays, setCalendarDays] = useState<any[]>([]); // Renommé en calendarDays et type any[] pour correspondre à la structure
  const { width } = Dimensions.get('window');
  const cellWidth = (width - 40) / 7; // 40 pour les marges

  // Obtenir le premier jour du mois
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Obtenir le jour de la semaine du premier jour (0 = dimanche)
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // Calculer les jours à afficher
  const daysInMonth = lastDayOfMonth.getDate();
  const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
  
  // Jours du mois précédent
  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
  const tempDays = []; // Utiliser un tableau temporaire
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonth.getDate() - i;
    tempDays.push({
      date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day),
      isCurrentMonth: false,
      day: day
    });
  }
  
  // Jours du mois actuel
  for (let day = 1; day <= daysInMonth; day++) {
    tempDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      isCurrentMonth: true,
      day: day
    });
  }
  
  // Jours du mois suivant
  const remainingCells = totalCells - tempDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
    tempDays.push({
      date: nextMonth,
      isCurrentMonth: false,
      day: day
    });
  }
  // Mettre à jour l'état une fois que tous les jours sont calculés
  React.useEffect(() => {
    setCalendarDays(tempDays);
  }, [currentDate]); // Recalculer si currentDate change

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
    weekHeader: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    weekDay: {
      width: cellWidth,
      alignItems: 'center',
      paddingVertical: 8,
    },
    weekDayText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: cellWidth,
      minHeight: 80,
      borderWidth: 0.5,
      borderColor: theme.colors.border,
      padding: 4,
    },
    dayButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: 14,
      marginBottom: 4,
    },
    dayText: {
      fontSize: 14,
      fontWeight: '500',
    },
    currentMonthDay: {
      color: theme.colors.text,
    },
    otherMonthDay: {
      color: theme.colors.textSecondary,
    },
    todayButton: {
      backgroundColor: theme.colors.primary,
    },
    todayText: {
      color: theme.colors.background,
      fontWeight: '700',
    },
    selectedButton: {
      backgroundColor: theme.colors.primaryLight,
    },
    selectedText: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    eventsContainer: {
      flex: 1,
    },
    eventDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginHorizontal: 1,
      marginVertical: 1,
    },
    eventDotsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      maxWidth: cellWidth - 8,
    },
  });

  const onSwipe = (event: any) => {
    if (event.nativeEvent.translationX < -50) { // Swipe vers la gauche
      navigateToNextMonth();
    }
    if (event.nativeEvent.translationX > 50) { // Swipe vers la droite
      navigateToPreviousMonth();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onEnded={onSwipe}>
        <View style={styles.container}>
          {/* En-tête des jours de la semaine */}
          <View style={styles.weekHeader}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekDay}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Grille du calendrier */}
          <View style={styles.grid}>
            {calendarDays.map((dayInfo, index) => {
              const dayEvents = getEventsForDate(dayInfo.date);
              const isTodayDate = isToday(dayInfo.date);
              const isSelectedDate = isSelected(dayInfo.date);

              return (
                <View key={index} style={styles.dayCell}>
                  <TouchableOpacity
                    style={[
                      styles.dayButton,
                      isTodayDate && styles.todayButton,
                      isSelectedDate && styles.selectedButton,
                    ]}
                    onPress={() => onDateSelect(dayInfo.date)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        dayInfo.isCurrentMonth ? styles.currentMonthDay : styles.otherMonthDay,
                        isTodayDate && styles.todayText,
                        isSelectedDate && styles.selectedText,
                      ]}
                    >
                      {dayInfo.day}
                    </Text>
                  </TouchableOpacity>

                  {/* Indicateurs d'événements */}
                  <View style={styles.eventsContainer}>
                    {dayEvents.length > 0 && (
                      <View style={styles.eventDotsRow}>
                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                          <View
                            key={eventIndex}
                            style={[
                              styles.eventDot,
                              { backgroundColor: getEventColor(event) }
                            ]}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <Text style={{ fontSize: 8, color: theme.colors.textSecondary }}>+{dayEvents.length - 3}</Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export default CalendarGrid;