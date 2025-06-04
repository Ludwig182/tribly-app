import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent } from '../../types/calendar';
import EventCard from './EventCard';

type WeekViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onDateSelect: (date: Date) => void;
  onEventCreate: () => void;
};

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  onEventSelect,
  onDateSelect,
  onEventCreate
}) => {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const dayWidth = (width - 60) / 7; // 60 pour la colonne des heures

  // Obtenir les 7 jours de la semaine
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // Dimanche = 0
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      const eventHour = eventDate.getHours();
      return (
        eventDate.toDateString() === date.toDateString() &&
        eventHour === hour
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDayHeader = (date: Date) => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return {
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate()
    };
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    timeColumn: {
      width: 60,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
    dayHeader: {
      width: dayWidth,
      alignItems: 'center',
      paddingVertical: 10,
      borderLeftWidth: 0.5,
      borderLeftColor: theme.colors.border,
    },
    dayHeaderToday: {
      backgroundColor: theme.colors.primaryLight,
    },
    dayName: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    dayNumber: {
      fontSize: 18,
      color: theme.colors.text,
      fontWeight: '600',
      marginTop: 2,
    },
    dayNumberToday: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    scrollContainer: {
      flex: 1,
    },
    timelineContainer: {
      flexDirection: 'row',
    },
    timelineColumn: {
      width: 60,
    },
    hourRow: {
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.border,
    },
    hourText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    daysContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    dayColumn: {
      width: dayWidth,
      borderLeftWidth: 0.5,
      borderLeftColor: theme.colors.border,
    },
    hourCell: {
      height: 60,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.border,
      padding: 2,
    },
    hourCellToday: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
    eventContainer: {
      position: 'absolute',
      left: 2,
      right: 2,
      borderRadius: 4,
      padding: 4,
      minHeight: 20,
    },
    eventText: {
      fontSize: 10,
      fontWeight: '500',
      color: theme.colors.background,
    },
    currentTimeIndicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: theme.colors.error,
      zIndex: 10,
    },
  });

  // Calculer la position de l'indicateur de temps actuel
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * 60 + minutes) * (60 / 60); // 60px par heure
  };

  const showCurrentTimeIndicator = weekDays.some(day => isToday(day));

  return (
    <View style={styles.container}>
      {/* En-tête avec les jours */}
      <View style={styles.header}>
        <View style={styles.timeColumn} />
        {weekDays.map((day, index) => {
          const { dayName, dayNumber } = formatDayHeader(day);
          const isTodayDate = isToday(day);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayHeader,
                isTodayDate && styles.dayHeaderToday
              ]}
              onPress={() => onDateSelect(day)}
            >
              <Text style={styles.dayName}>{dayName}</Text>
              <Text style={[
                styles.dayNumber,
                isTodayDate && styles.dayNumberToday
              ]}>
                {dayNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Timeline avec heures et événements */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.timelineContainer}>
          {/* Colonne des heures */}
          <View style={styles.timelineColumn}>
            {hours.map((hour) => (
              <View key={hour} style={styles.hourRow}>
                <Text style={styles.hourText}>{formatHour(hour)}</Text>
              </View>
            ))}
          </View>

          {/* Colonnes des jours */}
          <View style={styles.daysContainer}>
            {weekDays.map((day, dayIndex) => {
              const isTodayDate = isToday(day);
              
              return (
                <View key={dayIndex} style={styles.dayColumn}>
                  {hours.map((hour) => {
                    const hourEvents = getEventsForDateAndHour(day, hour);
                    
                    return (
                      <View
                        key={hour}
                        style={[
                          styles.hourCell,
                          isTodayDate && styles.hourCellToday
                        ]}
                      >
                        {hourEvents.map((event, eventIndex) => (
                          <TouchableOpacity
                            key={eventIndex}
                            style={[
                              styles.eventContainer,
                              {
                                backgroundColor: event.color || theme.colors.primary,
                                top: eventIndex * 22, // Décalage pour les événements multiples
                              }
                            ]}
                            onPress={() => onEventSelect(event)}
                          >
                            <Text style={styles.eventText} numberOfLines={1}>
                              {event.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  })}
                  
                  {/* Indicateur de temps actuel */}
                  {isTodayDate && showCurrentTimeIndicator && (
                    <View
                      style={[
                        styles.currentTimeIndicator,
                        { top: getCurrentTimePosition() }
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default WeekView;