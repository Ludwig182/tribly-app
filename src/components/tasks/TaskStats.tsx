// src/components/tasks/TaskStats.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TaskStatsProps {
  urgentCount: number;
  pendingCount: number;
  completedCount: number;
  totalTribsEarned: number;
}

export default function TaskStats({ 
  urgentCount, 
  pendingCount, 
  completedCount, 
  totalTribsEarned 
}: TaskStatsProps) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={[styles.statNumber, { color: '#f56565' }]}>{urgentCount}</Text>
        <Text style={styles.statLabel}>Urgent</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{pendingCount}</Text>
        <Text style={styles.statLabel}>À faire</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{completedCount}</Text>
        <Text style={styles.statLabel}>Terminées</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalTribsEarned}</Text>
        <Text style={styles.statLabel}>Tribs gagnés</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 25,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#48bb78',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: '500',
    textAlign: 'center',
  },
});