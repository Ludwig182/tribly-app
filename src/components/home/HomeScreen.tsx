// src/components/home/HomeScreen.tsx - REFONTE COMPLÈTE
import React, { useRef, useState, useEffect } from 'react';
import { 
  Image, 
  Modal, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Animated,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme/ThemeProvider';

// Import des composants refactorés
// Si les fichiers n'existent pas encore, commentez temporairement ces imports
// import TribsHeroCard from './TribsHeroCard';
// import PrioritiesCarousel from './PrioritiesCarousel';
// import QuickActionsGrid from './QuickActionsGrid';
// import FamilyActivityFeed from './FamilyActivityFeed';
import FloatingMoodIndicator from './FloatingMoodIndicator';

// Import des hooks
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, fontSizeBase, fontFamily } = useTheme();
  const { userName, familyMember, userRole, isAuthenticated, signOut } = useAuth();
  const { familyData, currentMember, stats, familyName, loading } = useFamily();

  // États et animations
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const [greeting, setGreeting] = useState('');
  const [timeEmoji, setTimeEmoji] = useState('');

  // Animation d'entrée
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Mise à jour du greeting
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    let greet, emoji;
    
    if (hour < 6) {
      greet = 'Bonne nuit';
      emoji = '🌙';
    } else if (hour < 12) {
      greet = 'Bonjour';
      emoji = '☀️';
    } else if (hour < 18) {
      greet = 'Bon après-midi';
      emoji = '🌤️';
    } else if (hour < 22) {
      greet = 'Bonsoir';
      emoji = '🌆';
    } else {
      greet = 'Bonne soirée';
      emoji = '✨';
    }
    
    setGreeting(greet);
    setTimeEmoji(emoji);
  };

  // Parallax header effect
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  // Construction des données (garde la logique existante)
  const familyMembers = familyData?.members || [];
  const displayData = {
    parent: userName || currentMember?.name || 'Utilisateur',
    familyName: familyName || 'Famille',
    children: familyMembers
      .filter(member => member.role === 'child')
      .map(child => ({
        name: child.name,
        tribs: child.tribs || 0,
        avatar: child.avatar || '😊',
        color: child.color ? [child.color, child.color] : [colors.primary, colors.secondary]
      })),
    priorities: [
      { id: '1', time: '15:30', title: 'Dentiste Clémentine', emoji: '🦷', urgent: true },
      { id: '2', time: '18:00', title: 'Préparer dîner', emoji: '🍽️', urgent: false }
    ],
    mood: 'energetic' // Statique pour l'instant
  };

  const quickActions = [
    { id: '1', title: 'Calendrier', count: '4', emoji: '📅', colors: [colors.primary, colors.secondary] },
    { id: '2', title: 'Tâches', count: `${stats.tasks.todo || 0}`, emoji: '✅', colors: ['#48bb78', '#38a169'] },
    { id: '3', title: 'Courses', count: `${stats.shopping.toBuy || 0}`, emoji: '🛒', colors: ['#FFCC80', '#A29BFE'] },
    { id: '4', title: 'Famille', count: `${stats.totalMembers || 0}`, emoji: '👨‍👩‍👧‍👦', colors: [colors.secondary, colors.primary] }
  ];

  if (loading || !familyData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement magique en cours...
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header moderne avec blur effect */}
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            transform: [
              { translateY: headerTranslateY },
              { scale: headerScale }
            ],
          }
        ]}
      >
        <LinearGradient 
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Pattern décoratif */}
          <View style={styles.headerPattern}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>

          <SafeAreaView>
            <View style={styles.headerContent}>
              {/* Greeting Section */}
              <Animated.View 
                style={[
                  styles.greetingSection,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.timeEmoji}>{timeEmoji}</Text>
                <View>
                  <Text style={styles.greetingText}>{greeting},</Text>
                  <Text style={styles.userName}>{displayData.parent} !</Text>
                </View>
              </Animated.View>

              {/* Profile Button avec animation */}
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => setProfileModalVisible(true)}
                activeOpacity={0.8}
              >
                <Animated.View 
                  style={[
                    styles.profileButtonInner,
                    {
                      transform: [{
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1]
                        })
                      }]
                    }
                  ]}
                >
                  {familyMember?.avatarUrl ? (
                    <Image source={{ uri: familyMember.avatarUrl }} style={styles.profileImage} />
                  ) : (
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                      style={styles.profileGradient}
                    >
                      <Text style={styles.profileEmoji}>{familyMember?.avatar || '👤'}</Text>
                    </LinearGradient>
                  )}
                  <View style={styles.onlineIndicator} />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Family Stats Bar */}
            <Animated.View 
              style={[
                styles.statsBar,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalTribs || 0}</Text>
                <Text style={styles.statLabel}>Tribs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalMembers || 0}</Text>
                <Text style={styles.statLabel}>Membres</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.tasks.todo || 0}</Text>
                <Text style={styles.statLabel}>À faire</Text>
              </View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      {/* Contenu principal avec animations */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* CONTENU TEMPORAIRE EN ATTENDANT LES COMPOSANTS */}
        
        {/* Hero Card Tribs - Version simplifiée */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={[styles.tempHeroCard, { shadowColor: colors.primary }]}
          >
            <Text style={styles.tempHeroTitle}>🎯 Objectif Famille</Text>
            <View style={styles.tempProgressContainer}>
              <View style={styles.tempProgressBar}>
                <LinearGradient
                  colors={['#4CAF50', '#81C784']}
                  style={[styles.tempProgressFill, { width: '65%' }]}
                />
              </View>
              <Text style={styles.tempProgressText}>
                {stats.totalTribs || 0} / 500 Tribs
              </Text>
            </View>
            <Text style={styles.tempRewardText}>
              🎢 Parc d'attractions dans {500 - (stats.totalTribs || 0)} Tribs !
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Priorités - Version simplifiée */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <Text style={[styles.tempSectionTitle, { color: colors.text }]}>
            ⚡ Priorités du jour
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tempCarousel}>
            {displayData.priorities.map((priority, index) => (
              <View
                key={priority.id}
                style={[styles.tempPriorityCard, { 
                  backgroundColor: colors.card,
                  borderColor: priority.urgent ? '#FF6B6B' : colors.border
                }]}
              >
                <Text style={styles.tempCardEmoji}>{priority.emoji}</Text>
                <Text style={[styles.tempCardTitle, { color: colors.text }]}>
                  {priority.title}
                </Text>
                <Text style={[styles.tempCardTime, { color: colors.textSecondary }]}>
                  {priority.time}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Actions rapides - Version simplifiée */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <Text style={[styles.tempSectionTitle, { color: colors.text }]}>
            ⚡ Actions rapides
          </Text>
          <View style={styles.tempGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={styles.tempGridItem}
                onPress={() => {
                  // Navigation temporaire
                  console.log('Navigate to:', action.title);
                }}
              >
                <LinearGradient
                  colors={action.colors}
                  style={styles.tempGridCard}
                >
                  <Text style={styles.tempGridEmoji}>{action.emoji}</Text>
                  <Text style={styles.tempGridTitle}>{action.title}</Text>
                  <Text style={styles.tempGridCount}>{action.count}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Activité famille - Version simplifiée */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <Text style={[styles.tempSectionTitle, { color: colors.text }]}>
            👥 Activité famille
          </Text>
          <View style={[styles.tempActivityCard, { backgroundColor: colors.card }]}>
            <View style={styles.tempActivityItem}>
              <Text style={styles.tempActivityEmoji}>✅</Text>
              <Text style={[styles.tempActivityText, { color: colors.text }]}>
                <Text style={{ fontWeight: '600' }}>Clémentine</Text> a terminé "Ranger sa chambre"
              </Text>
            </View>
            <View style={styles.tempActivityItem}>
              <Text style={styles.tempActivityEmoji}>🛒</Text>
              <Text style={[styles.tempActivityText, { color: colors.text }]}>
                <Text style={{ fontWeight: '600' }}>Ludwig</Text> a ajouté 3 articles
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Floating Mood Indicator */}
      <FloatingMoodIndicator mood={displayData.mood} />

      {/* Profile Modal (garde l'existant mais avec style amélioré) */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <BlurView intensity={80} style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setProfileModalVisible(false)}
          >
            <Animated.View 
              style={[
                styles.modalContent,
                { backgroundColor: colors.card }
              ]}
            >
              {/* Contenu du modal profil existant mais avec style amélioré */}
              <View style={styles.modalHandle} />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              
              {/* Avatar */}
              <View style={styles.modalAvatarContainer}>
                {familyMember?.avatarUrl ? (
                  <Image source={{ uri: familyMember.avatarUrl }} style={styles.modalAvatar} />
                ) : (
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.modalAvatarGradient}
                  >
                    <Text style={styles.modalAvatarEmoji}>{familyMember?.avatar || '👤'}</Text>
                  </LinearGradient>
                )}
              </View>

              <Text style={[styles.modalUserName, { color: colors.text }]}>
                {familyMember?.name || 'Utilisateur'}
              </Text>
              <Text style={[styles.modalUserRole, { color: colors.textSecondary }]}>
                {familyMember?.role === 'admin' ? '👑 Administrateur' : 
                 familyMember?.role === 'parent' ? '👤 Parent' : '⭐ Enfant'}
              </Text>

              <TouchableOpacity 
                style={[styles.signOutButton, { backgroundColor: colors.dangerBackground }]}
                onPress={async () => {
                  await signOut();
                  setProfileModalVisible(false);
                }}
              >
                <Text style={[styles.signOutText, { color: colors.dangerText }]}>
                  Se déconnecter
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    fontFamily: 'System',
  },

  // Header styles
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },

  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
  },

  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
  },

  circle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
  },

  circle3: {
    width: 100,
    height: 100,
    top: 50,
    left: 50,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
  },

  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  timeEmoji: {
    fontSize: 32,
  },

  greetingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  userName: {
    fontSize: 24,
    color: 'white',
    fontWeight: '700',
    marginTop: 2,
  },

  profileButton: {
    padding: 4,
  },

  profileButtonInner: {
    position: 'relative',
  },

  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  profileGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  profileEmoji: {
    fontSize: 24,
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 20,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },

  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: SCREEN_HEIGHT < 700 ? 220 : 260,
    paddingHorizontal: 20,
  },

  bottomSpacer: {
    height: 100,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },

  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 20,
  },

  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCloseText: {
    fontSize: 18,
    color: '#666',
  },

  modalAvatarContainer: {
    marginBottom: 20,
  },

  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  modalAvatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalAvatarEmoji: {
    fontSize: 48,
  },

  modalUserName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },

  modalUserRole: {
    fontSize: 16,
    marginBottom: 30,
  },

  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },

  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // STYLES TEMPORAIRES pour les composants inline
  tempHeroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  tempHeroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },

  tempProgressContainer: {
    marginBottom: 16,
  },

  tempProgressBar: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    marginBottom: 8,
  },

  tempProgressFill: {
    height: '100%',
    borderRadius: 6,
  },

  tempProgressText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'right',
  },

  tempRewardText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },

  tempSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  tempCarousel: {
    marginHorizontal: -20,
    marginBottom: 24,
  },

  tempPriorityCard: {
    width: 250,
    padding: 16,
    marginLeft: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  tempCardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },

  tempCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  tempCardTime: {
    fontSize: 14,
  },

  tempGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },

  tempGridItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },

  tempGridCard: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },

  tempGridEmoji: {
    fontSize: 32,
    color: 'white',
  },

  tempGridTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  tempGridCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  tempActivityCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  tempActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  tempActivityEmoji: {
    fontSize: 20,
    marginRight: 12,
  },

  tempActivityText: {
    fontSize: 14,
    flex: 1,
  },
});