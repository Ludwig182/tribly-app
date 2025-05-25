// src/components/home/PrioritiesList.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Priority {
  time: string;
  title: string;
  details: string;
  urgent: boolean;
}

interface PrioritiesListProps {
  priorities: Priority[];
}

export default function PrioritiesList({ priorities }: PrioritiesListProps) {
  if (priorities.length === 0) {
    return null; // Ou un état vide si souhaité
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⭐ Mes priorités aujourd'hui</Text>
      {priorities.map((priority, index) => (
        <View key={index} style={[styles.eventCard, priority.urgent && styles.eventCardUrgent]}>
          <Text style={styles.eventTime}>{priority.time} - {priority.urgent ? 'Dans 2h' : 'Ce soir'}</Text>
          <Text style={styles.eventTitle}>{priority.title}</Text>
          <Text style={styles.eventDetails}>{priority.details}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 25,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 15,
  },
  
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8A80',
  },
  
  eventCardUrgent: {
    borderLeftColor: '#F44336',
  },
  
  eventTime: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  
  eventDetails: {
    fontSize: 14,
    color: '#4a5568',
  },
});