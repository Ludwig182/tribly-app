// src/components/auth/AuthTestScreen.tsx - FIX CLAVIER
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,  // ← AJOUTÉ
  Platform,              // ← AJOUTÉ
  ScrollView            // ← AJOUTÉ
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';

export default function AuthTestScreen() {
  const { 
    signInTestMode, 
    signInWithEmail, 
    signUpWithEmail,
    signInWithGoogle,
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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      Alert.alert('✅ Connexion Google réussie !');
    } catch (error) {
      Alert.alert('❌ Erreur Google', error.message);
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
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <LinearGradient
          colors={['#FF8A80', '#7986CB']}
          style={styles.background}
        >
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
            automaticallyAdjustContentInsets={false}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>🧪 Mode Test Auth</Text>
                <Text style={styles.subtitle}>Tester l'authentification</Text>
              </View>

              {/* Connexion Google - EN PREMIER */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Connexion rapide</Text>
                <TouchableOpacity
                  style={[styles.googleButton, loading && styles.disabledButton]}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f8f9fa']}
                    style={styles.googleButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#4285F4" />
                    ) : (
                      <>
                        <Text style={styles.googleIcon}>G</Text>
                        <Text style={styles.googleButtonText}>Continuer avec Google</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Séparateur */}
              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>ou</Text>
                <View style={styles.separatorLine} />
              </View>

              {/* Mode Test */}
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
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mot de passe"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
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
                  🟦 Google : Auth Firebase réelle{'\n'}
                  💡 Test : Sans Firebase{'\n'}
                  📧 Email : Firebase Auth classique
                </Text>
              </View>

              {/* Espace pour le clavier */}
              <View style={styles.keyboardSpacer} />
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // 🆕 NOUVELLES SECTIONS pour keyboard
  keyboardView: {
    flex: 1,
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },

  background: {
    flex: 1,
    minHeight: '100%',
  },

  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  // 🆕 Espace pour le clavier
  keyboardSpacer: {
    height: 50,
  },

  // 🆕 Header section
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
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
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },

  // Google Button
  googleButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },

  googleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 12,
    fontFamily: 'System',
  },

  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },

  // Séparateur
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  separatorText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginHorizontal: 16,
    fontWeight: '500',
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

  disabledButton: {
    opacity: 0.6,
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
    padding: 12,
    marginTop: 15,
  },

  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});