// src/components/family/FamilyMemberCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FamilyMember {
  name: string;
  role: string;
  avatar: string;
  color: string[];
  status: string;
  lastSeen: string;
  tasksCompleted: number;
  tribsEarned: number;
}

interface FamilyMemberCardProps {
  member: FamilyMember;
}

export default function FamilyMemberCard({ member }: FamilyMemberCardProps) {
  const isOnline = member.status === 'online';

  return (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.memberLeft}>
          <LinearGradient
            colors={member.color}
            style={styles.memberAvatar}
          >
            <Text style={styles.memberAvatarText}>{member.avatar}</Text>
            <View style={[
              styles.statusDot, 
              isOnline ? styles.statusOnline : styles.statusOffline
            ]} />
          </LinearGradient>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRole}>{member.role}</Text>
            <Text style={styles.memberLastSeen}>
              {isOnline ? '🟢 En ligne' : `⚫ ${member.lastSeen}`}
            </Text>
          </View>
        </View>
        
        <View style={styles.memberStats}>
          <View style={styles.memberStat}>
            <Text style={styles.memberStatNumber}>{member.tasksCompleted}</Text>
            <Text style={styles.memberStatLabel}>Tâches</Text>
          </View>
          {member.tribsEarned > 0 && (
            <LinearGradient
              colors={member.color}
              style={styles.memberTribsBadge}
            >
              <Text style={styles.memberTribsText}>{member.tribsEarned} T</Text>
            </LinearGradient>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  
  memberAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  
  statusOnline: {
    backgroundColor: '#48bb78',
  },
  
  statusOffline: {
    backgroundColor: '#718096',
  },
  
  memberInfo: {
    flex: 1,
  },
  
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  
  memberRole: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 2,
  },
  
  memberLastSeen: {
    fontSize: 11,
    color: '#718096',
  },
  
  memberStats: {
    alignItems: 'flex-end',
    gap: 8,
  },
  
  memberStat: {
    alignItems: 'center',
  },
  
  memberStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },
  
  memberStatLabel: {
    fontSize: 10,
    color: '#4a5568',
  },
  
  memberTribsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  memberTribsText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});