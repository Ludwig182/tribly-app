import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent } from '../../types/calendar';
import EventCard from './EventCard';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useCalendar } from '../../hooks/useCalendar';

type WeekViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onDateSelect: (date: Date) => void;
  onEventCreate: (dateWithTime?: Date) => void;
};

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  onEventSelect,
  onDateSelect,
  onEventCreate
}) => {
  const theme = useTheme();
  const { navigateToNextWeek, navigateToPreviousWeek } = useCalendar();
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
  const hours = Array.from({ length: 25 }, (_, i) => i); // Étendre jusqu'à 00h30 (24h + 0.5h)

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      const eventStartHour = eventDate.getHours();
      
      // Retourner seulement les événements qui commencent à cette heure
      return (
        eventDate.toDateString() === date.toDateString() &&
        eventStartHour === hour
      );
    });
  };

  // Calculer la hauteur d'un événement basé sur sa durée
  const getEventHeight = (event: CalendarEvent) => {
    if (!event.endDate) return 80; // Hauteur minimale augmentée pour la lisibilité
    
    const startTime = new Date(event.startDate);
    const endTime = new Date(event.endDate);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return Math.max(80, durationHours * 60); // Hauteur minimale de 80px pour une meilleure lisibilité
  };

  // Calculer la position verticale d'un événement
  const getEventTopPosition = (event: CalendarEvent) => {
    const startTime = new Date(event.startDate);
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    
    return startHour * 60 + (startMinutes / 60) * 60;
  };

  // Obtenir tous les événements d'un jour pour le rendu en position absolue
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      if (event.isAllDay) return false;
      
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = event.endDate ? new Date(event.endDate) : null;
      const currentDateStr = date.toDateString();
      
      // Événements qui commencent ce jour
      const startsToday = eventStartDate.toDateString() === currentDateStr;
      
      // Événements qui se terminent ce jour (commencés la veille)
      const endsToday = eventEndDate && eventEndDate.toDateString() === currentDateStr;
      
      // Événements qui traversent ce jour (commencés avant, se terminent après)
      const crossesToday = eventEndDate && 
        eventStartDate.toDateString() !== currentDateStr &&
        eventEndDate.toDateString() !== currentDateStr &&
        eventStartDate < date &&
        eventEndDate > date;
      
      return startsToday || endsToday || crossesToday;
    });
  };

  // Vérifier si un événement est une continuation d'un jour précédent
  const isEventContinuation = (event: CalendarEvent, date: Date) => {
    if (!event.endDate) return false;
    
    const eventStartDate = new Date(event.startDate);
    const currentDateStr = date.toDateString();
    
    return eventStartDate.toDateString() !== currentDateStr;
  };

  // Calculer la hauteur ajustée pour les événements qui dépassent minuit
  const getAdjustedEventHeight = (event: CalendarEvent, date: Date) => {
    if (!event.endDate) return getEventHeight(event);
    
    const eventStartDate = new Date(event.startDate);
    const eventEndDate = new Date(event.endDate);
    const currentDateStr = date.toDateString();
    
    // Si l'événement commence aujourd'hui mais se termine après minuit
    if (eventStartDate.toDateString() === currentDateStr && 
        eventEndDate.toDateString() !== currentDateStr) {
      // Calculer jusqu'à minuit (23:59:59)
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const durationMs = endOfDay.getTime() - eventStartDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      return Math.max(80, durationHours * 60);
    }
    
    // Si l'événement est une continuation d'un jour précédent
    if (isEventContinuation(event, date)) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Si l'événement se termine aujourd'hui
      if (eventEndDate.toDateString() === currentDateStr) {
        const durationMs = eventEndDate.getTime() - startOfDay.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        return Math.max(80, durationHours * 60);
      } else {
        // L'événement traverse toute la journée
        return 24 * 60; // 24 heures
      }
    }
    
    return getEventHeight(event);
  };

  // Calculer la position ajustée pour les événements qui continuent d'un jour précédent
  const getAdjustedEventTopPosition = (event: CalendarEvent, date: Date) => {
    if (isEventContinuation(event, date)) {
      return 0; // Commence en haut de la journée
    }
    
    return getEventTopPosition(event);
  };

  // Détecter si deux événements se chevauchent
  const eventsOverlap = (event1: CalendarEvent, event2: CalendarEvent) => {
    const start1 = new Date(event1.startDate).getTime();
    const end1 = event1.endDate ? new Date(event1.endDate).getTime() : start1 + (60 * 60 * 1000);
    const start2 = new Date(event2.startDate).getTime();
    const end2 = event2.endDate ? new Date(event2.endDate).getTime() : start2 + (60 * 60 * 1000);
    
    return start1 < end2 && start2 < end1;
  };

  // Calculer les groupes d'événements qui se chevauchent pour un jour donné
  const getEventGroupsForDate = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const groups: CalendarEvent[][] = [];
    const processed = new Set<string>();

    dayEvents.forEach(event => {
      const eventKey = event.id || event.startDate;
      if (processed.has(eventKey)) return;

      const group = [event];
      processed.add(eventKey);

      // Trouver tous les événements qui se chevauchent avec celui-ci
      dayEvents.forEach(otherEvent => {
        const otherKey = otherEvent.id || otherEvent.startDate;
        if (processed.has(otherKey) || event === otherEvent) return;

        // Vérifier si cet événement chevauche avec n'importe quel événement du groupe
        const overlapsWithGroup = group.some(groupEvent => eventsOverlap(groupEvent, otherEvent));
        if (overlapsWithGroup) {
          group.push(otherEvent);
          processed.add(otherKey);
        }
      });

      groups.push(group);
    });

    return groups;
  };

  // Calculer la largeur et la position horizontale pour un événement dans un groupe
  const getEventLayout = (event: CalendarEvent, group: CalendarEvent[]) => {
    if (group.length === 1) {
      return { width: '96%', left: '2%', right: undefined };
    }

    const eventIndex = group.findIndex(e => (e.id || e.startDate) === (event.id || event.startDate));
    const totalEvents = group.length;
    const eventWidth = 96 / totalEvents; // Pourcentage de largeur (96% pour laisser de la marge)
    const leftOffset = 2 + (eventIndex * eventWidth); // 2% de marge + décalage

    return {
      width: `${eventWidth - 0.5}%`, // -0.5% pour un petit espacement
      left: `${leftOffset + 0.25}%`, // +0.25% pour centrer l'espacement
      right: undefined
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatHour = (hour: number) => {
    if (hour >= 24) return ''; // Ne pas afficher l'heure 24
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
    absoluteEventContainer: {
      position: 'absolute',
      borderRadius: 4,
      padding: 4,
      justifyContent: 'flex-start',
      zIndex: 5,
      shadowColor: theme.colors.text,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
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

  const onSwipe = (event: any) => {
    if (event.nativeEvent.translationX < -50) { // Swipe vers la gauche
      navigateToNextWeek();
    }
    if (event.nativeEvent.translationX > 50) { // Swipe vers la droite
      navigateToPreviousWeek();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onEnded={onSwipe}>
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
                      {/* Grille des heures pour les clics */}
                      {hours.map((hour) => {
                        const hourEvents = getEventsForDateAndHour(day, hour);
                        
                        return (
                          <TouchableOpacity
                            key={hour}
                            style={[
                              styles.hourCell,
                              isTodayDate && styles.hourCellToday
                            ]}
                            onPress={() => {
                              if (hourEvents.length === 0) {
                                const selectedDateTime = new Date(day);
                                selectedDateTime.setHours(hour, 0, 0, 0);
                                onEventCreate(selectedDateTime);
                              }
                            }}
                          >
                          </TouchableOpacity>
                        );
                      })}
                      
                      {/* Événements en position absolue avec gestion des collisions */}
                      {getEventGroupsForDate(day).map((group, groupIndex) => 
                        group.map((event, eventIndex) => {
                          const eventHeight = getAdjustedEventHeight(event, day);
                          const topPosition = getAdjustedEventTopPosition(event, day);
                          const startTime = new Date(event.startDate);
                          const endTime = event.endDate ? new Date(event.endDate) : null;
                          const layout = getEventLayout(event, group);
                          const isContinuation = isEventContinuation(event, day);
                          const currentDateStr = day.toDateString();
                          
                          // Calculer le titre avec (suite) si nécessaire
                          let displayTitle = event.title;
                          if (isContinuation) {
                            displayTitle = `${event.title} (suite)`;
                          }
                          
                          // Calculer l'heure d'affichage
                          let displayStartTime = startTime;
                          let displayEndTime = endTime;
                          
                          if (isContinuation) {
                            // Pour les continuations, afficher depuis 00:00
                            displayStartTime = new Date(day);
                            displayStartTime.setHours(0, 0, 0, 0);
                            
                            // Si l'événement se termine aujourd'hui, garder l'heure de fin
                            if (endTime && endTime.toDateString() === currentDateStr) {
                              displayEndTime = endTime;
                            } else {
                              // Si l'événement continue après aujourd'hui, afficher jusqu'à 23:59
                              displayEndTime = new Date(day);
                              displayEndTime.setHours(23, 59, 59, 999);
                            }
                          } else if (startTime.toDateString() === currentDateStr && 
                                     endTime && endTime.toDateString() !== currentDateStr) {
                            // Événement qui commence aujourd'hui mais se termine après minuit
                            displayEndTime = new Date(day);
                            displayEndTime.setHours(23, 59, 59, 999);
                          }
                          
                          // Vérifier si l'événement se poursuit après minuit
                          const extendsToNextDay = endTime && 
                            startTime.toDateString() === currentDateStr &&
                            endTime.toDateString() !== currentDateStr;
                          
                          return (
                            <TouchableOpacity
                              key={`event-${event.id || `${dayIndex}-${groupIndex}-${eventIndex}`}`}
                              style={[
                                styles.absoluteEventContainer,
                                {
                                  backgroundColor: event.color || theme.colors.primary,
                                  height: eventHeight,
                                  top: topPosition,
                                  width: layout.width,
                                  left: layout.left,
                                  right: layout.right,
                                  opacity: extendsToNextDay ? 0.7 : 1, // Effet d'estompage
                                }
                              ]}
                              onPress={() => onEventSelect(event)}
                            >
                              <Text style={styles.eventText} numberOfLines={1}>
                                {displayTitle}
                              </Text>
                              {eventHeight > 40 && (
                                <Text style={[styles.eventText, { fontSize: 8, opacity: 0.8 }]}>
                                  {displayStartTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  {displayEndTime && `-${displayEndTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })
                      )}
                      
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
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export default WeekView;