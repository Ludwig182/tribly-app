// src/components/home/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import des composants
import TribsOverview from './TribsOverview';
import PrioritiesList from './PrioritiesList';
import FamilyActivity from './FamilyActivity';
import AISuggestion from './AISuggestion';
import QuickActions from './QuickActions';

export default function HomeScreen() {
  // Données famille Ludwig
  const familyData = {
    members: [
      { name: 'Rosaly', initial: 'R', color: ['#FF8A80', '#7986CB'], online: true },
      { name: 'Ludwig', initial: 'L', color: ['#48bb78', '#38a169'], online: false },
      { name: 'Clémentine', initial: 'C', color: ['#FFCC80', '#A29BFE'], online: true },
      { name: 'Jacob', initial: 'J', color: ['#FF8A80', '#FFCC80'], online: true }
    ],
    parent: 'Rosaly',
    familyName: 'Famille Questroy',
    children: [
      {
        name: 'Clémentine',
        age: 12,
        emoji: '🌸',
        tribs: 235,
        maxTribs: 300,
        streak: 5,
        status: '🔥 Série de 5 jours',
        nextReward: '🎬 Sortie cinéma dans 15 Tribs',
        color: ['#FF8A80', '#7986CB']
      },
      {
        name: 'Jacob',
        age: 8,
        tribs: 180,
        maxTribs: 250,
        streak: 3,
        status: '📚 Bonne note maths !',
        nextReward: '🎮 Temps d\'écran bonus dans 70 Tribs',
        color: ['#FFCC80', '#A29BFE']
      }
    ],
    familyGoal: {
      current: 415,
      target: 500,
      reward: '🎢 Parc d\'attractions',
      remaining: 85
    },
    priorities: [
      { time: '15:30', title: 'Dentiste Clémentine', details: 'Dr. Martin • Emmener Clémentine', urgent: true },
      { time: '18:00', title: 'Préparer dîner', details: 'Menu: Pâtes bolognaise • 4 personnes', urgent: false }
    ],
    familyActivity: [
      { time: '16:00', title: 'Entraînement foot Jacob', details: 'Ludwig l\'accompagne • Stade municipal' }
    ]
  };

  const quickActions = [
    {
      title: 'Calendrier',
      subtitle: '4 événements',
      emoji: '📅',
      colors: ['#FF8A80', '#7986CB'],
      onPress: () => console.log('Navigate to Calendar')
    },
    {
      title: 'Tâches',
      subtitle: '3 à faire',
      emoji: '✅',
      colors: ['#48bb78', '#38a169'],
      onPress: () => console.log('Navigate to Tasks')
    },
    {
      title: 'Courses',
      subtitle: '8 articles',
      emoji: '🛒',
      colors: ['#FFCC80', '#A29BFE'],
      onPress: () => console.log('Navigate to Shopping')
    },
    {
      title: 'Famille',
      subtitle: '4 membres',
      emoji: '👨‍👩‍👧‍👦',
      colors: ['#7986CB', '#FF8A80'],
      onPress: () => console.log('Navigate to Family')
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec gradient */}
        <LinearGradient
          colors={['#FF8A80', '#7986CB']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.logoSection}>
              <View style={styles.logo}>
                <Text style={styles.logoEmoji}>👨‍👩‍👧‍👦</Text>
              </View>
              <View>
                <Text style={styles.welcomeTitle}>{getGreeting()} {familyData.parent} !</Text>
                <Text style={styles.welcomeSubtitle}>{familyData.familyName} • 4 membres</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileBtn}>
              <Text style={styles.profileEmoji}>👤</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Tableau des Tribs */}
          <TribsOverview 
            children={familyData.children}
            familyGoal={familyData.familyGoal}
          />

          {/* Mes priorités aujourd'hui */}
          <PrioritiesList priorities={familyData.priorities} />

          {/* Famille en action */}
          <FamilyActivity 
            activities={familyData.familyActivity}
            members={familyData.members}
          />

          {/* Suggestion IA Premium */}
          <AISuggestion
            suggestion="Jacob peut aider Clémentine avec la vaisselle = +30 Tribs famille. Plus que 55 Tribs pour le parc !"
            actionText="Suggérer à Jacob"
            onActionPress={() => console.log('Suggestion envoyée à Jacob')}
          />

          {/* Actions rapides */}
          <QuickActions actions={quickActions} />

          {/* Espace pour la navigation */}
          <View style={styles.bottomSpacer} />
        </View>
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
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  logo: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logoEmoji: {
    fontSize: 20,
  },
  
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
  },
  
  welcomeSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  
  profileBtn: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  profileEmoji: {
    fontSize: 18,
    color: 'white',
  },
  
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  bottomSpacer: {
    height: 100,
  },
});