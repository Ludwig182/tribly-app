// src/components/family/FamilyScreen.tsx - Version avec édition profil
import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFamily } from '../../hooks/useFamily';
import FamilyStats from './FamilyStats';
import FamilyMemberCard from './FamilyMemberCard';
import FamilySettings from './FamilySettings';
import EditProfileModal from './EditProfileModal';

const FamilyScreen = () => {
  // 🎯 Hook famille pour les données Firebase
  const { 
    familyData, 
    currentMember,
    stats,
    loading 
  } = useFamily();

  // 🗃️ État pour le modal d'édition
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  // 🎯 Fonctions pour gérer l'édition
  const openEditModal = (member) => {
    setSelectedMember(member);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedMember(null);
  };

  const handleProfileUpdated = (newAvatarUrl) => {
    // Le hook useFamily se mettra automatiquement à jour via Firebase
    console.log('✅ Profil mis à jour, nouvelle URL:', newAvatarUrl);
  };

  // Utiliser les membres depuis Firebase
  const familyMembers = familyData?.members || [];
  const onlineMembers = familyMembers.filter(member => member.status === 'online' || true).length; // Temporaire: tous en ligne

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7986CB', '#FF8A80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.familyIcon}>
            <Text style={styles.familyIconText}>👥</Text>
          </View>
          <View>
            <Text style={styles.familyName}>Famille {familyData?.name || 'Questroy'}</Text>
            <Text style={styles.membersCount}>{onlineMembers}/{familyMembers.length} membres connectés</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats famille */}
        <FamilyStats 
          stats={{
            totalTribs: familyMembers.reduce((sum, member) => sum + (member.tribs || 0), 0),
            membersOnline: onlineMembers,
            totalMembers: familyMembers.length
          }} 
        />

        {/* Membres de la famille - Données Firebase avec boutons d'édition */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Membres de la famille</Text>
          {familyMembers.map((member) => (
            <FamilyMemberCard 
              key={member.id}
              member={{
                ...member,
                status: 'online', // Temporaire - tous en ligne
                tasksCompleted: Math.floor(Math.random() * 10), // Temporaire
                tribsEarned: member.tribs || 0
              }}
              onEditPress={() => openEditModal(member)}
              showEditButton={true} // Nouvelle prop pour afficher le bouton
            />
          ))}
        </View>

        {/* Settings */}
        <FamilySettings />
      </ScrollView>

      {/* Modal d'édition profil */}
      <EditProfileModal
        visible={editModalVisible}
        member={selectedMember}
        familyId={familyData?.id || 'famille-questroy-test'}
        onClose={closeEditModal}
        onSuccess={handleProfileUpdated}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  familyIconText: {
    fontSize: 24,
  },
  familyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  membersCount: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  membersSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 15,
  },
});

export default FamilyScreen;