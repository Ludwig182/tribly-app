// src/components/home/HomeScreen.tsx - VERSION CORRIGÉE ET AMÉLIORÉE
import React, { useRef, useState, useEffect } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator // Ajout pour un meilleur indicateur de chargement
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
// import { BlurView } from 'expo-blur'; // Retiré car non utilisé pour l'instant

// Import des composants
import TribsHeroCard from './TribsHeroCard';
import PrioritiesCarousel from './PrioritiesCarousel';
import QuickActionsGrid from './QuickActionsGrid';
import FamilyActivityFeed from './FamilyActivityFeed';
import MoodIndicatorContextual from './MoodIndicatorContextual';

// Import des hooks
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, fontSizeBase, fontFamily } = useTheme(); // Ligne 42 originale
  const { userName, familyMember, userRole, isAuthenticated, signOut } = useAuth();
  // Extraction des données de useFamily
  const {
    familyData,
    currentMember,
    stats,
    familyName,
    loading: familyHookIsLoading, // Renommé pour clarté
    tasks,
    shoppingItems
  } = useFamily();

  // DEBUG: Log initial des props des hooks (peut être réduit ou supprimé en production)
  console.log('🔍 DEBUG HomeScreen - Hooks Data:', {
    userName,
    isAuth: isAuthenticated,
    familyMemberId: familyMember?.id,
    familyDataName: familyData?.familyName,
    currentMemberName: currentMember?.name,
    statsLoaded: !!stats,
    familyNameFromHook: familyName,
    familyHookIsLoading,
    tasksCount: tasks?.length,
    shoppingItemsCount: shoppingItems?.length
  });

  // États UI
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [greeting, setGreeting] = useState('');
  const [timeEmoji, setTimeEmoji] = useState('');

  // Animations du Header
  const profileScaleAnim = useRef(new Animated.Value(1)).current; // Initialisé à 1 pour taille normale directe
  const opacityAnimForHeaderElements = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // État pour gérer le chargement complet des données
  const [allDataReady, setAllDataReady] = useState(false);

  // Effet pour démarrer les animations d'entrée du header et le greeting
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnimForHeaderElements, {
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

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []); // Se lance une seule fois au montage

  // Effet pour déterminer si toutes les données nécessaires sont prêtes
  useEffect(() => {
    if (
      !familyHookIsLoading &&
      familyData &&
      familyData.members && // Important de vérifier que members est aussi là
      stats &&
      tasks !== undefined && // Vient de useFamily, undefined avant le premier fetch/listener
      shoppingItems !== undefined // Vient de useFamily
    ) {
      console.log('✅ All data is ready for HomeScreen render');
      setAllDataReady(true);
    } else {
      // Optionnel : remettre à false si une dépendance redevient non prête.
      // setAllDataReady(false);
      console.log('⏳ Waiting for all data...', { familyHookIsLoading, familyData: !!familyData, members: familyData?.members?.length, stats: !!stats, tasks: tasks !== undefined, shoppingItems: shoppingItems !== undefined });
    }
  }, [familyHookIsLoading, familyData, stats, tasks, shoppingItems]); // Dépendances pour cet effet

  const updateGreeting = () => {
    const hour = new Date().getHours();
    let greet, emoji;
    if (hour < 6) { greet = 'Bonne nuit'; emoji = '🌙'; }
    else if (hour < 12) { greet = 'Bonjour'; emoji = '☀️'; }
    else if (hour < 18) { greet = 'Bon après-midi'; emoji = '🌤️'; }
    else if (hour < 22) { greet = 'Bonsoir'; emoji = '🌆'; }
    else { greet = 'Bonne soirée'; emoji = '✨'; }
    setGreeting(greet);
    setTimeEmoji(emoji);
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 150], outputRange: [0, -50], extrapolate: 'clamp',
  });
  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0], outputRange: [1.2, 1], extrapolate: 'clamp',
  });

  // Construction des données pour les composants enfants
  // Ces variables seront recalculées à chaque rendu, donc elles utiliseront
  // les `familyData` et `stats` à jour lorsque `allDataReady` devient true.
  const familyMembers = familyData?.members || [];
  const familyGoal = {
    current: stats?.totalTribs || 0, // Utiliser 0 si stats n'est pas prêt, plutôt que 150
    target: familyData?.settings?.tribsGoal || 500,
    reward: familyData?.settings?.currentGoalReward || '🎢 Parc d\'attractions'
  };
  const children = familyMembers
    .filter(member => member.role === 'child')
    .map(child => ({
      name: child.name,
      tribs: child.tribs || 0,
      avatar: child.avatar || '😊',
      color: child.color ? [child.color, child.color] : [colors.primary, colors.secondary]
    }));
  const displayChildren = children.length > 0 ? children : [
    // Fallback si aucune donnée enfant, ou supprimer si vous affichez seulement les vrais enfants
    // { name: 'Enfant 1 (Démo)', tribs: 0, avatar: '👧', color: [colors.primary, colors.secondary] },
  ];
  const priorities = (familyData?.priorities || [ // Utiliser les priorités de familyData si disponibles
    { id: 'demo1', time: '15:30', title: 'Dentiste Clémentine (Démo)', emoji: '🦷', urgent: true },
    { id: 'demo2', time: '18:00', title: 'Préparer dîner (Démo)', emoji: '🍽️', urgent: false },
  ]);
  const quickActions = [
    { id: '1', title: 'Calendrier', count: `${stats?.calendar?.upcoming || 0}`, emoji: '📅', colors: [colors.primary, colors.secondary] },
    { id: '2', title: 'Tâches', count: `${stats?.tasks?.todo || 0}`, emoji: '✅', colors: ['#48bb78', '#38a169'] },
    { id: '3', title: 'Courses', count: `${stats?.shopping?.toBuy || 0}`, emoji: '🛒', colors: ['#FFCC80', '#A29BFE'] },
    { id: '4', title: 'Famille', count: `${stats?.totalMembers || 0}`, emoji: '👨‍👩‍👧‍👦', colors: [colors.secondary, colors.primary] }
  ];
  const displayMembers = familyMembers.length > 0 ? familyMembers : [
    // Fallback si aucune donnée membre, ou supprimer pour n'afficher que les vrais
    // { id: 'demoM1', name: 'Parent (Démo)', avatar: '👨', color: colors.primary },
  ];
  const mood = stats?.familyMood || 'calm'; // Utiliser une humeur de stats si disponible

  // Écran de chargement tant que allDataReady n'est pas true
  if (!allDataReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 10 }]}>
          Préparation de votre espace...
        </Text>
      </View>
    );
  }

  // Rendu principal lorsque toutes les données sont prêtes
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateY }, { scale: headerScale }] }
        ]}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerPattern}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>
          <SafeAreaView>
            <View style={styles.headerContent}>
              <Animated.View style={[styles.greetingSection, { opacity: opacityAnimForHeaderElements, transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.timeEmoji}>{timeEmoji}</Text>
                <View>
                  <Text style={styles.greetingText}>{greeting},</Text>
                  <Text style={styles.userName}>{userName || 'Utilisateur'} !</Text>
                </View>
              </Animated.View>
              <TouchableOpacity style={styles.profileButton} onPress={() => setProfileModalVisible(true)} activeOpacity={0.8}>
                <Animated.View style={[styles.profileButtonInner, { opacity: opacityAnimForHeaderElements, transform: [{ scale: profileScaleAnim }] }]}>
                  {familyMember?.avatarUrl ? (
                    <Image source={{ uri: familyMember.avatarUrl }} style={styles.profileImage} />
                  ) : (
                    <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']} style={styles.profileGradient}>
                      <Text style={styles.profileEmoji}>{familyMember?.avatar || '👤'}</Text>
                    </LinearGradient>
                  )}
                  <View style={styles.onlineIndicator} />
                </Animated.View>
              </TouchableOpacity>
            </View>
            <Animated.View style={[styles.statsBar, { opacity: opacityAnimForHeaderElements, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.totalTribs || 0}</Text>
                <Text style={styles.statLabel}>Tribs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.totalMembers || 0}</Text>
                <Text style={styles.statLabel}>Membres</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.tasks?.todo || 0}</Text>
                <Text style={styles.statLabel}>À faire</Text>
              </View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <MoodIndicatorContextual
          mood={mood}
          urgentTasks={priorities.filter(p => p.urgent).length} // Assurez-vous que priorities est défini
          upcomingEvents={priorities.length} // Assurez-vous que priorities est défini
        />
        <TribsHeroCard familyGoal={familyGoal} children={displayChildren} />
        <PrioritiesCarousel priorities={priorities} />
        <QuickActionsGrid actions={quickActions} />
        <FamilyActivityFeed members={displayMembers} />
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* ProfileModal (décommenter si besoin) */}
      {profileModalVisible && ( // Condition pour rendre le modal uniquement si visible
        <ProfileModal
          visible={profileModalVisible}
          onClose={() => setProfileModalVisible(false)}
          user={familyMember} // ou currentMember selon ce que vous voulez afficher/modifier
          isAuthenticated={isAuthenticated}
          onSignOut={signOut}
          familyName={familyName || familyData?.familyName || ''}
        />
      )}
    </View>
  );
}

