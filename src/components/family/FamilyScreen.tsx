// src/components/family/FamilyScreen.tsx - Version avec couleurs du thème pour le header
import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, Platform, StatusBar, ActivityIndicator } from 'react-native'; // Ajout de ActivityIndicator
import { LinearGradient } from 'expo-linear-gradient';
import { useFamily } from '../../hooks/useFamily';
import { useTheme } from '../../theme/ThemeProvider'; // ÉTAPE 1: Importer useTheme
import FamilyStats from './FamilyStats';
import FamilyMemberCard from './FamilyMemberCard';
import FamilySettings from './FamilySettings';
import EditProfileModal from './EditProfileModal';

const FamilyScreen = () => {
  const {
    familyData,
    currentMember,
    loading
  } = useFamily();
  const { colors } = useTheme(); // ÉTAPE 2: Utiliser useTheme pour obtenir les couleurs

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  if (loading && !familyData) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Chargement de la famille...</Text>
      </SafeAreaView>
    );
  }

  const familyMembers = familyData?.members || [];
  const onlineMembers = familyMembers.filter(member => member.status === 'online' || true).length;
  const calculatedStats = {
    totalTribs: familyMembers.reduce((sum, member) => sum + (member.tribs || 0), 0),
    membersOnline: onlineMembers,
    totalMembers: familyMembers.length
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setEditModalVisible(true);
  };
  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedMember(null);
  };
  const handleProfileUpdated = () => {
    console.log('✅ Profil mis à jour avec succès (FamilyScreen)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        // ÉTAPE 3: Utiliser les couleurs du thème pour le dégradé
        colors={[colors.primary, colors.secondary]} // Assurez-vous que c'est l'ordre désiré
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }} // ou les valeurs de start/end de HomeScreen si différentes
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerPattern}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        <SafeAreaView style={styles.headerSafeAreaInternal}>
          <View style={styles.headerActualContent}>
            <View style={styles.familyIcon}>
              <Text style={styles.familyIconText}>👥</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.familyName, { color: colors.onPrimary || 'white' }]}>
                Famille {familyData?.familyName || familyData?.name || 'Questroy'}
              </Text>
              <Text style={[styles.membersCount, { color: (colors.onPrimary ? colors.onPrimary + 'e6' : 'rgba(255,255,255,0.9)') }]}> {/* Ajout d'opacité */}
                {onlineMembers}/{familyMembers.length} membres connectés
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <FamilyStats stats={calculatedStats} />
        <View style={styles.membersSection}>
          {/* Appliquer la couleur du thème au titre de section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Membres de la famille</Text>
          {familyMembers.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={{
                ...member,
                status: 'online',
                tasksCompleted: Math.floor(Math.random() * 10),
                tribsEarned: member.tribs || 0
              }}
              onEditPress={() => openEditModal(member)}
              showEditButton={true}
            />
          ))}
        </View>
        {/* FamilySettings pourrait aussi utiliser les couleurs du thème en interne */}
        <FamilySettings />
        <View style={{ height: 30 }} />
      </ScrollView>

      {editModalVisible && (
          <EditProfileModal
            visible={editModalVisible}
            member={selectedMember}
            familyId={familyData?.id || 'famille-questroy-test'}
            currentUserId={currentMember?.id || 'user-001'}
            familyData={familyData}
            onClose={closeEditModal}
            onSuccess={handleProfileUpdated}
          />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f8f9fa', // Géré par le thème via style inline
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3,
  },
  circle: {
    position: 'absolute', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999,
  },
  circle1: { width: 120, height: 120, top: -40, left: -30 },
  circle2: { width: 80, height: 80, bottom: -20, right: -20 },
  circle3: { width: 60, height: 60, top: 10, right: 40, opacity: 0.2 },
  headerSafeAreaInternal: {
    // Aucun style spécifique nécessaire ici en général
  },
  headerActualContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyIcon: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Pourrait être dynamisé avec le thème si désiré
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
  },
  familyIconText: { fontSize: 20, }, // La couleur du texte ici sera par défaut (noir/blanc selon le thème global)
                                     // Si vous voulez forcer blanc, ajoutez color: 'white'
  headerTextContainer: { flex: 1, },
  familyName: {
    fontSize: 22, fontWeight: 'bold',
    // color: 'white', // Géré par le thème via style inline
    marginBottom: 2,
  },
  membersCount: {
    fontSize: 14,
    // color: 'rgba(255, 255, 255, 0.9)', // Géré par le thème via style inline
  },
  contentScroll: { flex: 1, },
  membersSection: { marginTop: 20, paddingHorizontal: 20, },
  sectionTitle: {
    fontSize: 18, fontWeight: '600',
    // color: '#37474F', // Géré par le thème via style inline
    marginBottom: 15,
  },
});

export default FamilyScreen;