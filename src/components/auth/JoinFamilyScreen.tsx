// src/components/auth/JoinFamilyScreen.tsx - Rejoindre famille avec code
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

interface JoinFamilyScreenProps {
  onBackPress: () => void;
  onCreateFamilyPress: () => void;
  onSkipPress?: () => void;
}

export default function JoinFamilyScreen({ 
  onBackPress, 
  onCreateFamilyPress,
  onSkipPress 
}: JoinFamilyScreenProps) {
  
  // 🔐 Hook d'authentification
  const { 
    joinFamilyWithCode, 
    loading, 
    error, 
    clearError,
    isAuthenticated 
  } = useAuth();

  // 🗃️ États locaux
  const [familyCode, setFamilyCode] = useState('');
  const [joining, setJoining] = useState(false);

  // 🔄 Rejoindre famille
  const handleJoinFamily = async () => {
    if (!familyCode.trim()) {
      Alert.alert('Code requis', 'Veuillez saisir le code de la famille');
      return;
    }

    try {
      setJoining(true);
      clearError();
      
      const familyData = await joinFamilyWithCode(familyCode.trim().toUpperCase());
      
      Alert.alert(
        '🎉 Famille rejointe !', 
        `Bienvenue dans la famille ! Vous êtes maintenant membre.`,
        [{ text: 'Super !', style: 'default' }]
      );
      
      // La navigation sera gérée par l'état auth dans App.tsx
      
    } catch (error) {
      console.error('❌ Erreur rejoindre famille:', error);
      Alert.alert('Erreur', error.message);
    } finally {
      setJoining(false);
    }
  };

  // 🎯 Formater le code famille automatiquement
  const handleCodeChange = (text: string) => {
    // Garder seulement lettres, chiffres et tirets
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Format automatique : XXXX-XXXX
    let formatted = cleaned;
    if (cleaned.length > 4 && !cleaned.includes('-')) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 8);
    }
    
    setFamilyCode(formatted);
  };

  const isLoading = loading || joining;
  const canJoin = familyCode.trim().length >= 4 && !isLoading;

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
            <Text style={styles.headerTitle}>Rejoindre famille</Text>
            <Text style={styles.headerSubtitle}>Entrez le code de votre famille</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.instructionsTitle}>Comment rejoindre ?</Text>
            <Text style={styles.instructionsText}>
              Demandez le code famille à un membre déjà inscrit. Il se trouve dans les réglages de l'app Tribly.
            </Text>
          </View>

          {/* Formulaire code famille */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Code famille</Text>
            
            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="XXXX-XXXX"
                placeholderTextColor="#a0aec0"
                value={familyCode}
                onChangeText={handleCodeChange}
                maxLength={9} // XXXX-XXXX = 9 caractères
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                textAlign="center"
                fontSize={20}
                fontWeight="600"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.joinButton, !canJoin && styles.disabledButton]}
              onPress={handleJoinFamily}
              disabled={!canJoin}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={canJoin ? ['#48bb78', '#38a169'] : ['#e2e8f0', '#cbd5e0']}
                style={styles.joinButtonGradient}
              >
                {joining ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={[styles.joinButtonText, !canJoin && styles.disabledText]}>
                      Rejoindre la famille
                    </Text>
                    <Text style={[styles.joinButtonIcon, !canJoin && styles.disabledText]}>
                      →
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Exemple de code */}
          <View style={styles.exampleCard}>
            <Text style={styles.exampleTitle}>💡 Exemple de code</Text>
            <View style={styles.exampleCodeContainer}>
              <Text style={styles.exampleCode}>QUESTROY-L4K8</Text>
            </View>
            <Text style={styles.exampleNote}>
              Les codes sont générés automatiquement pour chaque famille
            </Text>
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

          {/* Actions alternatives */}
          <View style={styles.alternatives}>
            <Text style={styles.alternativesTitle}>Ou alors...</Text>
            
            <TouchableOpacity
              style={styles.alternativeButton}
              onPress={onCreateFamilyPress}
              activeOpacity={0.7}
            >
              <Text style={styles.alternativeButtonIcon}>✨</Text>
              <View style={styles.alternativeButtonContent}>
                <Text style={styles.alternativeButtonTitle}>Créer une nouvelle famille</Text>
                <Text style={styles.alternativeButtonSubtitle}>
                  Vous serez l'administrateur de votre famille
                </Text>
              </View>
              <Text style={styles.alternativeButtonChevron}>›</Text>
            </TouchableOpacity>

            {onSkipPress && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={onSkipPress}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Passer cette étape</Text>
              </TouchableOpacity>
            )}
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

  // Instructions
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  instructionsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 12,
    textAlign: 'center',
  },

  instructionsText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Code Section
  section: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
  },

  codeInputContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  codeInput: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    color: '#2d3748',
    letterSpacing: 4,
  },

  joinButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#48bb78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },

  joinButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },

  joinButtonIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
  },

  // Example
  exampleCard: {
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#c6f6d5',
  },

  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38a169',
    marginBottom: 12,
    textAlign: 'center',
  },

  exampleCodeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9ae6b4',
  },

  exampleCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    letterSpacing: 2,
  },

  exampleNote: {
    fontSize: 12,
    color: '#38a169',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // States
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },

  disabledText: {
    color: '#a0aec0',
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

  // Alternatives
  alternatives: {
    marginTop: 20,
  },

  alternativesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
  },

  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  alternativeButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },

  alternativeButtonContent: {
    flex: 1,
  },

  alternativeButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },

  alternativeButtonSubtitle: {
    fontSize: 14,
    color: '#4a5568',
  },

  alternativeButtonChevron: {
    fontSize: 20,
    color: '#a0aec0',
    fontWeight: '300',
  },

  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },

  skipButtonText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
});