import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function FamilyScreen() {
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
        {/* Stats famille */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalTribs}</Text>
            <Text style={styles.statLabel}>Tribs total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Membres</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{onlineMembers}</Text>
            <Text style={styles.statLabel}>En ligne</Text>
          </View>
        </View>

        {/* Membres de la famille */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Membres de la famille</Text>
          {familyMembers.map((member, index) => (
            <View key={index} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.memberLeft}>
                  <LinearGradient
                    colors={member.color}
                    style={styles.memberAvatar}
                  >
                    <Text style={styles.memberAvatarText}>{member.avatar}</Text>
                    <View style={[
                      styles.statusDot, 
                      member.status === 'online' ? styles.statusOnline : styles.statusOffline
                    ]} />
                  </LinearGradient>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                    <Text style={styles.memberLastSeen}>
                      {member.status === 'online' ? '🟢 En ligne' : `⚫ ${member.lastSeen}`}
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
          ))}
        </View>

        {/* Réglages famille */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Réglages famille</Text>
          
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <LinearGradient
                colors={['#FF8A80', '#7986CB']}
                style={styles.settingIcon}
              >
                <Text style={styles.settingEmoji}>🏆</Text>
              </LinearGradient>
              <View>
                <Text style={styles.settingTitle}>Système Tribs</Text>
                <Text style={styles.settingDesc}>Configurer récompenses et valeurs</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <LinearGradient
                colors={['#48bb78', '#38a169']}
                style={styles.settingIcon}
              >
                <Text style={styles.settingEmoji}>🔔</Text>
              </LinearGradient>
              <View>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDesc}>Gérer les alertes famille</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <LinearGradient
                colors={['#FFCC80', '#A29BFE']}
                style={styles.settingIcon}
              >
                <Text style={styles.settingEmoji}>👥</Text>
              </LinearGradient>
              <View>
                <Text style={styles.settingTitle}>Inviter membres</Text>
                <Text style={styles.settingDesc}>Ajouter grands-parents, baby-sitter...</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.settingIcon}
              >
                <Text style={styles.settingEmoji}>⭐</Text>
              </LinearGradient>
              <View>
                <Text style={styles.settingTitle}>Premium</Text>
                <Text style={styles.settingDesc}>IA + Fonctionnalités avancées</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

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
  
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7986CB',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
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
  
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  settingEmoji: {
    fontSize: 18,
  },
  
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  
  settingDesc: {
    fontSize: 12,
    color: '#4a5568',
  },
  
  settingArrow: {
    fontSize: 20,
    color: '#cbd5e0',
    fontWeight: '300',
  },
  
  bottomSpacer: {
    height: 100,
  },
});