// Styles (inchangés par rapport à votre version précédente, sauf si des ajustements mineurs sont nécessaires)
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
    // color: '#4a5568', // Sera défini par useTheme
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 5, // Pour Android
    shadowColor: '#000', // Pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    opacity: 0.5, // Rendu plus visible comme demandé précédemment
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.25)', // Rendu plus visible
    borderRadius: 999,
  },
  circle1: { width: 150, height: 150, top: -50, left: -50 },
  circle2: { width: 100, height: 100, bottom: -30, right: -30 },
  circle3: { width: 80, height: 80, top: 20, right: 50 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10, // Espace sous la status bar (pour iOS si SafeAreaView n'est pas le parent direct)
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeEmoji: { fontSize: 30, marginRight: 10 },
  greetingText: { fontSize: 18, color: 'white', opacity: 0.9, fontWeight: '500' },
  userName: { fontSize: 24, color: 'white', fontWeight: '700' },
  profileButton: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  profileButtonInner: {
    width: 46, height: 46, borderRadius: 23,
    overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
  },
  profileImage: { width: '100%', height: '100%' },
  profileGradient: {
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center',
  },
  profileEmoji: { fontSize: 22, color: 'white' },
  onlineIndicator: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#4CAF50', borderWidth: 2, borderColor: 'white',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: 'white' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 5 },
  scrollView: {
    flex: 1,
    zIndex: 1, // Pour s'assurer que le header est au-dessus si jamais
  },
  scrollContent: {
    paddingTop: 240, // IMPORTANT: Doit correspondre à la hauteur approx du header
    paddingHorizontal: 20,
    paddingBottom: 100, // Espace pour la nav bar / derniers éléments
  },
  bottomSpacer: { height: 50 },
});

