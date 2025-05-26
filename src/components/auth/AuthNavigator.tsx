// src/components/auth/AuthNavigator.tsx - Navigation authentification
import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import JoinFamilyScreen from './JoinFamilyScreen';
import { useAuth } from '../../hooks/useAuth';

type AuthScreen = 'welcome' | 'login' | 'signUp' | 'joinFamily' | 'forgotPassword';

export default function AuthNavigator() {
  // 🔐 Hook d'authentification
  const { isAuthenticated, isLoading } = useAuth();
  
  // 🧭 État de navigation local
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('welcome');

  // 🔄 Si authentifié, ne pas afficher AuthNavigator (géré par App.tsx)
  if (isAuthenticated) {
    return null;
  }

  // 🔄 Loading initial
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#FF8A80', '#7986CB']}
          style={styles.loadingBackground}
        >
          <ActivityIndicator size="large" color="white" />
        </LinearGradient>
      </View>
    );
  }

  // 🧭 Navigation entre écrans d'auth
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onLoginPress={() => setCurrentScreen('login')}
            onSignUpPress={() => setCurrentScreen('signUp')}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onBackPress={() => setCurrentScreen('welcome')}
            onSignUpPress={() => setCurrentScreen('signUp')}
            onForgotPasswordPress={() => setCurrentScreen('forgotPassword')}
          />
        );

      case 'signUp':
        return (
          <LoginScreen
            onBackPress={() => setCurrentScreen('welcome')}
            onSignUpPress={() => setCurrentScreen('joinFamily')}
          />
        );

      case 'joinFamily':
        return (
          <JoinFamilyScreen
            onBackPress={() => setCurrentScreen('signUp')}
            onCreateFamilyPress={() => {
              // TODO: Implémenter création famille
              console.log('🆕 Créer nouvelle famille');
            }}
            onSkipPress={() => {
              // TODO: Gérer skip (utilisateur seul temporaire)
              console.log('⏭️ Passer étape famille');
            }}
          />
        );

      case 'forgotPassword':
        return (
          <View style={styles.comingSoon}>
            <LinearGradient
              colors={['#FF8A80', '#7986CB']}
              style={styles.comingSoonBackground}
            >
              <Text style={styles.comingSoonText}>
                🔄 Récupération mot de passe
              </Text>
              <Text style={styles.comingSoonSubtext}>
                Fonctionnalité en développement
              </Text>
              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => setCurrentScreen('login')}
              >
                <Text style={styles.backToLoginText}>← Retour connexion</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        );

      default:
        return (
          <WelcomeScreen
            onLoginPress={() => setCurrentScreen('login')}
            onSignUpPress={() => setCurrentScreen('signUp')}
          />
        );
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
  },

  loadingBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Coming Soon (pour forgot password)
  comingSoon: {
    flex: 1,
  },

  comingSoonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  comingSoonText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },

  comingSoonSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },

  backToLoginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  backToLoginText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});