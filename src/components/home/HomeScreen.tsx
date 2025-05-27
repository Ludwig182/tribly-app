// src/components/home/HomeScreen.tsx - Version complète avec authentification
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

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
  const { userName, familyMember, userRole, isAuthenticated, signOut } = useAuth();
  // 🗃️ État pour le modal de profil
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const { colors } = useTheme();
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
      colors: ['#FF8A80', '#7986CB']
    },
    {
      title: 'Tâches',
      subtitle: `${stats.tasks.todo || 0} à faire`,
      emoji: '✅',
      colors: ['#48bb78', '#38a169']
    },
    {
      title: 'Courses',
      subtitle: `${stats.shopping.toBuy || 0} articles`,
      emoji: '🛒',
      colors: ['#FFCC80', '#A29BFE']
    },
    {
      title: 'Famille',
      subtitle: `${stats.totalMembers || 0} membres`,
      emoji: '👨‍👩‍👧‍👦',
      colors: ['#7986CB', '#FF8A80']
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec gradient */}
        <LinearGradient 
          colors={[colors.primary, colors.secondary]}
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
                <Text style={styles.welcomeSubtitle}>
                  {displayData.familyName} • {stats.totalMembers || 0} membres
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => setProfileModalVisible(true)}
              activeOpacity={0.7}
            >
              {familyMember?.avatarUrl ? (
                <Image source={{ uri: familyMember.avatarUrl }} style={styles.profileImage} />
              ) : (
                <Text style={styles.profileEmoji}>
                  {familyMember?.avatar || '👤'}
                </Text>
              )}
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
          />

          {/* Actions rapides */}
          <QuickActions actions={quickActions} />

          {/* Espace pour la navigation */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
      {/* Modal de profil */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        user={familyMember}
        isAuthenticated={isAuthenticated}
        onSignOut={signOut}
        familyName={familyName}
      />
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

  profileImage: {
  width: 41,
  height: 41,
  borderRadius: 20.5,
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

// 👤 Modal de profil - À AJOUTER à la fin de HomeScreen.tsx
function ProfileModal({ visible, onClose, user, isAuthenticated, onSignOut, familyName }) {
  const handleSignOut = async () => {
    try {
      await onSignOut();
      onClose();
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={modalStyles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={modalStyles.content} 
          activeOpacity={1}
          onPress={() => {}} // Empêcher la fermeture lors du clic sur le contenu
        >
          {/* Avatar */}
          <View style={modalStyles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={modalStyles.avatar} />
            ) : (
              <LinearGradient
                colors={user?.color ? [user.color, user.color] : ['#FF8A80', '#7986CB']}
                style={modalStyles.avatarFallback}
              >
                <Text style={modalStyles.avatarEmoji}>{user?.avatar || '👤'}</Text>
              </LinearGradient>
            )}
            
            {/* Badge du rôle */}
            <View style={modalStyles.roleBadge}>
              <Text style={modalStyles.roleBadgeText}>
                {user?.role === 'admin' ? '👑' : user?.role === 'parent' ? '👤' : '⭐'}
              </Text>
            </View>
          </View>

          {/* Infos utilisateur */}
          <Text style={modalStyles.userName}>{user?.name || 'Utilisateur'}</Text>
          <Text style={modalStyles.userRole}>
            {user?.role === 'admin' ? 'Administrateur' : 
             user?.role === 'parent' ? 'Parent' : 'Enfant'}
          </Text>
          {user?.email && (
            <Text style={modalStyles.userEmail}>{user.email}</Text>
          )}
          
          {/* Famille */}
          <View style={modalStyles.familyInfo}>
            <Text style={modalStyles.familyLabel}>👨‍👩‍👧‍👦 Famille</Text>
            <Text style={modalStyles.familyName}>{familyName}</Text>
          </View>

          {/* Tribs */}
          <LinearGradient
            colors={['#FFD54F', '#FF8A80']}
            style={modalStyles.tribsCard}
          >
            <Text style={modalStyles.tribsNumber}>{user?.tribs || 0}</Text>
            <Text style={modalStyles.tribsLabel}>Tribs</Text>
          </LinearGradient>

          {/* Actions */}
          <View style={modalStyles.actions}>
            <TouchableOpacity 
              style={modalStyles.actionButton}
              onPress={() => {
                onClose();
                // TODO: Ouvrir modal d'édition de profil
                console.log('🔧 Éditer profil - TODO');
              }}
            >
              <Text style={modalStyles.actionButtonIcon}>✏️</Text>
              <Text style={modalStyles.actionButtonText}>Éditer profil</Text>
            </TouchableOpacity>

            {isAuthenticated && (
              <TouchableOpacity 
                style={[modalStyles.actionButton, modalStyles.signOutButton]}
                onPress={handleSignOut}
              >
                <Text style={modalStyles.actionButtonIcon}>🚪</Text>
                <Text style={modalStyles.signOutButtonText}>Se déconnecter</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Mode */}
          <Text style={modalStyles.modeText}>
            {isAuthenticated ? '🔐 Connecté' : '🧪 Mode test'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 320,
    width: '100%',
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  avatarEmoji: {
    fontSize: 32,
  },

  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },

  roleBadgeText: {
    fontSize: 12,
  },

  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
    textAlign: 'center',
  },

  userRole: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
    textAlign: 'center',
  },

  userEmail: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 16,
    textAlign: 'center',
  },

  familyInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },

  familyLabel: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
  },

  familyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },

  tribsCard: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  tribsNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  tribsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  actions: {
    width: '100%',
    gap: 12,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },

  signOutButton: {
    backgroundColor: '#fed7d7',
    borderColor: '#feb2b2',
  },

  actionButtonIcon: {
    fontSize: 16,
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },

  signOutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c53030',
  },

  modeText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 16,
    textAlign: 'center',
  },
});