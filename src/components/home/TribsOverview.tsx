// src/components/home/TribsOverview.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Child {
  name: string;
  age: number;
  emoji: string;
  tribs: number;
  maxTribs: number;
  streak: number;
  status: string;
  nextReward: string;
  color: string[];
}

interface FamilyGoal {
  current: number;
  target: number;
  reward: string;
  remaining: number;
}

interface TribsOverviewProps {
  children: Child[];
  familyGoal: FamilyGoal;
}

export default function TribsOverview({ children, familyGoal }: TribsOverviewProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏆 Tableau des Tribs</Text>
      <View style={styles.pointsOverview}>
        {/* Cartes des enfants */}
        {children.map((child, index) => (
          <View key={index} style={styles.childCard}>
            <View style={styles.childHeader}>
              <LinearGradient
                colors={child.color}
                style={styles.childAvatar}
              >
                <Text style={styles.childInitial}>{child.name[0]}</Text>
              </LinearGradient>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name} ({child.age} ans)</Text>
                <Text style={styles.childStatus}>{child.status}</Text>
              </View>
              <LinearGradient
                colors={child.color}
                style={styles.pointsBadge}
              >
                <Text style={styles.pointsText}>{child.tribs} Tribs</Text>
              </LinearGradient>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={child.color}
                style={[styles.progressFill, { width: `${(child.tribs / child.maxTribs) * 100}%` }]}
              />
            </View>
            <Text style={styles.nextReward}>{child.nextReward}</Text>
          </View>
        ))}

        {/* Objectif Famille */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.familyGoal}
        >
          <View style={styles.familyGoalHeader}>
            <Text style={styles.goalTitle}>🎯 Objectif Famille</Text>
            <Text style={styles.goalTotal}>{familyGoal.current}/{familyGoal.target} Tribs</Text>
          </View>
          <View style={styles.familyProgressBar}>
            <LinearGradient
              colors={['#48bb78', '#38a169']}
              style={[styles.familyProgressFill, { 
                width: `${(familyGoal.current / familyGoal.target) * 100}%` 
              }]}
            />
          </View>
          <Text style={styles.familyReward}>
            {familyGoal.reward} dans {familyGoal.remaining} Tribs !
          </Text>
          <View style={styles.familyContributions}>
            <Text style={styles.contrib}>Clémentine: 57%</Text>
            <Text style={styles.contrib}>Jacob: 43%</Text>
          </View>
        </LinearGradient>

        {/* Actions Tribs - Version compacte */}
        <View style={styles.tribsActions}>
          <TouchableOpacity style={styles.compactBtn}>
            <Text style={styles.compactBtnIcon}>⭐</Text>
            <Text style={styles.compactBtnText}>Bonus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactBtn}>
            <Text style={styles.compactBtnIcon}>📊</Text>
            <Text style={styles.compactBtnText}>Stats</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  
  pointsOverview: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  childCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  childAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  childInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  
  childInfo: {
    flex: 1,
  },
  
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  
  childStatus: {
    fontSize: 12,
    color: '#4a5568',
  },
  
  pointsBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  
  progressBar: {
    backgroundColor: '#e2e8f0',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  nextReward: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  
  familyGoal: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 15,
  },
  
  familyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  
  goalTotal: {
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: 'white',
  },
  
  familyProgressBar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  
  familyProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  familyReward: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.95,
    textAlign: 'center',
    color: 'white',
  },
  
  familyContributions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  
  contrib: {
    fontSize: 11,
    opacity: 0.8,
    color: 'white',
  },
  
  tribsActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  compactBtnIcon: {
    fontSize: 14,
  },
  
  compactBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
  },
});