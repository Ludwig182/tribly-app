// src/components/family/EditProfileModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { storageService } from '../../services/storageService';
import { useFamily } from '../../hooks/useFamily';

interface EditProfileModalProps {
  visible: boolean;
  member: {
    id: string;
    name: string;
    avatar: string;
    avatarUrl?: string;
    role: string;
    age?: number;
    color: string;
  } | null;
  familyId: string;
  onClose: () => void;
  onSuccess: (newAvatarUrl: string) => void;
}

export default function EditProfileModal({
  visible,
  member,
  familyId,
  onClose,
  onSuccess
}: EditProfileModalProps) {
  // 🗃️ États locaux
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState<{
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  } | null>(null);
  const [newName, setNewName] = useState('');

  // 🎯 Hook famille pour actions
  const { familyData } = useFamily();

  // 🔄 Reset modal quand ouvert
  React.useEffect(() => {
    if (visible && member) {
      setSelectedImage(member.avatarUrl || null);
      setNewName(member.name);
      setUploadProgress(0);
      setOptimizing(false);
      setOptimizationStats(null);
    }
  }, [visible, member]);

  if (!member) return null;

  // 📸 Demander permissions et ouvrir galerie
  const pickImage = async () => {
    try {
      // Vérifier/demander permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          '📱 Permission requise',
          'Tribly a besoin d\'accéder à vos photos pour changer votre avatar.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Paramètres', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
          ]
        );
        return;
      }

      // Ouvrir sélecteur d'image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Crop natif
        aspect: [1, 1], // Format carré pour avatar
        quality: 0.8, // Compression automatique
        allowsMultipleSelection: false
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Valider le format
        if (!storageService.validateImageFormat(imageUri)) {
          Alert.alert('❌ Format non supporté', 'Veuillez choisir une image JPG, PNG ou WebP.');
          return;
        }

        setSelectedImage(imageUri);
      }

    } catch (error) {
      console.error('❌ Erreur sélection image:', error);
      Alert.alert('❌ Erreur', 'Impossible d\'accéder à la galerie photos.');
    }
  };

  // 📷 Prendre photo avec caméra
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          '📷 Permission requise',
          'Tribly a besoin d\'accéder à votre caméra pour prendre une photo.',
        );
        return;
      }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }

    } catch (error) {
      console.error('❌ Erreur prise photo:', error);
      Alert.alert('❌ Erreur', 'Impossible d\'accéder à la caméra.');
    }
  };

  // 🗑️ Supprimer avatar actuel
  const removeAvatar = () => {
    Alert.alert(
      '🗑️ Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => setSelectedImage(null)
        }
      ]
    );
  };

  // 💾 Sauvegarder les changements
  const saveChanges = async () => {
    if (uploading || optimizing) return;

    try {
      setUploading(true);
      let newAvatarUrl = member.avatarUrl;

      // 1. Gérer l'avatar si changé
      if (selectedImage !== member.avatarUrl) {
        if (selectedImage) {
          // Optimiser l'image avant upload
          setOptimizing(true);
          const { imageOptimizationService } = await import('../../services/imageOptimizationService');
          
          const optimizedResult = await imageOptimizationService.optimizeAvatar(selectedImage);
          
          setOptimizing(false);
          
          if (!optimizedResult.error) {
            setOptimizationStats({
              originalSize: optimizedResult.originalSize,
              optimizedSize: optimizedResult.fileSize,
              compressionRatio: optimizedResult.compressionRatio
            });
          }
          
          // Upload de l'image (optimisée ou originale)
          const imageToUpload = optimizedResult.error ? selectedImage : optimizedResult.uri;
          newAvatarUrl = await storageService.uploadAvatar(
            familyId,
            member.id,
            imageToUpload,
            (progress) => setUploadProgress(progress)
          );
        } else {
          // Supprimer avatar existant
          await storageService.deleteAvatar(familyId, member.id);
          newAvatarUrl = null;
        }
      }

      // 2. Mettre à jour le nom si changé (optionnel pour cette version)
      // TODO: Ajouter familyService.updateMemberName() si besoin

      // 3. Callback de succès
      onSuccess(newAvatarUrl || '');
      
      const statsMessage = optimizationStats 
        ? `\n📊 Taille réduite de ${optimizationStats.compressionRatio}%`
        : '';
      
      Alert.alert(
        '✅ Profil mis à jour !',
        (selectedImage ? 'Votre nouvelle photo est maintenant visible.' : 'Votre photo a été supprimée.') + statsMessage,
        [{ text: 'Super !', onPress: onClose }]
      );

    } catch (error) {
      console.error('❌ Erreur sauvegarde profil:', error);
      Alert.alert('❌ Erreur', error.message || 'Impossible de sauvegarder les changements.');
    } finally {
      setUploading(false);
      setOptimizing(false);
      setUploadProgress(0);
      setOptimizationStats(null);
    }
  };

  // 🎨 Choix d'image : galerie ou caméra
  const showImageOptions = () => {
    Alert.alert(
      '📸 Choisir une photo',
      'Comment souhaitez-vous ajouter votre photo de profil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: '📱 Galerie', onPress: pickImage },
        { text: '📷 Caméra', onPress: takePhoto }
      ]
    );
  };

  const hasChanges = selectedImage !== member.avatarUrl || newName !== member.name;
  const canSave = hasChanges && !uploading && !optimizing;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={onClose}
              disabled={uploading || optimizing}
            >
              <Text style={[styles.modalCloseText, (uploading || optimizing) && styles.disabledText]}>
                Annuler
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>✏️ Modifier profil</Text>
            
            <TouchableOpacity 
              style={[styles.modalSaveBtn, (!canSave) && styles.modalSaveBtnDisabled]}
              onPress={saveChanges}
              disabled={!canSave}
            >
              {uploading || optimizing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[styles.modalSaveText, (!canSave) && styles.modalSaveTextDisabled]}>
                  Sauver
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Section Avatar */}
            <View style={styles.avatarSection}>
              <Text style={styles.sectionTitle}>📷 Photo de profil</Text>
              
              <View style={styles.avatarContainer}>
                {/* Prévisualisation avatar */}
                <View style={styles.avatarPreview}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.avatarImage} />
                  ) : (
                    <LinearGradient
                      colors={[member.color, member.color + '80']}
                      style={styles.avatarFallback}
                    >
                      <Text style={styles.avatarEmoji}>{member.avatar}</Text>
                    </LinearGradient>
                  )}
                  
                  {/* Badge du rôle */}
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                      {member.role === 'parent' ? '👑' : '⭐'}
                    </Text>
                  </View>
                </View>

                {/* Actions avatar */}
                <View style={styles.avatarActions}>
                  <TouchableOpacity 
                    style={styles.avatarActionBtn}
                    onPress={showImageOptions}
                    disabled={uploading || optimizing}
                  >
                    <Text style={styles.avatarActionIcon}>📸</Text>
                    <Text style={styles.avatarActionText}>
                      {selectedImage ? 'Changer' : 'Ajouter'}
                    </Text>
                  </TouchableOpacity>
                  
                  {selectedImage && (
                    <TouchableOpacity 
                      style={[styles.avatarActionBtn, styles.removeBtn]}
                      onPress={removeAvatar}
                      disabled={uploading || optimizing}
                    >
                      <Text style={styles.avatarActionIcon}>🗑️</Text>
                      <Text style={styles.avatarActionText}>Supprimer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Section Info membre */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>👤 Informations</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nom :</Text>
                  <Text style={styles.infoValue}>{member.name}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rôle :</Text>
                  <Text style={styles.infoValue}>
                    {member.role === 'parent' ? 'Parent' : 'Enfant'} 
                    {member.age && ` (${member.age} ans)`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Barre de progression upload */}
            {uploading && (
              <View style={styles.progressSection}>
                <Text style={styles.progressText}>
                  Upload en cours... {Math.round(uploadProgress)}%
                </Text>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[member.color, member.color + '80']}
                    style={[styles.progressFill, { width: `${uploadProgress}%` }]}
                  />
                </View>
              </View>
            )}

            {/* Barre d'optimisation */}
            {optimizing && (
              <View style={styles.progressSection}>
                <Text style={styles.progressText}>
                  🔄 Optimisation de l'image en cours...
                </Text>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={['#48bb78', '#38a169']}
                    style={[styles.progressFill, { width: '100%' }]}
                  />
                </View>
              </View>
            )}

            {/* Stats d'optimisation */}
            {optimizationStats && (
              <View style={styles.optimizationStats}>
                <Text style={styles.statsTitle}>📊 Optimisation réussie</Text>
                <Text style={styles.statsText}>
                  Taille réduite de {optimizationStats.compressionRatio}%
                </Text>
                <Text style={styles.statsDetail}>
                  {(optimizationStats.originalSize / 1024).toFixed(0)}KB → {(optimizationStats.optimizedSize / 1024).toFixed(0)}KB
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#f56565',
    fontWeight: '500',
  },
  disabledText: {
    color: '#a0aec0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },
  modalSaveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#48bb78',
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  modalSaveBtnDisabled: {
    backgroundColor: '#e2e8f0',
  },
  modalSaveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  modalSaveTextDisabled: {
    color: '#a0aec0',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  
  // Section Avatar
  avatarSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 15,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarPreview: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  roleBadgeText: {
    fontSize: 16,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 15,
  },
  avatarActionBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 80,
  },
  removeBtn: {
    borderColor: '#f56565',
    backgroundColor: '#fef5f5',
  },
  avatarActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  avatarActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4a5568',
  },
  
  // Section Info
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '600',
  },
  
  // Progression
  progressSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  progressText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  // Stats optimisation
  optimizationStats: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f0fff4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#48bb78',
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48bb78',
    textAlign: 'center',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 13,
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 2,
  },
  statsDetail: {
    fontSize: 11,
    color: '#4a5568',
    textAlign: 'center',
  },
});