// Définition de ProfileModal (gardée identique à votre version, car elle n'était pas la source du bug)
interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: any;
  isAuthenticated: boolean;
  onSignOut: () => Promise<void>;
  familyName: string;
}

function ProfileModal({ visible, onClose, user, isAuthenticated, onSignOut, familyName }: ProfileModalProps) {
  const { colors, fontSizeBase, fontFamily } = useTheme(); // Peut utiliser useTheme ici

  const handleSignOut = async () => {
    try {
      await onSignOut();
      onClose();
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // Les styles du modal peuvent rester ici ou être dans un fichier séparé
  const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: colors.overlayDark || 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    content: {
      backgroundColor: colors.card || 'white', borderRadius: 20, padding: 30, alignItems: 'center',
      marginHorizontal: 40, shadowColor: colors.shadow || '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, maxWidth: 320, width: '100%',
    },
    avatarContainer: { position: 'relative', marginBottom: 20 },
    avatar: {
      width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.card || 'white',
      shadowColor: colors.shadow || '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2,
      shadowRadius: 8, elevation: 6,
    },
    avatarFallback: {
      width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center',
      borderWidth: 3, borderColor: colors.card || 'white', shadowColor: colors.shadow || '#000',
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
    },
    avatarEmoji: { fontSize: fontSizeBase ? fontSizeBase * 2 : 32, },
    roleBadge: {
      position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12,
      backgroundColor: colors.card || 'white', justifyContent: 'center', alignItems: 'center',
      borderWidth: 2, borderColor: colors.border || '#e2e8f0',
    },
    roleBadgeText: { fontSize: fontSizeBase ? fontSizeBase * 0.75 : 12, color: colors.text },
    userName: {
      fontSize: fontSizeBase ? fontSizeBase * 1.375 : 22, fontWeight: '700', color: colors.text,
      marginBottom: 4, textAlign: 'center',
    },
    userRole: {
      fontSize: fontSizeBase ? fontSizeBase * 0.875 : 14, color: colors.textSecondary,
      marginBottom: 8, textAlign: 'center',
    },
    userEmail: {
      fontSize: fontSizeBase ? fontSizeBase * 0.75 : 12, color: colors.textTertiary,
      marginBottom: 16, textAlign: 'center',
    },
    familyInfo: { alignItems: 'center', marginBottom: 20 },
    familyLabel: { fontSize: fontSizeBase ? fontSizeBase * 0.875 : 14, color: colors.textSecondary, marginBottom: 4 },
    familyName: { fontSize: fontSizeBase || 16, fontWeight: '600', color: colors.text },
    tribsCard: {
      borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginBottom: 24, alignItems: 'center',
      shadowColor: '#FFD54F', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
      // Le LinearGradient sera appliqué sur ce View, donc pas de backgroundColor ici
    },
    tribsNumber: {
      fontSize: fontSizeBase ? fontSizeBase * 1.5 : 24, fontWeight: '700', color: colors.onPrimary || 'white',
      textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
    },
    tribsLabel: {
      fontSize: fontSizeBase ? fontSizeBase * 0.75 : 12, color: colors.onPrimary ? (colors.onPrimary + 'e6') : 'rgba(255,255,255,0.9)', // opacity 0.9
      fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
    },
    actions: { width: '100%', gap: 12 },
    actionButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.background || '#f7fafc', paddingVertical: 12, paddingHorizontal: 20,
      borderRadius: 12, borderWidth: 1, borderColor: colors.border || '#e2e8f0', gap: 8,
    },
    signOutButton: { backgroundColor: colors.dangerBackground || '#fed7d7', borderColor: colors.dangerBorder || '#feb2b2' },
    actionButtonIcon: { fontSize: fontSizeBase || 16, },
    actionButtonText: { fontSize: fontSizeBase ? fontSizeBase * 0.875 : 14, fontWeight: '600', color: colors.text },
    signOutButtonText: { fontSize: fontSizeBase ? fontSizeBase * 0.875 : 14, fontWeight: '600', color: colors.dangerText || '#c53030' },
    modeText: {
      fontSize: fontSizeBase ? fontSizeBase * 0.75 : 12, color: colors.textTertiary,
      marginTop: 16, textAlign: 'center',
    },
  });

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={modalStyles.content} activeOpacity={1} onPress={() => {}}>
          <View style={modalStyles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={modalStyles.avatar} />
            ) : (
              <LinearGradient colors={user?.color ? [user.color, user.color] : [colors.primary, colors.secondary]} style={modalStyles.avatarFallback}>
                <Text style={modalStyles.avatarEmoji}>{user?.avatar || '👤'}</Text>
              </LinearGradient>
            )}
            <View style={modalStyles.roleBadge}>
              <Text style={modalStyles.roleBadgeText}>
                {user?.role === 'admin' ? '👑' : user?.role === 'parent' ? '👤' : '⭐'}
              </Text>
            </View>
          </View>
          <Text style={modalStyles.userName}>{user?.name || 'Utilisateur'}</Text>
          <Text style={modalStyles.userRole}>
            {user?.role === 'admin' ? 'Administrateur' : user?.role === 'parent' ? 'Parent' : 'Enfant'}
          </Text>
          {user?.email && (<Text style={modalStyles.userEmail}>{user.email}</Text>)}
          <View style={modalStyles.familyInfo}>
            <Text style={modalStyles.familyLabel}>👨‍👩‍👧‍👦 Famille</Text>
            <Text style={modalStyles.familyName}>{familyName}</Text>
          </View>
          <LinearGradient colors={['#FFD54F', colors.primary || '#FF8A80']} style={modalStyles.tribsCard}>
            <Text style={modalStyles.tribsNumber}>{user?.tribs || 0}</Text>
            <Text style={modalStyles.tribsLabel}>Tribs</Text>
          </LinearGradient>
          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.actionButton} onPress={() => { onClose(); console.log('🔧 Éditer profil - TODO'); }}>
              <Text style={modalStyles.actionButtonIcon}>✏️</Text>
              <Text style={modalStyles.actionButtonText}>Éditer profil</Text>
            </TouchableOpacity>
            {isAuthenticated && (
              <TouchableOpacity style={[modalStyles.actionButton, modalStyles.signOutButton]} onPress={handleSignOut}>
                <Text style={modalStyles.actionButtonIcon}>🚪</Text>
                <Text style={modalStyles.signOutButtonText}>Se déconnecter</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={modalStyles.modeText}>
            {isAuthenticated ? '🔐 Connecté' : '🧪 Mode test'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}