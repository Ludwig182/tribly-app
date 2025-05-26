// src/components/home/HomeScreen.tsx - Version complète avec authentification
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import des composants
import TribsOverview from './TribsOverview';
import PrioritiesList from './PrioritiesList';
import FamilyActivity from './FamilyActivity';
import AISuggestion from './AISuggestion';
import QuickActions from './QuickActions';

// Import des hooks
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';

export default function HomeScreen() {
  // 🔐 Données d'authentification
  const { userName, familyMember, userRole, isAuthenticated } = useAuth();
  
  // 👥 Données famille
  const { familyData, currentMember, stats, familyName, loading } = useFamily();

  // 📊 Construire les données pour les composants (avec fallback)
  const familyMembers = familyData?.members || [];
  
  // 🎯 Fonctions utilitaires
  const calculateAge = (birthDate) => {
    if (!birthDate) return 12; // Fallback
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const getRandomStatus = () => {
    const statuses = [
      '🔥 Série active !',
      '📚 Super week !',
      '⭐ En forme !',
      '🎯 Concentré(e)',
      '💪 Motivé(e)'
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getNextReward = (currentTribs) => {
    const rewards = [
      { threshold: 50, reward: '🍦 Glace bonus' },
      { threshold: 100, reward: '🎮 Temps d\'écran +30min' },
      { threshold: 200, reward: '🎬 Sortie cinéma' },
      { threshold: 300, reward: '🎪 Parc d\'attractions' }
    ];
    
    const nextReward = rewards.find(r => currentTribs < r.threshold);
    if (nextReward) {
      const remaining = nextReward.threshold - currentTribs;
      return `${nextReward.reward} dans ${remaining} Tribs`;
    }
    return '🏆 Champion ! Nouveaux défis bientôt';
  };

  const displayData = {
    members: familyMembers.map(member => ({
      name: member.name,
      initial: member.name[0],
      color: member.color ? [member.color, member.color] : ['#FF8A80', '#7986CB'],
      online: member.status === 'online' || true
    })),
    parent: userName || currentMember?.name || 'Utilisateur',
    familyName: familyName || 'Famille',
    children: familyMembers
      .filter(member => member.role === 'child')
      .map(child => ({
        name: child.name,
        age: child.birthDate ? calculateAge(child.birthDate) : 12, // Fallback age
        emoji: child.avatar || '😊',
        tribs: child.tribs || 0,
        maxTribs: 300, // TODO: Configurable per child
        streak: Math.floor(Math.random() * 7) + 1, // TODO: Calculate real streak
        status: getRandomStatus(),
        nextReward: getNextReward(child.tribs || 0),
        color: child.color ? [child.color, child.color] : ['#FF8A80', '#7986CB']
      })),
    familyGoal: {
      current: stats.totalTribs || 0,
      target: 500,
      reward: '🎢 Parc d\'attractions',
      remaining: Math.max(0, 500 - (stats.totalTribs || 0))
    },
    priorities: [
      // TODO: Intégrer avec système de calendrier/tâches
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
      subtitle: `${stats.tasks.todo || 0} à faire`,
      emoji: '✅',
      colors: ['#48bb78', '#38a169'],
      onPress: () => console.log('Navigate to Tasks')
    },
    {
      title: 'Courses',
      subtitle: `${stats.shopping.toBuy || 0} articles`,
      emoji: '🛒',
      colors: ['#FFCC80', '#A29BFE'],
      onPress: () => console.log('Navigate to Shopping')
    },
    {
      title: 'Famille',
      subtitle: `${stats.totalMembers || 0} membres`,
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

  // 🔄 Si loading, afficher loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                <Text style={styles.welcomeTitle}>{getGreeting()} {displayData.parent} !</Text>
                <Text style={styles.welcomeSubtitle}>{displayData.familyName} • {stats.totalMembers || 0} membres</Text>
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
            children={displayData.children}
            familyGoal={displayData.familyGoal}
          />

          {/* Mes priorités aujourd'hui */}
          <PrioritiesList priorities={displayData.priorities} />

          {/* Famille en action */}
          <FamilyActivity 
            activities={displayData.familyActivity}
            members={displayData.members}
          />

          {/* Suggestion IA Premium */}
          <AISuggestion
            suggestion="Système intelligent activé ! Connectez-vous avec vos tâches pour des suggestions personnalisées."
            actionText="Découvrir"
            onActionPress={() => console.log('Navigate to Tasks')}
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
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#4a5568',
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