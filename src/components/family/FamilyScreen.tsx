// src/components/family/FamilyScreen.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';

// Import des composants
import FamilyStats from './FamilyStats';
import FamilyMemberCard from './FamilyMemberCard';
import FamilySettings from './FamilySettings';

export default function FamilyScreen() {
  // Données des membres famille
  const familyMembers = [
    {
      name: 'Rosaly',
      role: 'Maman',
      avatar: 'R',
      color: ['#FF8A80', '#7986CB'],
      status: 'online',
      lastSeen: 'Maintenant',
      tasksCompleted: 12,
      tribsEarned: 0 // Parents n'ont pas de Tribs
    },
    {
      name: 'Ludwig',
      role: 'Papa',
      avatar: 'L',
      color: ['#48bb78', '#38a169'],
      status: 'offline',
      lastSeen: 'Il y a 2h',
      tasksCompleted: 8,
      tribsEarned: 0
    },
    {
      name: 'Clémentine',
      role: 'Fille (12 ans)',
      avatar: 'C',
      color: ['#FFCC80', '#A29BFE'],
      status: 'online',
      lastSeen: 'Maintenant',
      tasksCompleted: 15,
      tribsEarned: 235
    },
    {
      name: 'Jacob',
      role: 'Fils (8 ans)',
      avatar: 'J',
      color: ['#FF8A80', '#FFCC80'],
      status: 'online',
      lastSeen: 'Maintenant',
      tasksCompleted: 10,
      tribsEarned: 180
    }
  ];

  // Réglages famille
  const familySettings = [
    {
      title: 'Système Tribs',
      description: 'Configurer récompenses et valeurs',
      emoji: '🏆',
      colors: ['#FF8A80', '#7986CB'],
      onPress: () => console.log('Navigate to Tribs Settings')
    },
    {
      title: 'Notifications',
      description: 'Gérer les alertes famille',
      emoji: '🔔',
      colors: ['#48bb78', '#38a169'],
      onPress: () => console.log('Navigate to Notifications')
    },
    {
      title: 'Inviter membres',
      description: 'Ajouter grands-parents, baby-sitter...',
      emoji: '👥',
      colors: ['#FFCC80', '#A29BFE'],
      onPress: () => console.log('Navigate to Invite Members')
    },
    {
      title: 'Premium',
      description: 'IA + Fonctionnalités avancées',
      emoji: '⭐',
      colors: ['#667eea', '#764ba2'],
      onPress: () => console.log('Navigate to Premium')
    }
  ];

  // Calculs dynamiques
  const totalTribs = familyMembers.reduce((sum, member) => sum + member.tribsEarned, 0);
  const onlineMembers = familyMembers.filter(member => member.status === 'online').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7986CB', '#A29BFE']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>👨‍👩‍👧‍👦 Famille Questroy</Text>
        <Text style={styles.headerSubtitle}>{onlineMembers}/4 membres connectés</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Statistiques famille */}
        <FamilyStats
          totalTribs={totalTribs}
          totalMembers={familyMembers.length}
          onlineMembers={onlineMembers}
        />

        {/* Membres de la famille */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Membres de la famille</Text>
          {familyMembers.map((member, index) => (
            <FamilyMemberCard key={index} member={member} />
          ))}
        </View>

        {/* Réglages famille */}
        <FamilySettings settings={familySettings} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  
  content: {
    flex: 1,
    padding: 20,
  },
  
  section: {
    marginBottom: 25,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 15,
  },
  
  bottomSpacer: {
    height: 100,
  },
});