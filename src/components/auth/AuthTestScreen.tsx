// src/components/auth/AuthTestScreen.tsx - Écran de test temporaire
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';

export default function AuthTestScreen() {
  const { 
    signInTestMode, 
    signInWithEmail, 
    signUpWithEmail, 
    error, 
    loading,
    clearError 
  } = useAuth();
  
  const [email, setEmail] = useState('ludwig@questroy.com');
  const [password, setPassword] = useState('test123');
  const [name, setName] = useState('Ludwig');

  const handleTestSignIn = async () => {
    try {
      await signInTestMode(name);
      Alert.alert('✅ Connexion test réussie !', `Bienvenue ${name} !`);
    } catch (error) {
      Alert.alert('❌ Erreur', error.message);
    }
  };

  const handleEmailSignIn = async () => {
    try {
      await signInWithEmail(email, password);
      Alert.alert('✅ Connexion réussie !');
    } catch (error) {
      Alert.alert('❌ Erreur connexion', error.message);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      await signUpWithEmail(email, password, name);
      Alert.alert('✅ Inscription réussie !');
    } catch (error) {
      Alert.alert('❌ Erreur inscription', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF8A80', '#7986CB']}
        style={styles.background}
      >
        <View style={styles.content}>
          <Text style={styles.title}>🧪 Mode Test Auth</Text>
          <Text style={styles.subtitle}>Tester l'authentification</Text>

          {/* Mode Test (le plus simple) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mode Test</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nom d'utilisateur"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleTestSignIn}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Connexion...' : '🚀 Connexion Test'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Connexion Email */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connexion Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.7)"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe"
              placeholderTextColor="rgba(255,255,255,0.7)"
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleEmailSignIn}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                📧 Se connecter
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleEmailSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                📝 S'inscrire
              </Text>
            </TouchableOpacity>
          </View>

          {/* Erreur */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Text style={styles.errorDismiss}>Masquer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Mode test : Connexion sans Firebase Auth{'\n'}
              📧 Mode email : Utilise Firebase Auth réel
            </Text>
          </View>
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
    padding: 20,
    justifyContent: 'center',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },

  section: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },

  errorContainer: {
    backgroundColor: 'rgba(255,0,0,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
  },

  errorText: {
    color: 'white',
    flex: 1,
    fontSize: 14,
  },

  errorDismiss: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  infoContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },

  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});