// src/components/family/FamilyMemberCard.tsx - Version complète avec styles
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FamilyMemberCardProps {
  member: {
    id: string;
    name: string;
    role: string;
    birthDate?: string; // Format ISO date
    tribs: number;
    avatar: string; // Emoji de fallback
    avatarUrl?: string; // URL de la vraie photo
    color: string;
    status?: string;
    tasksCompleted?: number;
    tribsEarned?: number;
  };
  onEditPress?: () => void;
  showEditButton?: boolean;
}

export default function FamilyMemberCard({ 
  member, 
  onEditPress, 
  showEditButton = false 
}: FamilyMemberCardProps) {
  const isOnline = member.status === 'online' || true; // Temporaire : tous en ligne

  // 📅 Calcul de l'âge à partir de birthDate
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  };

  const memberAge = member.birthDate ? calculateAge(member.birthDate) : null;

  // Couleurs de gradient basées sur la couleur du membre
  const getGradientColors = (color: string) => {
    const colorMap: { [key: string]: string[] } = {
      '#FF8A80': ['#FFB3BA', '#FF8A80'], // Rose
      '#7986CB': ['#9FA8DA', '#7986CB'], // Violet
      '#FFCC80': ['#FFE0B2', '#FFCC80'], // Orange
      '#81C784': ['#A5D6A7', '#81C784'], // Vert
      '#48bb78': ['#A5D6A7', '#48bb78'], // Vert foncé
      '#4299e1': ['#90CDF4', '#4299e1'], // Bleu
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
        {/* Avatar avec photo ou emoji */}
        <View style={styles.avatarContainer}>
          {member.avatarUrl ? (
            // 📸 Vraie photo de profil
            <Image 
              source={{ uri: member.avatarUrl }} 
              style={styles.avatarImage}
              defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
            />
          ) : (
            // 😊 Emoji de fallback
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarEmoji}>{member.avatar}</Text>
            </View>
          )}
          
          {/* Status dot */}
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#757575' }]} />
          
          {/* Bouton d'édition */}
          {showEditButton && onEditPress && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={onEditPress}
              activeOpacity={0.7}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Informations membre */}
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberRole}>
            {member.role === 'admin' 
              ? 'Administrateur'
              : member.role === 'parent' 
                ? 'Parent' 
                : `Enfant${memberAge ? ` (${memberAge} ans)` : ''}`
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
  
  // 📸 Styles pour la vraie photo
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  
  // 😊 Styles pour l'emoji de fallback
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarEmoji: {
    fontSize: 32,
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
  
  // ✏️ Bouton d'édition
  editButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editIcon: {
    fontSize: 12,
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