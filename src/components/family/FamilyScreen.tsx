// src/components/family/FamilyScreen.tsx - Version corrigée pour header "full screen"
import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFamily } from '../../hooks/useFamily';
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

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  if (loading && !familyData) {
    return (
      // Garder SafeAreaView ici pour l'écran de chargement est OK,
      // ou un View avec un fond et un ActivityIndicator centré.
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Chargement de la famille...</Text>
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
    // ÉTAPE 1: Remplacer la SafeAreaView globale par un View simple.
    // La gestion de la safe area pour le contenu se fera plus bas.
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      {/* Le View headerContainer n'est pas strictement nécessaire si le header est dans le flux
          et ne nécessite pas de styles supplémentaires comme une ombre globale. */}
      <LinearGradient
        colors={['#7986CB', '#FF8A80']}
        style={styles.headerGradient} // Applique le paddingTop pour la status bar Android et les arrondis
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerPattern}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        {/* ÉTAPE 2: SafeAreaView INTERNE pour le contenu du header */}
        {/* Cette SafeAreaView s'assure que le contenu est visible sous la barre d'état/encoche sur iOS. */}
        {/* Sur Android, avec paddingTop:StatusBar.currentHeight sur headerGradient, elle n'ajoutera pas de padding en haut. */}
        <SafeAreaView style={styles.headerSafeAreaInternal}>
          <View style={styles.headerActualContent}>
            <View style={styles.familyIcon}>
              <Text style={styles.familyIconText}>👥</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.familyName} numberOfLines={1} ellipsizeMode="tail">
                Famille {familyData?.familyName || familyData?.name || 'Questroy'}
              </Text>
              <Text style={styles.membersCount}>
                {onlineMembers}/{familyMembers.length} membres connectés
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
      {/* Fin du Header */}

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {/* Le contenu de la ScrollView commencera naturellement après le header.
            Pas besoin de paddingTop spécial ici si le header n'est pas en position: 'absolute'. */}
        <FamilyStats stats={calculatedStats} />
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Membres de la famille</Text>
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
        <FamilySettings />
        {/* Ajout d'un espace en bas pour que le dernier élément ne soit pas collé au bord si pas de TabBar */}
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
    backgroundColor: '#f8f9fa',
  },
  // headerContainer n'est plus nécessaire si LinearGradient est l'élément direct du header.
  // Si vous le gardez, il ne doit pas avoir de style qui interfère.
  // headerContainer: {},
  headerGradient: {
    // ÉTAPE 3: Ajuster le paddingTop pour que le fond aille jusqu'en haut sur iOS
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
    // Ce style est appliqué à la SafeAreaView interne.
    // Par défaut, elle appliquera les paddings nécessaires.
    // On peut lui donner flex: 0 pour qu'elle ne prenne que la hauteur de son contenu si besoin,
    // mais généralement ce n'est pas nécessaire pour cet usage.
  },
  headerActualContent: {
    flexDirection: 'row',
    alignItems: 'center',
    // Le paddingTop est maintenant géré par la SafeAreaView interne sur iOS,
    // et par le paddingTop du headerGradient sur Android.
  },
  familyIcon: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
  },
  familyIconText: { fontSize: 20, },
  headerTextContainer: { flex: 1, },
  familyName: {
    fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 2,
  },
  membersCount: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', },
  contentScroll: { flex: 1, },
  membersSection: { marginTop: 20, paddingHorizontal: 20, },
  sectionTitle: {
    fontSize: 18, fontWeight: '600', color: '#37474F', marginBottom: 15,
  },
});

export default FamilyScreen;