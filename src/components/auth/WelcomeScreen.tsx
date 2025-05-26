// src/components/auth/WelcomeScreen.tsx - Écran d'accueil Tribly
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WelcomeScreenProps {
  onLoginPress: () => void;
  onSignUpPress: () => void;
}

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ onLoginPress, onSignUpPress }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF8A80', '#7986CB']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header avec logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.logoCircle}
            >
              <Text style={styles.logoEmoji}>👨‍👩‍👧‍👦</Text>
            </LinearGradient>
          </View>
          
          <Text style={styles.appName}>Tribly</Text>
          <Text style={styles.tagline}>L'organiseur familial intelligent</Text>
        </View>

        {/* Section features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureText}>Calendrier partagé</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={styles.featureText}>Tâches & Tribs</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛒</Text>
            <Text style={styles.featureText}>Liste de courses</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureText}>Assistant IA</Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onLoginPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSignUpPress}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Créer un compte</Text>
          </TouchableOpacity>

          {/* Petit texte de première utilisation */}
          <Text style={styles.firstTimeText}>
            Première fois ? Créez votre famille ou rejoignez-en une !
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for families
          </Text>
          <Text style={styles.versionText}>v0.2.2</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  background: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header section
  header: {
    alignItems: 'center',
    marginTop: 40,
  },

  logoContainer: {
    marginBottom: 20,
  },

  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  logoEmoji: {
    fontSize: 48,
  },

  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Features section
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 40,
  },

  featureItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Actions section
  actions: {
    alignItems: 'center',
    marginBottom: 20,
  },

  primaryButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8A80',
    letterSpacing: 0.5,
  },

  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },

  secondaryButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },

  firstTimeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  // Footer section
  footer: {
    alignItems: 'center',
  },

  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },

  versionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});