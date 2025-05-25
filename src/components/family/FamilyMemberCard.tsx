// src/components/family/FamilyMemberCard.tsx - Version corrigée
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FamilyMemberCardProps {
  member: {
    id: string;
    name: string;
    role: string;
    age?: number;
    tribs: number;
    avatar: string;
    color: string;
    status?: string;
    tasksCompleted?: number;
    tribsEarned?: number;
  };
}

export default function FamilyMemberCard({ member }: FamilyMemberCardProps) {
  const isOnline = member.status === 'online' || true; // Temporaire : tous en ligne

  // Couleurs de gradient basées sur la couleur du membre
  const getGradientColors = (color: string) => {
    const colorMap: { [key: string]: string[] } = {
      '#FF8A80': ['#FFB3BA', '#FF8A80'], // Rose
      '#7986CB': ['#9FA8DA', '#7986CB'], // Violet
      '#FFCC80': ['#FFE0B2', '#FFCC80'], // Orange
      '#81C784': ['#A5D6A7', '#81C784'], // Vert
    };
    return colorMap[color] || ['#E0E0E0', '#BDBDBD']; // Couleur par défaut
  };

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={getGradientColors(member.color)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{member.avatar}</Text>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#757575' }]} />
        </View>

        {/* Informations membre */}
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberRole}>
            {member.role === 'parent' 
              ? (member.name.includes('Rosaly') ? 'Maman' : 'Papa')
              : `${member.role === 'child' ? (member.name.includes('Clémentine') ? 'Fille' : 'Fils') : member.role} (${member.age} ans)`
            }
          </Text>
          <Text style={styles.statusText}>
            {isOnline ? '🟢 En ligne' : '⚫ Hors ligne'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{member.tasksCompleted || Math.floor(Math.random() * 15)}</Text>
            <Text style={styles.statLabel}>Tâches</Text>
          </View>
          
          <View style={styles.tribsBadge}>
            <Text style={styles.tribsText}>{member.tribs} T</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientBackground: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    fontSize: 32,
    width: 60,
    height: 60,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    lineHeight: 60, // Pour centrer verticalement sur iOS
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tribsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tribsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});