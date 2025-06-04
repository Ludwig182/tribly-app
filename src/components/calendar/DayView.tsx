import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent } from '../../types/calendar';
import EventCard from './EventCard';

type DayViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: () => void;
};

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  onEventSelect,
  onEventCreate
}) => {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const eventColumnWidth = width - 80; // 80 pour la colonne des heures

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      const eventHour = eventDate.getHours();
      return (
        eventDate.toDateString() === currentDate.toDateString() &&
        eventHour === hour
      );
    });
  };

  const getAllDayEvents = () => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.toDateString() === currentDate.toDateString() &&
        event.isAllDay
      );
    });
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * 80 + (minutes * 80) / 60); // 80px par heure
  };

  const getCurrentHourMinute = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    dateText: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    todayIndicator: {
      color: theme.colors.primary,
    },
    allDaySection: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    allDayTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    allDayEvent: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    allDayEventText: {
      color: theme.colors.background,
      fontWeight: '600',
      fontSize: 14,
    },
    scrollContainer: {
      flex: 1,
    },
    timelineContainer: {
      flexDirection: 'row',
      position: 'relative',
    },
    timeColumn: {
      width: 80,
      backgroundColor: theme.colors.surface,
    },
    hourRow: {
      height: 80,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.border,
    },
    hourText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    eventsColumn: {
      flex: 1,
      position: 'relative',
    },
    hourCell: {
      height: 80,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.border,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border,
      padding: 8,
      position: 'relative',
    },
    currentHourCell: {
      backgroundColor: theme.colors.primaryLight + '20',
    },
    eventContainer: {
      borderRadius: 8,
      padding: 8,
      marginBottom: 4,
      minHeight: 32,
      justifyContent: 'center',
    },
    eventTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.background,
      marginBottom: 2,
    },
    eventTime: {
      fontSize: 12,
      color: theme.colors.background,
      opacity: 0.9,
    },
    eventDescription: {
      fontSize: 12,
      color: theme.colors.background,
      opacity: 0.8,
      marginTop: 2,
    },
    currentTimeIndicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: theme.colors.error,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    currentTimeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.error,
      marginLeft: -4,
    },
    currentTimeText: {
      fontSize: 12,
      color: theme.colors.error,
      fontWeight: '600',
      marginLeft: 8,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    emptyHourCell: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    addEventButton: {
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    addEventText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  const allDayEvents = getAllDayEvents();
  const isTodayDate = isToday();
  const currentHour = new Date().getHours();

  return (
    <View style={styles.container}>
      {/* En-tête avec la date */}
      <View style={styles.header}>
        <Text style={[
          styles.dateText,
          isTodayDate && styles.todayIndicator
        ]}>
          {formatDate(currentDate)}
        </Text>
      </View>

      {/* Section des événements toute la journée */}
      {allDayEvents.length > 0 && (
        <View style={styles.allDaySection}>
          <Text style={styles.allDayTitle}>Toute la journée</Text>
          {allDayEvents.map((event, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.allDayEvent,
                { backgroundColor: event.color || theme.colors.primary }
              ]}
              onPress={() => onEventSelect(event)}
            >
              <Text style={styles.allDayEventText}>{event.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Timeline avec heures et événements */}
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentOffset={{ x: 0, y: isTodayDate ? currentHour * 80 - 200 : 0 }}
      >
        <View style={styles.timelineContainer}>
          {/* Colonne des heures */}
          <View style={styles.timeColumn}>
            {hours.map((hour) => (
              <View key={hour} style={styles.hourRow}>
                <Text style={styles.hourText}>{formatHour(hour)}</Text>
              </View>
            ))}
          </View>

          {/* Colonne des événements */}
          <View style={styles.eventsColumn}>
            {hours.map((hour) => {
              const hourEvents = getEventsForHour(hour);
              const isCurrentHour = isTodayDate && hour === currentHour;
              
              return (
                <View
                  key={hour}
                  style={[
                    styles.hourCell,
                    isCurrentHour && styles.currentHourCell
                  ]}
                >
                  {hourEvents.length > 0 ? (
                    hourEvents.map((event, eventIndex) => {
                      const startTime = new Date(event.startDate);
                      const endTime = event.endDate ? new Date(event.endDate) : null;
                      
                      return (
                        <TouchableOpacity
                          key={eventIndex}
                          style={[
                            styles.eventContainer,
                            { backgroundColor: event.color || theme.colors.primary }
                          ]}
                          onPress={() => onEventSelect(event)}
                        >
                          <Text style={styles.eventTitle} numberOfLines={1}>
                            {event.title}
                          </Text>
                          <Text style={styles.eventTime}>
                            {startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {endTime && ` - ${endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                          </Text>
                          {event.description && (
                            <Text style={styles.eventDescription} numberOfLines={2}>
                              {event.description}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <TouchableOpacity
                      style={styles.emptyHourCell}
                      onPress={onEventCreate}
                    >
                      <View style={styles.addEventButton}>
                        <Text style={styles.addEventText}>+ Ajouter un événement</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
            
            {/* Indicateur de temps actuel */}
            {isTodayDate && (
              <View
                style={[
                  styles.currentTimeIndicator,
                  { top: getCurrentTimePosition() }
                ]}
              >
                <View style={styles.currentTimeDot} />
                <Text style={styles.currentTimeText}>
                  {getCurrentHourMinute()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DayView;