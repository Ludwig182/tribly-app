import React, { useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SectionList, Platform } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent } from '../../types/calendar';
import ModernEventCard from './ModernEventCard';
import EventCounters from './EventCounters';

type AgendaViewProps = {
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (dateWithTime?: Date) => void;
  currentDate: Date;
  onEventDelete: (eventId: string) => void;
  onEventComplete: (eventId: string) => void;
  isParent?: boolean;
};

type EventSection = {
  title: string;
  date: string;
  data: CalendarEvent[];
};

const AgendaView: React.FC<AgendaViewProps> = ({
  events,
  onEventSelect,
  onEventCreate,
  currentDate,
  onEventDelete,
  onEventComplete,
  isParent = false
}) => {
  const theme = useTheme();
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

  // Grouper les événements par date (en excluant les événements passés)
  const groupEventsByDate = (events: CalendarEvent[]): EventSection[] => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Début de la journée actuelle
    
    events.forEach(event => {
      const eventDate = new Date(event.startDate);
      eventDate.setHours(0, 0, 0, 0); // Normaliser à minuit pour la comparaison
      
      // Exclure les événements qui ont commencé avant aujourd'hui
      if (eventDate >= today) {
        const dateKey = eventDate.toDateString();
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      }
    });

    // Convertir en sections et trier par date
    const sections: EventSection[] = Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(dateKey => {
        const date = new Date(dateKey);
        return {
          title: formatSectionTitle(date),
          date: dateKey,
          data: grouped[dateKey].sort((a, b) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
        };
      });

    return sections;
  };

  const formatSectionTitle = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Demain";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      };
      return date.toLocaleDateString('fr-FR', options);
    }
  };

  // Filtrer les événements selon le filtre sélectionné
  const eventSections = groupEventsByDate(events);

  const renderSectionHeader = ({ section }: { section: EventSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );

  const renderRightActions = (event: CalendarEvent) => (
    <TouchableOpacity
      style={[styles.deleteAction, { backgroundColor: theme.colors.error }]}
      onPress={() => {
        onEventDelete(event.id);
        swipeableRefs.current[event.id]?.close();
      }}
    >
      <Text style={styles.deleteActionText}>Supprimer</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = (event: CalendarEvent) => (
    <TouchableOpacity
      style={[styles.completeAction, { backgroundColor: theme.colors.success }]}
      onPress={() => {
        onEventComplete(event.id);
        swipeableRefs.current[event.id]?.close();
      }}
    >
      <Text style={styles.completeActionText}>Terminé</Text>
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }: { item: CalendarEvent }) => (
    <Swipeable
      ref={(ref) => { swipeableRefs.current[item.id] = ref; }}
      renderRightActions={isParent ? () => renderRightActions(item) : undefined}
      renderLeftActions={
        isParent && !item.completed ? () => renderLeftActions(item) : undefined
      }
      onSwipeableOpen={(direction) => {
        if (!isParent) return;
        if (direction === 'right') {
          onEventDelete(item.id);
        } else if (direction === 'left' && !item.completed) {
          onEventComplete(item.id);
          swipeableRefs.current[item.id]?.close();
        }
      }}
    >
      <ModernEventCard
        event={item}
        onEdit={() => onEventSelect(item)}
        onComplete={() => {
          if (isParent && !item.completed) {
            onEventComplete(item.id);
            swipeableRefs.current[item.id]?.close();
          }
        }}
      />
    </Swipeable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Aucun événement</Text>
      <Text style={styles.emptySubtitle}>
        Vous n'avez aucun événement planifié pour cette période
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={() => onEventCreate()}>
        <Text style={styles.addButtonText}>+ Ajouter un événement</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F9FA',
    },
    listContainer: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: 'transparent',
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: 15,
    },
    sectionLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    eventContainer: {
      marginHorizontal: 20,
      marginVertical: 5,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 10,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 22,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
    },
    addButtonText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    deleteAction: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingHorizontal: 20,
    },
    completeAction: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: 20,
    },
    deleteActionText: {
      color: theme.colors.background,
      fontWeight: '600',
    },
    completeActionText: {
      color: theme.colors.background,
      fontWeight: '600',
    },
    floatingAddButton: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 34 + 10 : 28, // Ajustement pour TabBar iOS
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4, // Ombre Android
      shadowColor: '#000', // Ombre iOS
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    floatingAddButtonText: {
      fontSize: 32,
      fontWeight: '300',
      marginTop: -2, // Ajustement visuel
    },

  });



  const renderListHeader = () => (
    <EventCounters 
      events={events}
      currentDate={currentDate}
    />
  );

  return (
    <View style={styles.container}>
      {/* Liste des événements */}
      {eventSections.length > 0 ? (
        <SectionList
          style={styles.listContainer}
          sections={eventSections}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={renderListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.listContainer}>
          {renderListHeader()}
          {renderEmptyState()}
        </View>
      )}
      
      {/* Bouton flottant + quand il y a des événements */}
      {eventSections.length > 0 && (
        <TouchableOpacity
          style={[styles.floatingAddButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onEventCreate()}
        >
          <Text style={[styles.floatingAddButtonText, { color: theme.colors.onPrimary || 'white' }]}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AgendaView;
