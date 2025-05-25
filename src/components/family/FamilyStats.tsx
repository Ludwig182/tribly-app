// src/components/family/FamilyStats.tsx - Version belle avec style
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FamilyStatsProps {
  stats: {
    totalTribs: number;
    membersOnline: number;
    totalMembers: number;
  };
}

export default function FamilyStats({ stats }: FamilyStatsProps) {
  return (
    <View style={styles.statsContainer}>
      {/* Tribs total */}
      <View style={styles.statCardContainer}>
        <LinearGradient
          colors={['#FFD54F', '#FF8A80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statNumber}>{stats.totalTribs}</Text>
          <Text style={styles.statLabel}>Tribs total</Text>
        </LinearGradient>
      </View>

      {/* Membres */}
      <View style={styles.statCardContainer}>
        <LinearGradient
          colors={['#81C784', '#66BB6A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statNumber}>{stats.totalMembers}</Text>
          <Text style={styles.statLabel}>Membres</Text>
        </LinearGradient>
      </View>

      {/* En ligne */}
      <View style={styles.statCardContainer}>
        <LinearGradient
          colors={['#7986CB', '#5C6BC0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statIcon}>🟢</Text>
          <Text style={styles.statNumber}>{stats.membersOnline}</Text>
          <Text style={styles.statLabel}>En ligne</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  statCardContainer: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});