import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent, FamilyMember } from '../../types/calendar';
import EventCard from './EventCard';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useCalendar } from '../../hooks/useCalendar';

type WeekViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onDateSelect: (date: Date) => void;
  onEventCreate: (dateWithTime?: Date) => void;
  familyMembers: FamilyMember[];
  selectedDate?: Date | null;
};

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  onEventSelect,
  onDateSelect,
  onEventCreate,
  familyMembers,
  selectedDate
}) => {
  const theme = useTheme();
  const { navigateToNextWeek, navigateToPreviousWeek } = useCalendar();
  
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
  const { width } = Dimensions.get('window');
  const dayWidth = (width - 60) / 7; // 60 pour la colonne des heures

  // Générer les jours de la semaine
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi = 1
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Fonction pour formater l'en-tête des jours
  const formatDayHeader = (date: Date) => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return {
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate().toString()
    };
  };

  // Fonction pour formater les heures
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Fonction pour vérifier si c'est aujourd'hui
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Fonction pour obtenir les événements d'une date et heure spécifique
  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString() && 
             eventDate.getHours() === hour;
    });
  };

  // Fonction pour obtenir les groupes d'événements pour une date
  const getEventGroupsForDate = (date: Date) => {
    const dayEvents = events.filter(event => {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = event.endDate ? new Date(event.endDate) : null;
      const currentDateStr = date.toDateString();
      
      // Vérifier si l'événement commence ce jour
      if (eventStartDate.toDateString() === currentDateStr) {
        return true;
      }
      
      // Vérifier si l'événement se poursuit ce jour (événement multi-jours)
      if (eventEndDate && 
          eventStartDate.toDateString() !== currentDateStr && 
          eventEndDate.toDateString() !== currentDateStr &&
          eventStartDate < date && eventEndDate > date) {
        return true;
      }
      
      return false;
    });
    
    // Grouper les événements qui se chevauchent
    const groups: CalendarEvent[][] = [];
    
    dayEvents.forEach(event => {
      let addedToGroup = false;
      
      for (let group of groups) {
        const hasOverlap = group.some(groupEvent => {
          const eventStart = new Date(event.startDate);
          const eventEnd = event.endDate ? new Date(event.endDate) : new Date(eventStart.getTime() + 60 * 60 * 1000);
          const groupEventStart = new Date(groupEvent.startDate);
          const groupEventEnd = groupEvent.endDate ? new Date(groupEvent.endDate) : new Date(groupEventStart.getTime() + 60 * 60 * 1000);
          
          return eventStart < groupEventEnd && eventEnd > groupEventStart;
        });
        
        if (hasOverlap) {
          group.push(event);
          addedToGroup = true;
          break;
        }
      }
      
      if (!addedToGroup) {
        groups.push([event]);
      }
    });
    
    return groups;
  };

  // Fonction pour calculer la hauteur d'un événement
  const getAdjustedEventHeight = (event: CalendarEvent, day: Date) => {
    const startTime = new Date(event.startDate);
    const endTime = event.endDate ? new Date(event.endDate) : null;
    const currentDateStr = day.toDateString();
    
    let displayStartTime = startTime;
    let displayEndTime = endTime;
    
    // Si l'événement commence avant ce jour
    if (startTime.toDateString() !== currentDateStr) {
      displayStartTime = new Date(day);
      displayStartTime.setHours(0, 0, 0, 0);
    }
    
    // Si l'événement se termine après ce jour ou n'a pas de fin
    if (!endTime || endTime.toDateString() !== currentDateStr) {
      displayEndTime = new Date(day);
      displayEndTime.setHours(23, 59, 59, 999);
    }
    
    const durationInMinutes = displayEndTime ? 
      (displayEndTime.getTime() - displayStartTime.getTime()) / (1000 * 60) : 60;
    
    return Math.max((durationInMinutes / 60) * 45, 20); // Minimum 20px de hauteur
  };

  // Fonction pour calculer la position top d'un événement
  const getAdjustedEventTopPosition = (event: CalendarEvent, day: Date) => {
    const startTime = new Date(event.startDate);
    const currentDateStr = day.toDateString();
    
    let displayStartTime = startTime;
    
    // Si l'événement commence avant ce jour
    if (startTime.toDateString() !== currentDateStr) {
      displayStartTime = new Date(day);
      displayStartTime.setHours(0, 0, 0, 0);
    }
    
    const hours = displayStartTime.getHours();
    const minutes = displayStartTime.getMinutes();
    return (hours * 60 + minutes) * (45 / 60); // 45px par heure
  };

  // Fonction pour calculer le layout d'un événement dans un groupe
  const getEventLayout = (event: CalendarEvent, group: CalendarEvent[]) => {
    const eventIndex = group.indexOf(event);
    const totalEvents = group.length;
    const eventWidth = dayWidth / totalEvents;
    
    return {
      width: eventWidth - 4, // -4 pour les marges
      left: eventIndex * eventWidth + 2,
      right: 2
    };
  };

  // Fonction pour vérifier si un événement est une continuation
  const isEventContinuation = (event: CalendarEvent, day: Date) => {
    const startTime = new Date(event.startDate);
    const currentDateStr = day.toDateString();
    return startTime.toDateString() !== currentDateStr;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
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
      paddingTop: 0,
      paddingBottom: 10,
    },
    dayHeaderToday: {
      backgroundColor: theme.colors.primaryLight,
    },
    dayName: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: '600',
    },
    dayNumberWrapper: {
      marginTop: 2,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
    },
    dayNumberWrapperUnselected: {
      backgroundColor: '#F5F5F5',
    },
    dayNumberWrapperSelected: {
      backgroundColor: 'transparent',
    },
    dayNumberUnselected: {
      color: theme.colors.text,
      fontWeight: '600',
    },
    dayNumberSelected: {
      color: theme.colors.calendarNavIcon,
      fontWeight: '700',
    },
    agendaContainer: {
      flex: 1,
      marginHorizontal: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      overflow: 'hidden',
    },
    scrollContainer: {
      flex: 1,
    },
    timelineContainer: {
      flexDirection: 'row',
    },
    timelineColumn: {
      width: 44,
    },
    hourRow: {
      height: 45,
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
    },
    hourCell: {
      height: 45,
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
    return (hours * 60 + minutes) * (45 / 60); // 45px par heure
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
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={onSwipe}>
        <View style={styles.container}>
          {/* En-tête avec les jours */}
          <View style={styles.header}>
            <View style={styles.timeColumn} />
            {weekDays.map((day, index) => {
              const { dayName, dayNumber } = formatDayHeader(day);
              const isTodayDate = isToday(day);
              const isSelectedDate =
                selectedDate && day.toDateString() === selectedDate.toDateString();

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
                  <View
                    style={[
                      styles.dayNumberWrapper,
                      isSelectedDate
                        ? styles.dayNumberWrapperSelected
                        : styles.dayNumberWrapperUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        isSelectedDate
                          ? styles.dayNumberSelected
                          : styles.dayNumberUnselected,
                      ]}
                    >
                      {dayNumber}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Timeline avec heures et événements */}
          <View style={styles.agendaContainer}>
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
                            
                            // Calculer les heures d'affichage
                            let displayStartTime = startTime;
                            let displayEndTime = endTime;
                            
                            if (startTime.toDateString() !== currentDateStr) {
                              // Événement qui a commencé avant ce jour
                              displayStartTime = new Date(day);
                              displayStartTime.setHours(0, 0, 0, 0);
                              
                              if (endTime && endTime.toDateString() === currentDateStr) {
                                // Se termine aujourd'hui
                                displayEndTime = endTime;
                              } else {
                                // Se poursuit après aujourd'hui
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
                                    backgroundColor: getEventColor(event),
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
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export default WeekView;