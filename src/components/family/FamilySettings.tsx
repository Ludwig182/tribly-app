// src/components/family/FamilySettings.tsx - Version corrigée
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FamilySettingsProps {
  settings?: any; // Optionnel pour éviter les erreurs
}

export default function FamilySettings({ settings }: FamilySettingsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚙️ Réglages famille</Text>
      
      {/* Système Tribs */}
      <TouchableOpacity style={styles.settingCard}>
        <View style={styles.settingIcon}>
          <Text style={styles.iconText}>🏆</Text>
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Système Tribs</Text>
          <Text style={styles.settingSubtitle}>Configurer récompenses et valeurs</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      {/* Notifications */}
      <TouchableOpacity style={styles.settingCard}>
        <View style={styles.settingIcon}>
          <Text style={styles.iconText}>🔔</Text>
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Notifications</Text>
          <Text style={styles.settingSubtitle}>Gérer les alertes famille</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      {/* Premium */}
      <TouchableOpacity style={[styles.settingCard, styles.premiumCard]}>
        <View style={styles.settingIcon}>
          <Text style={styles.iconText}>⭐</Text>
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Premium</Text>
          <Text style={styles.settingSubtitle}>Assistant IA et fonctions avancées</Text>
        </View>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>€4.99/mois</Text>
        </View>
      </TouchableOpacity>

      {/* Inviter des membres */}
      <TouchableOpacity style={styles.settingCard}>
        <View style={styles.settingIcon}>
          <Text style={styles.iconText}>👥</Text>
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Inviter des membres</Text>
          <Text style={styles.settingSubtitle}>Ajouter famille ou amis</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 100, // Espace pour la navigation
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 15,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  premiumCard: {
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: '#FFFEF7',
  },
  settingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#CCC',
    fontWeight: '300',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});