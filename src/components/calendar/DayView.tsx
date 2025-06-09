import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent } from '../../types/calendar';
import EventCard from './EventCard';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useCalendar } from '../../hooks/useCalendar'; // Importer useCalendar

type DayViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (dateWithTime?: Date) => void;
  familyMembers: FamilyMember[];
  filters: CalendarFilters;
};

const DayView: React.FC<DayViewProps> = ({
  currentDate, // currentDate est toujours la date sélectionnée pour DayView
  events,
  onEventSelect,
  onEventCreate
}) => {
  const theme = useTheme();
  const { navigateToNextDay, navigateToPreviousDay } = useCalendar(); // Utiliser les fonctions de navigation
  const { width } = Dimensions.get('window');
  const eventColumnWidth = width - 80; // 80 pour la colonne des heures

  const hours = Array.from({ length: 25 }, (_, i) => i); // Étendre jusqu'à 00h30 (24h + 0.5h)

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      const eventStartHour = eventDate.getHours();
      
      // Retourner seulement les événements qui commencent à cette heure
      return (
        eventDate.toDateString() === currentDate.toDateString() &&
        eventStartHour === hour
      );
    });
  };

  // Calculer la hauteur d'un événement basé sur sa durée
  const getEventHeight = (event: CalendarEvent) => {
    if (!event.endDate) return 120; // Hauteur minimale augmentée pour la lisibilité
    
    const startTime = new Date(event.startDate);
    const endTime = new Date(event.endDate);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return Math.max(120, durationHours * 80); // Hauteur minimale de 120px pour une meilleure lisibilité
  };

  // Calculer la position verticale d'un événement
  const getEventTopPosition = (event: CalendarEvent) => {
    const startTime = new Date(event.startDate);
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    
    return startHour * 80 + (startMinutes / 60) * 80;
  };

  // Obtenir tous les événements du jour pour le rendu en position absolue
  const getDayEvents = () => {
    return events.filter(event => {
      if (event.isAllDay) return false;
      
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = event.endDate ? new Date(event.endDate) : null;
      const currentDateStr = currentDate.toDateString();
      
      // Événements qui commencent ce jour
      const startsToday = eventStartDate.toDateString() === currentDateStr;
      
      // Événements qui se terminent ce jour (commencés la veille)
      const endsToday = eventEndDate && eventEndDate.toDateString() === currentDateStr;
      
      // Événements qui traversent ce jour (commencés avant, se terminent après)
      const crossesToday = eventEndDate && 
        eventStartDate.toDateString() !== currentDateStr &&
        eventEndDate.toDateString() !== currentDateStr &&
        eventStartDate < currentDate &&
        eventEndDate > currentDate;
      
      return startsToday || endsToday || crossesToday;
    });
  };

  // Obtenir les événements qui continuent sur le jour suivant
  const getEventsExtendingToNextDay = () => {
    return events.filter(event => {
      if (event.isAllDay || !event.endDate) return false;
      
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);
      const currentDateStr = currentDate.toDateString();
      
      // L'événement commence aujourd'hui mais se termine après minuit
      return eventStartDate.toDateString() === currentDateStr && 
             eventEndDate.toDateString() !== currentDateStr &&
             eventEndDate > currentDate;
    });
  };

  // Vérifier si un événement est une continuation d'un jour précédent
  const isEventContinuation = (event: CalendarEvent) => {
    if (!event.endDate) return false;
    
    const eventStartDate = new Date(event.startDate);
    const currentDateStr = currentDate.toDateString();
    
    return eventStartDate.toDateString() !== currentDateStr;
  };

  // Calculer la hauteur ajustée pour les événements qui dépassent minuit
  const getAdjustedEventHeight = (event: CalendarEvent) => {
    if (!event.endDate) return getEventHeight(event);
    
    const eventStartDate = new Date(event.startDate);
    const eventEndDate = new Date(event.endDate);
    const currentDateStr = currentDate.toDateString();
    
    // Si l'événement commence aujourd'hui mais se termine après minuit
    if (eventStartDate.toDateString() === currentDateStr && 
        eventEndDate.toDateString() !== currentDateStr) {
      // Calculer jusqu'à minuit (23:59:59)
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const durationMs = endOfDay.getTime() - eventStartDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      return Math.max(120, durationHours * 80);
    }
    
    // Si l'événement est une continuation d'un jour précédent
    if (isEventContinuation(event)) {
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Si l'événement se termine aujourd'hui
      if (eventEndDate.toDateString() === currentDateStr) {
        const durationMs = eventEndDate.getTime() - startOfDay.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        return Math.max(120, durationHours * 80);
      } else {
        // L'événement traverse toute la journée
        return 24 * 80; // 24 heures
      }
    }
    
    return getEventHeight(event);
  };

  // Calculer la position ajustée pour les événements qui continuent d'un jour précédent
  const getAdjustedEventTopPosition = (event: CalendarEvent) => {
    if (isEventContinuation(event)) {
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

  // Calculer les groupes d'événements qui se chevauchent
  const getEventGroups = () => {
    const dayEvents = getDayEvents();
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
      return { width: '100%', left: 8, right: 8 };
    }

    const eventIndex = group.findIndex(e => (e.id || e.startDate) === (event.id || event.startDate));
    const totalEvents = group.length;
    const eventWidth = 100 / totalEvents; // Pourcentage de largeur
    const leftOffset = eventIndex * eventWidth; // Pourcentage de décalage

    return {
      width: `${eventWidth - 1}%`, // -1% pour un petit espacement
      left: `${leftOffset + 0.5}%`, // +0.5% pour centrer l'espacement
      right: undefined
    };
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
    if (hour >= 24) return ''; // Ne pas afficher l'heure 24
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

  // Fonction de gestion du swipe
  const onSwipe = (event: any) => {
    const { translationX } = event.nativeEvent;
    if (translationX > 50) {
      // Swipe vers la droite - jour précédent
      navigateToPreviousDay();
    } else if (translationX < -50) {
      // Swipe vers la gauche - jour suivant
      navigateToNextDay();
    }
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
    absoluteEventContainer: {
      position: 'absolute',
      borderRadius: 8,
      padding: 8,
      justifyContent: 'flex-start',
      zIndex: 5,
      shadowColor: theme.colors.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
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
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onEnded={onSwipe}>
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
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
                {/* Grille des heures pour les clics */}
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
                      {hourEvents.length === 0 && (
                        <TouchableOpacity
                          style={styles.emptyHourCell}
                          onPress={() => {
                            const selectedDateTime = new Date(currentDate);
                            selectedDateTime.setHours(hour, 0, 0, 0);
                            console.log('🕐 DayView - Heure cliquée:', hour, 'Date créée:', selectedDateTime.toISOString());
                            onEventCreate(selectedDateTime);
                          }}
                        >
                          <View style={styles.addEventButton}>
                            <Text style={styles.addEventText}>+ Ajouter</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
                
                {/* Événements en position absolue avec gestion des collisions */}
                {getEventGroups().map((group, groupIndex) => 
                  group.map((event, eventIndex) => {
                    const startTime = new Date(event.startDate);
                    const endTime = event.endDate ? new Date(event.endDate) : null;
                    const eventHeight = getAdjustedEventHeight(event);
                    const topPosition = getAdjustedEventTopPosition(event);
                    const layout = getEventLayout(event, group);
                    const isContinuation = isEventContinuation(event);
                    const currentDateStr = currentDate.toDateString();
                    
                    // Vérifier si l'événement se poursuit après minuit
                    const extendsToNextDay = event.endDate && 
                      new Date(event.startDate).toDateString() === currentDate.toDateString() &&
                      new Date(event.endDate).toDateString() !== currentDate.toDateString();
                    
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
                      displayStartTime = new Date(currentDate);
                      displayStartTime.setHours(0, 0, 0, 0);
                      
                      // Si l'événement se termine aujourd'hui, garder l'heure de fin
                      if (endTime && endTime.toDateString() === currentDateStr) {
                        displayEndTime = endTime;
                      } else {
                        // Si l'événement continue après aujourd'hui, afficher jusqu'à 23:59
                        displayEndTime = new Date(currentDate);
                        displayEndTime.setHours(23, 59, 59, 999);
                      }
                    } else if (startTime.toDateString() === currentDateStr && 
                               endTime && endTime.toDateString() !== currentDateStr) {
                      // Événement qui commence aujourd'hui mais se termine après minuit
                      displayEndTime = new Date(currentDate);
                      displayEndTime.setHours(23, 59, 59, 999);
                    }
                    
                    return (
                      <TouchableOpacity
                        key={`event-${event.id || `${groupIndex}-${eventIndex}`}`}
                        style={[
                          styles.absoluteEventContainer,
                          {
                            backgroundColor: event.color || theme.colors.primary,
                            height: eventHeight,
                            top: topPosition,
                            width: layout.width,
                            left: layout.left,
                            right: layout.right,
                            opacity: extendsToNextDay ? 0.7 : 1,
                          }
                        ]}
                        onPress={() => onEventSelect(event)}
                      >
                        <Text style={styles.eventTitle} numberOfLines={1}>
                          {displayTitle}
                        </Text>
                        <Text style={styles.eventTime}>
                          {displayStartTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {displayEndTime && ` - ${displayEndTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                        </Text>
                        {event.description && eventHeight > 120 && (
                          <Text style={styles.eventDescription} numberOfLines={Math.floor((eventHeight - 60) / 16)}>
                            {event.description}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
                
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
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

export default DayView;