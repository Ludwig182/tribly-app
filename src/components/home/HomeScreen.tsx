// src/components/home/HomeScreen.tsx - VERSION DEBUG
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
import { useTheme } from '@/theme/ThemeProvider';

// Import des composants - VÉRIFIER QUE CES FICHIERS EXISTENT
import TribsHeroCard from './TribsHeroCard';
import PrioritiesCarousel from './PrioritiesCarousel';
import QuickActionsGrid from './QuickActionsGrid';
import FamilyActivityFeed from './FamilyActivityFeed';
import FloatingMoodIndicator from './FloatingMoodIndicator';

// Import des hooks
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, fontSizeBase, fontFamily } = useTheme();
  const { userName, familyMember, userRole, isAuthenticated, signOut } = useAuth();
  const { familyData, currentMember, stats, familyName, loading } = useFamily();

  // DEBUG: Log des données
  console.log('🔍 DEBUG HomeScreen:', {
    userName,
    familyMember,
    familyData,
    stats,
    loading
  });

  // États et animations
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
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

  // Construction des données avec valeurs par défaut
  const familyMembers = familyData?.members || [];
  
  // Données pour TribsHeroCard
  const familyGoal = {
    current: stats?.totalTribs || 150,
    target: 500,
    reward: '🎢 Parc d\'attractions'
  };

  const children = familyMembers
    .filter(member => member.role === 'child')
    .map(child => ({
      name: child.name,
      tribs: child.tribs || 0,
      avatar: child.avatar || '😊',
      color: child.color ? [child.color, child.color] : [colors.primary, colors.secondary]
    }));

  // Si pas d'enfants, créer des données de démo
  const displayChildren = children.length > 0 ? children : [
    { name: 'Clémentine', tribs: 45, avatar: '👧', color: [colors.primary, colors.secondary] },
    { name: 'Jacob', tribs: 32, avatar: '👦', color: ['#48bb78', '#38a169'] }
  ];

  // Données pour PrioritiesCarousel
  const priorities = [
    { id: '1', time: '15:30', title: 'Dentiste Clémentine', emoji: '🦷', urgent: true },
    { id: '2', time: '18:00', title: 'Préparer dîner', emoji: '🍽️', urgent: false },
    { id: '3', time: '19:00', title: 'Devoirs maths', emoji: '📚', urgent: false }
  ];

  // Données pour QuickActionsGrid
  const quickActions = [
    { id: '1', title: 'Calendrier', count: '4', emoji: '📅', colors: [colors.primary, colors.secondary] },
    { id: '2', title: 'Tâches', count: `${stats?.tasks?.todo || 3}`, emoji: '✅', colors: ['#48bb78', '#38a169'] },
    { id: '3', title: 'Courses', count: `${stats?.shopping?.toBuy || 5}`, emoji: '🛒', colors: ['#FFCC80', '#A29BFE'] },
    { id: '4', title: 'Famille', count: `${stats?.totalMembers || familyMembers.length || 4}`, emoji: '👨‍👩‍👧‍👦', colors: [colors.secondary, colors.primary] }
  ];

  // Membres pour le feed avec données de fallback
  const displayMembers = familyMembers.length > 0 ? familyMembers : [
    { id: '1', name: 'Ludwig', avatar: '👨', color: colors.primary },
    { id: '2', name: 'Clémentine', avatar: '👧', color: colors.secondary },
    { id: '3', name: 'Jacob', avatar: '👦', color: '#48bb78' }
  ];

  const mood = 'energetic';

  // DEBUG: Log des données construites
  console.log('🎯 DEBUG Données construites:', {
    familyGoal,
    displayChildren,
    priorities,
    quickActions,
    displayMembers
  });

  if (loading) {
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
                  <Text style={styles.userName}>{userName || 'Utilisateur'} !</Text>
                </View>
              </Animated.View>

              {/* Profile Button */}
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
                <Text style={styles.statValue}>{stats?.totalTribs || 150}</Text>
                <Text style={styles.statLabel}>Tribs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.totalMembers || 4}</Text>
                <Text style={styles.statLabel}>Membres</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.tasks?.todo || 3}</Text>
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
        {/* DEBUG: Message de test */}
        <View style={{ backgroundColor: 'yellow', padding: 10, marginBottom: 10 }}>
          <Text>DEBUG: ScrollView fonctionne</Text>
        </View>

        {/* Hero Card Tribs */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <TribsHeroCard familyGoal={familyGoal} children={displayChildren} />
        </Animated.View>

        {/* Priorités */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <PrioritiesCarousel priorities={priorities} />
        </Animated.View>

        {/* Actions rapides */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <QuickActionsGrid actions={quickActions} />
        </Animated.View>

        {/* Activité famille */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <FamilyActivityFeed members={displayMembers} />
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Floating Mood Indicator */}
      <FloatingMoodIndicator mood={mood} />
    </View>
  );
}