// src/components/family/FamilyStats.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FamilyStatsProps {
  totalTribs: number;
  totalMembers: number;
  onlineMembers: number;
}

export default function FamilyStats({ totalTribs, totalMembers, onlineMembers }: FamilyStatsProps) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalTribs}</Text>
        <Text style={styles.statLabel}>Tribs total</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalMembers}</Text>
        <Text style={styles.statLabel}>Membres</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{onlineMembers}</Text>
        <Text style={styles.statLabel}>En ligne</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7986CB',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
});