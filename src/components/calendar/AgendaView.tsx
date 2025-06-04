import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SectionList } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent } from '../../types/calendar';
import EventCard from './EventCard';

type AgendaViewProps = {
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: () => void;
};

type EventSection = {
  title: string;
  date: string;
  data: CalendarEvent[];
};

const AgendaView: React.FC<AgendaViewProps> = ({
  events,
  onEventSelect,
  onEventCreate
}) => {
  const theme = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Grouper les événements par date
  const groupEventsByDate = (events: CalendarEvent[]): EventSection[] => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const eventDate = new Date(event.startDate);
      const dateKey = eventDate.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
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
  const getFilteredEvents = (): CalendarEvent[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (selectedFilter) {
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
      
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        return events.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= monthStart && eventDate <= monthEnd;
        });
      
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();
  const eventSections = groupEventsByDate(filteredEvents);

  const filters = [
    { key: 'all', label: 'Tous' },
    { key: 'today', label: "Aujourd'hui" },
    { key: 'week', label: 'Cette semaine' },
    { key: 'month', label: 'Ce mois' },
  ] as const;

  const renderSectionHeader = ({ section }: { section: EventSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );

  const renderEventItem = ({ item }: { item: CalendarEvent }) => (
    <EventCard
      event={item}
      viewMode="detailed"
      onEdit={() => onEventSelect(item)}
      onComplete={() => {/* TODO: Implement complete */}}
      onDelete={() => {/* TODO: Implement delete */}}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Aucun événement</Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter === 'all' 
          ? "Vous n'avez aucun événement planifié"
          : `Aucun événement pour ${filters.find(f => f.key === selectedFilter)?.label.toLowerCase()}`
        }
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={onEventCreate}>
        <Text style={styles.addButtonText}>+ Ajouter un événement</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 10,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    filterTextActive: {
      color: theme.colors.background,
    },
    listContainer: {
      flex: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: theme.colors.backgroundSecondary,
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
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 15,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
  });

  // Calculer les statistiques
  const totalEvents = filteredEvents.length;
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  }).length;
  const completedEvents = filteredEvents.filter(event => event.status === 'completed').length;

  return (
    <View style={styles.container}>
      {/* Filtres */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalEvents}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{todayEvents}</Text>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedEvents}</Text>
          <Text style={styles.statLabel}>Terminés</Text>
        </View>
      </View>

      {/* Liste des événements */}
      {eventSections.length > 0 ? (
        <SectionList
          style={styles.listContainer}
          sections={eventSections}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          renderSectionHeader={renderSectionHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

export default AgendaView;