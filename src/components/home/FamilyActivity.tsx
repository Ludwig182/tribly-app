// src/components/home/FamilyActivity.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FamilyActivityItem {
  time: string;
  title: string;
  details: string;
}

interface FamilyMember {
  name: string;
  initial: string;
  color: string[];
  online: boolean;
}

interface FamilyActivityProps {
  activities: FamilyActivityItem[];
  members: FamilyMember[];
}

export default function FamilyActivity({ activities, members }: FamilyActivityProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>👥 Famille en action</Text>
      
      {/* Activités familiales */}
      {activities.map((activity, index) => (
        <View key={index} style={[styles.eventCard, styles.eventCardFamily]}>
          <Text style={styles.eventTime}>{activity.time} - Cet après-midi</Text>
          <Text style={styles.eventTitle}>{activity.title}</Text>
          <Text style={styles.eventDetails}>{activity.details}</Text>
        </View>
      ))}
      
      {/* Statut famille */}
      <View style={styles.familyStatusCard}>
        <View style={styles.familyStatusHeader}>
          <Text style={styles.familyStatusTitle}>Statut famille</Text>
          <Text style={styles.familyStatusTime}>Maintenant</Text>
        </View>
        <View style={styles.familyMembers}>
          {members.map((member, index) => (
            <View key={index} style={styles.memberContainer}>
              <LinearGradient colors={member.color} style={styles.memberAvatar}>
                <Text style={styles.memberText}>{member.initial}</Text>
              </LinearGradient>
              <View style={[styles.statusIndicator, member.online ? styles.online : styles.offline]} />
            </View>
          ))}
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
  
  eventCardFamily: {
    borderLeftColor: '#7986CB',
    opacity: 0.85,
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
  
  familyStatusCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  familyStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  familyStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },
  
  familyStatusTime: {
    fontSize: 12,
    color: '#718096',
  },
  
  familyMembers: {
    flexDirection: 'row',
    gap: 8,
  },
  
  memberContainer: {
    position: 'relative',
  },
  
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  memberText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  
  statusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  
  online: {
    backgroundColor: '#48bb78',
  },
  
  offline: {
    backgroundColor: '#718096',
  },
});