// src/components/auth/LoginScreen.tsx - Écran de connexion
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';

interface LoginScreenProps {
  onBackPress: () => void;
  onSignUpPress: () => void;
  onForgotPasswordPress?: () => void;
}

export default function LoginScreen({ 
  onBackPress, 
  onSignUpPress, 
  onForgotPasswordPress 
}: LoginScreenProps) {
  
  // 🔐 Hook d'authentification
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    loading, 
    error, 
    clearError 
  } = useAuth();

  // 🗃️ États locaux
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // 🔑 Connexion Google
  const handleGoogleSignIn = async () => {
    try {
      clearError();
      await signInWithGoogle();
      // La navigation sera gérée par l'état auth dans App.tsx
    } catch (error) {
      console.error('❌ Erreur Google Sign-In:', error);
      Alert.alert('Erreur de connexion', error.message);
    }
  };

  // 📧 Connexion Email
  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir votre email et mot de passe');
      return;
    }

    try {
      setEmailLoading(true);
      clearError();
      
      await signInWithEmail(email.trim(), password);
      // La navigation sera gérée par l'état auth dans App.tsx
      
    } catch (error) {
      console.error('❌ Erreur Email Sign-In:', error);
      Alert.alert('Erreur de connexion', error.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const isLoading = loading || emailLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header avec retour */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Connexion</Text>
            <Text style={styles.headerSubtitle}>Accédez à votre famille</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Section connexion Google */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connexion rapide</Text>
            
            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
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

          {/* Section connexion Email */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.emailToggle}
              onPress={() => setShowEmailForm(!showEmailForm)}
              activeOpacity={0.7}
            >
              <Text style={styles.emailToggleText}>
                {showEmailForm ? '📧 Masquer connexion email' : '📧 Connexion avec email'}
              </Text>
              <Text style={[styles.chevron, showEmailForm && styles.chevronUp]}>
                ›
              </Text>
            </TouchableOpacity>

            {showEmailForm && (
              <View style={styles.emailForm}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email"
                  placeholderTextColor="#a0aec0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />

                <TextInput
                  style={styles.textInput}
                  placeholder="Mot de passe"
                  placeholderTextColor="#a0aec0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />

                <TouchableOpacity
                  style={[styles.emailButton, isLoading && styles.disabledButton]}
                  onPress={handleEmailSignIn}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF8A80', '#7986CB']}
                    style={styles.emailButtonGradient}
                  >
                    {emailLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.emailButtonText}>Se connecter</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {onForgotPasswordPress && (
                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={onForgotPasswordPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Message d'erreur */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Text style={styles.errorDismiss}>Masquer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lien vers inscription */}
          <View style={styles.signUpPrompt}>
            <Text style={styles.signUpPromptText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={onSignUpPress} activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f7fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  backIcon: {
    fontSize: 20,
    color: '#4a5568',
    fontWeight: '600',
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 2,
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#4a5568',
  },

  // Content
  content: {
    flex: 1,
    padding: 20,
  },

  section: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
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
  },

  googleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 12,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
  },

  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },

  // Separator
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },

  separatorText: {
    fontSize: 14,
    color: '#718096',
    marginHorizontal: 16,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
  },

  // Email Form
  emailToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },

  emailToggleText: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '500',
  },

  chevron: {
    fontSize: 18,
    color: '#718096',
    transform: [{ rotate: '90deg' }],
  },

  chevronUp: {
    transform: [{ rotate: '270deg' }],
  },

  emailForm: {
    gap: 16,
  },

  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2d3748',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  emailButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF8A80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  emailButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emailButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },

  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  forgotPasswordText: {
    fontSize: 14,
    color: '#7986CB',
    fontWeight: '500',
  },

  // States
  disabledButton: {
    opacity: 0.6,
  },

  // Error
  errorContainer: {
    backgroundColor: '#fed7d7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#feb2b2',
  },

  errorText: {
    fontSize: 14,
    color: '#c53030',
    flex: 1,
  },

  errorDismiss: {
    fontSize: 14,
    color: '#c53030',
    fontWeight: '600',
  },

  // Sign Up Prompt
  signUpPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },

  signUpPromptText: {
    fontSize: 14,
    color: '#4a5568',
  },

  signUpLink: {
    fontSize: 14,
    color: '#7986CB',
    fontWeight: '600',
  },
});