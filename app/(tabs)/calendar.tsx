import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7986CB', '#FF8A80']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>📅 Calendrier Famille</Text>
        <Text style={styles.headerSubtitle}>Famille Questroy</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonIcon}>🚧</Text>
          <Text style={styles.comingSoonTitle}>Calendrier en développement</Text>
          <Text style={styles.comingSoonText}>
            Bientôt : calendrier partagé avec événements famille, rendez-vous, et synchronisation !
          </Text>
          
          <View style={styles.previewFeatures}>
            <Text style={styles.featureTitle}>Fonctionnalités prévues :</Text>
            <Text style={styles.featureItem}>📋 Événements partagés</Text>
            <Text style={styles.featureItem}>🔔 Rappels intelligents</Text>
            <Text style={styles.featureItem}>👥 Vue par membre famille</Text>
            <Text style={styles.featureItem}>🎯 Objectifs hebdomadaires</Text>
          </View>
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
  
  comingSoonCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 50,
  },
  
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  comingSoonText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  
  previewFeatures: {
    width: '100%',
  },
  
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  featureItem: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
    textAlign: 'center',
  },
});