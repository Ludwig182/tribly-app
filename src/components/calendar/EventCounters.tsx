import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent } from '../../types/calendar';

type EventCountersProps = {
  events: CalendarEvent[];
  currentDate: Date;
};

const EventCounters: React.FC<EventCountersProps> = ({ events, currentDate }) => {
  const theme = useTheme();

  // Filtrer les événements passés
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    eventDate.setHours(0, 0, 0, 0); // Normaliser à minuit pour la comparaison
    return eventDate >= today;
  });
  
  // Calculer les compteurs (uniquement pour les événements futurs)
  const totalEvents = futureEvents.length;
  
  const todayEvents = futureEvents.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate.toDateString() === currentDate.toDateString();
  }).length;
  
  const completedEvents = futureEvents.filter(event => 
    event.status === 'completed'
  ).length;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      paddingHorizontal: 0,
      backgroundColor: '#F8F9FA',
      borderRadius: 16,
      marginHorizontal: 20,
      marginVertical: 12,
      elevation: 3,
    },
    counterItem: {
      alignItems: 'center',
      flex: 1,
    },
    counterNumber: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 4,
    },
    counterLabel: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },
    totalNumber: {
      color: theme.colors.counterTotal,
    },
    todayNumber: {
      color: theme.colors.counterToday,
    },
    completedNumber: {
      color: theme.colors.counterCompleted,
    },
    totalLabel: {
      color: theme.colors.counterTotal,
    },
    todayLabel: {
      color: theme.colors.counterToday,
    },
    completedLabel: {
      color: theme.colors.counterCompleted,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.counterItem}>
        <Text style={[styles.counterNumber, styles.totalNumber]}>
          {totalEvents}
        </Text>
        <Text style={[styles.counterLabel, styles.totalLabel]}>
          Total
        </Text>
      </View>
      
      <View style={styles.counterItem}>
        <Text style={[styles.counterNumber, styles.todayNumber]}>
          {todayEvents}
        </Text>
        <Text style={[styles.counterLabel, styles.todayLabel]}>
          Aujourd'hui
        </Text>
      </View>
      
      <View style={styles.counterItem}>
        <Text style={[styles.counterNumber, styles.completedNumber]}>
          {completedEvents}
        </Text>
        <Text style={[styles.counterLabel, styles.completedLabel]}>
          Terminés
        </Text>
      </View>
    </View>
  );
};

export default EventCounters;