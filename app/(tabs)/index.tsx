import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  // Données famille Ludwig
  const familyData = {
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
          {/* Section Tribs des enfants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Tableau des Tribs</Text>
            <View style={styles.pointsOverview}>
              {familyData.children.map((child, index) => (
                <View key={index} style={styles.childCard}>
                  <View style={styles.childHeader}>
                    <LinearGradient
                      colors={child.color}
                      style={styles.childAvatar}
                    >
                      <Text style={styles.childInitial}>{child.name[0]}</Text>
                    </LinearGradient>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.name} ({child.age} ans)</Text>
                      <Text style={styles.childStatus}>{child.status}</Text>
                    </View>
                    <LinearGradient
                      colors={child.color}
                      style={styles.pointsBadge}
                    >
                      <Text style={styles.pointsText}>{child.tribs} Tribs</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={child.color}
                      style={[styles.progressFill, { width: `${(child.tribs / child.maxTribs) * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.nextReward}>{child.nextReward}</Text>
                </View>
              ))}

              {/* Objectif Famille */}
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.familyGoal}
              >
                <View style={styles.familyGoalHeader}>
                  <Text style={styles.goalTitle}>🎯 Objectif Famille</Text>
                  <Text style={styles.goalTotal}>{familyData.familyGoal.current}/{familyData.familyGoal.target} Tribs</Text>
                </View>
                <View style={styles.familyProgressBar}>
                  <LinearGradient
                    colors={['#48bb78', '#38a169']}
                    style={[styles.familyProgressFill, { 
                      width: `${(familyData.familyGoal.current / familyData.familyGoal.target) * 100}%` 
                    }]}
                  />
                </View>
                <Text style={styles.familyReward}>
                  {familyData.familyGoal.reward} dans {familyData.familyGoal.remaining} Tribs !
                </Text>
                <View style={styles.familyContributions}>
                  <Text style={styles.contrib}>Clémentine: 57%</Text>
                  <Text style={styles.contrib}>Jacob: 43%</Text>
                </View>
              </LinearGradient>

              {/* Actions Tribs - Version compacte */}
              <View style={styles.tribsActions}>
                <TouchableOpacity style={styles.compactBtn}>
                  <Text style={styles.compactBtnIcon}>⭐</Text>
                  <Text style={styles.compactBtnText}>Bonus</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.compactBtn}>
                  <Text style={styles.compactBtnIcon}>📊</Text>
                  <Text style={styles.compactBtnText}>Stats</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Mes priorités aujourd'hui */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Mes priorités aujourd'hui</Text>
            {familyData.priorities.map((priority, index) => (
              <View key={index} style={[styles.eventCard, priority.urgent && styles.eventCardUrgent]}>
                <Text style={styles.eventTime}>{priority.time} - {priority.urgent ? 'Dans 2h' : 'Ce soir'}</Text>
                <Text style={styles.eventTitle}>{priority.title}</Text>
                <Text style={styles.eventDetails}>{priority.details}</Text>
              </View>
            ))}
          </View>

          {/* Famille en action */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Famille en action</Text>
            {familyData.familyActivity.map((activity, index) => (
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
                <View style={styles.memberContainer}>
                  <LinearGradient colors={['#FF8A80', '#7986CB']} style={styles.memberAvatar}>
                    <Text style={styles.memberText}>R</Text>
                  </LinearGradient>
                  <View style={[styles.statusIndicator, styles.online]} />
                </View>
                <View style={styles.memberContainer}>
                  <LinearGradient colors={['#48bb78', '#38a169']} style={styles.memberAvatar}>
                    <Text style={styles.memberText}>L</Text>
                  </LinearGradient>
                  <View style={[styles.statusIndicator, styles.offline]} />
                </View>
                <View style={styles.memberContainer}>
                  <LinearGradient colors={['#FFCC80', '#A29BFE']} style={styles.memberAvatar}>
                    <Text style={styles.memberText}>C</Text>
                  </LinearGradient>
                  <View style={[styles.statusIndicator, styles.online]} />
                </View>
                <View style={styles.memberContainer}>
                  <LinearGradient colors={['#FF8A80', '#FFCC80']} style={styles.memberAvatar}>
                    <Text style={styles.memberText}>J</Text>
                  </LinearGradient>
                  <View style={[styles.statusIndicator, styles.online]} />
                </View>
              </View>
            </View>
          </View>

          {/* Suggestion IA Premium */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.aiSuggestion}
          >
            <View style={styles.aiHeader}>
              <Text style={styles.aiIcon}>🤖</Text>
              <Text style={styles.aiTitle}>IA suggère</Text>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            </View>
            <Text style={styles.aiText}>
              Jacob peut aider Clémentine avec la vaisselle = +30 Tribs famille. Plus que 55 Tribs pour le parc !
            </Text>
            <TouchableOpacity style={styles.aiAction}>
              <Text style={styles.aiActionText}>Suggérer à Jacob</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Actions rapides */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Actions rapides</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction}>
                <LinearGradient colors={['#FF8A80', '#7986CB']} style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>📅</Text>
                </LinearGradient>
                <Text style={styles.actionTitle}>Calendrier</Text>
                <Text style={styles.actionSubtitle}>4 événements</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction}>
                <LinearGradient colors={['#48bb78', '#38a169']} style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>✅</Text>
                </LinearGradient>
                <Text style={styles.actionTitle}>Tâches</Text>
                <Text style={styles.actionSubtitle}>3 à faire</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction}>
                <LinearGradient colors={['#FFCC80', '#A29BFE']} style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>🛒</Text>
                </LinearGradient>
                <Text style={styles.actionTitle}>Courses</Text>
                <Text style={styles.actionSubtitle}>8 articles</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction}>
                <LinearGradient colors={['#7986CB', '#FF8A80']} style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>👨‍👩‍👧‍👦</Text>
                </LinearGradient>
                <Text style={styles.actionTitle}>Famille</Text>
                <Text style={styles.actionSubtitle}>4 membres</Text>
              </TouchableOpacity>
            </View>
          </View>

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
  
  section: {
    marginBottom: 25,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 15,
  },
  
  pointsOverview: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  childCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  childAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  childInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  
  childInfo: {
    flex: 1,
  },
  
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  
  childStatus: {
    fontSize: 12,
    color: '#4a5568',
  },
  
  pointsBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  
  progressBar: {
    backgroundColor: '#e2e8f0',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  nextReward: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  
  familyGoal: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 15,
  },
  
  familyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  
  goalTotal: {
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: 'white',
  },
  
  familyProgressBar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  
  familyProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  familyReward: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.95,
    textAlign: 'center',
    color: 'white',
  },
  
  familyContributions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  
  contrib: {
    fontSize: 11,
    opacity: 0.8,
    color: 'white',
  },
  
  tribsActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  compactBtnIcon: {
    fontSize: 14,
  },
  
  compactBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
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
  
  eventCardUrgent: {
    borderLeftColor: '#F44336',
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
  
  aiSuggestion: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    position: 'relative',
    overflow: 'hidden',
  },
  
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  
  aiIcon: {
    fontSize: 20,
  },
  
  aiTitle: {
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  
  premiumText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  
  aiText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.95,
    color: 'white',
  },
  
  aiAction: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  
  aiActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  quickAction: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  actionEmoji: {
    fontSize: 24,
  },
  
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  
  actionSubtitle: {
    fontSize: 12,
    color: '#718096',
  },
  
  bottomSpacer: {
    height: 100,
  },
});