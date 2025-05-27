// src/components/family/EditProfileModal.tsx - Version finale corrigée
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
  TextInput,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { storageService } from '../../services/storageService';
import { familyService } from '../../services/familyService';
import { useFamily } from '../../hooks/useFamily';

interface Member {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  role: 'admin' | 'parent' | 'child';
  birthDate?: string;
  email?: string;
  color: string;
}

interface EditProfileModalProps {
  visible: boolean;
  member: Member | null;
  familyId: string;
  currentUserId: string; // ID de l'utilisateur connecté
  familyData: any; // Données famille complètes
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfileModal({
  visible,
  member,
  familyId,
  currentUserId,
  familyData,
  onClose,
  onSuccess
}: EditProfileModalProps) {
  
  // 🗃️ États pour les données membre
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newBirthDate, setNewBirthDate] = useState<Date | null>(null);
  const [newRole, setNewRole] = useState<'parent' | 'child'>('child');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [newEmail, setNewEmail] = useState('');
  
  // 🗃️ États UI
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [optimizing, setOptimizing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🎨 Palettes de couleurs pour membres
  const memberColorPalettes = [
    { name: 'Corail-Violet', colors: ['#FF8A80', '#7986CB'] },
    { name: 'Pêche-Violet', colors: ['#FFCC80', '#A29BFE'] },
    { name: 'Vert-Nature', colors: ['#48bb78', '#38a169'] },
    { name: 'Bleu-Océan', colors: ['#4299e1', '#667eea'] },
    { name: 'Orange-Sunset', colors: ['#ed8936', '#dd6b20'] },
    { name: 'Violet-Mystique', colors: ['#9f7aea', '#805ad5'] },
    { name: 'Rose-Sakura', colors: ['#f093fb', '#f5576c'] },
    { name: 'Emeraude', colors: ['#11998e', '#38ef7d'] }
  ];

  // 🔐 Permissions calculées avec useMemo pour re-render automatique
  const permissions = React.useMemo(() => {
    if (!member || !familyData) {
      return {
        canEditName: false,
        canEditBirthDate: false,
        canEditRole: false,
        canEditEmail: false
      };
    }

    const currentUser = familyData.members?.find(m => m.id === currentUserId);
    const isCurrentUserAdmin = currentUser?.role === 'admin';
    const isCurrentUserParent = currentUser?.role === 'parent' || currentUser?.role === 'admin';
    const isEditingSelf = member.id === currentUserId;

    return {
      canEditName: isCurrentUserAdmin || (isCurrentUserParent && member.role === 'child') || isEditingSelf,
      canEditBirthDate: isCurrentUserAdmin || (isCurrentUserParent && member.role === 'child') || (isEditingSelf && (member.role === 'parent' || member.role === 'admin')),
      canEditRole: isCurrentUserAdmin,
      canEditEmail: isCurrentUserAdmin || (isEditingSelf && (member.role === 'parent' || member.role === 'admin'))
    };
  }, [currentUserId, familyData, member]);

  // Extraire les permissions
  const { canEditName, canEditBirthDate, canEditRole, canEditEmail } = permissions;

  // 📊 Calculs pour règles métier
  const currentParentsCount = familyData?.members?.filter(m => m.role === 'parent' || m.role === 'admin')?.length || 0;
  const canChangeToParent = newRole === 'parent' ? currentParentsCount < 2 || member?.role === 'parent' || member?.role === 'admin' : true;

  // 🔄 Reset modal quand ouvert
  React.useEffect(() => {
    if (visible && member) {
      setSelectedImage(member.avatarUrl || null);
      setNewName(member.name);
      setNewBirthDate(member.birthDate ? new Date(member.birthDate) : null);
      setNewRole(member.role === 'admin' ? 'parent' : member.role as 'parent' | 'child');
      setNewEmail(member.email || '');
      
      // Trouver l'index de couleur actuelle
      const currentColorIndex = memberColorPalettes.findIndex(
        palette => palette.colors[0] === member.color
      );
      setSelectedColorIndex(currentColorIndex >= 0 ? currentColorIndex : 0);
      
      setUploadProgress(0);
      setOptimizing(false);
      setSaving(false);
    }
  }, [visible, member, currentUserId, familyData]);

  if (!member) return null;

  // 📅 Calcul de l'âge à partir de la date de naissance
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  };

  // 📸 Gestion des images
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('📱 Permission requise', 'Accès aux photos nécessaire pour changer l\'avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        if (storageService.validateImageFormat(result.assets[0].uri)) {
          setSelectedImage(result.assets[0].uri);
        } else {
          Alert.alert('❌ Format non supporté', 'Choisissez une image JPG, PNG ou WebP.');
        }
      }
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible d\'accéder à la galerie.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('📷 Permission requise', 'Accès caméra nécessaire.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible d\'accéder à la caméra.');
    }
  };

  const showImageOptions = () => {
    Alert.alert('📸 Photo de profil', 'Comment ajouter une photo ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: '📱 Galerie', onPress: pickImage },
      { text: '📷 Caméra', onPress: takePhoto }
    ]);
  };

  // 📅 Gestion DatePicker
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Vérifier que la date n'est pas dans le futur
      const today = new Date();
      if (selectedDate > today) {
        Alert.alert('❌ Date invalide', 'La date de naissance ne peut pas être dans le futur.');
        return;
      }
      
      // Vérifier un âge raisonnable (0-120 ans)
      const age = calculateAge(selectedDate);
      if (age > 120) {
        Alert.alert('❌ Date invalide', 'Veuillez saisir une date de naissance valide.');
        return;
      }
      
      setNewBirthDate(selectedDate);
    }
  };

  // 🛡️ Validation des données
  const validateData = () => {
    if (!newName.trim()) {
      Alert.alert('❌ Nom requis', 'Le nom ne peut pas être vide.');
      return false;
    }
    
    if (newName.trim().length < 2) {
      Alert.alert('❌ Nom trop court', 'Le nom doit contenir au moins 2 caractères.');
      return false;
    }
    
    if (newName.trim().length > 50) {
      Alert.alert('❌ Nom trop long', 'Le nom ne peut pas dépasser 50 caractères.');
      return false;
    }
    
    if (!newBirthDate) {
      Alert.alert('❌ Date de naissance requise', 'Veuillez sélectionner une date de naissance.');
      return false;
    }
    
    if (newEmail && newEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      Alert.alert('❌ Email invalide', 'Veuillez saisir un email valide ou laisser vide.');
      return false;
    }

    if (newRole === 'parent' && !canChangeToParent) {
      Alert.alert('❌ Limite atteinte', 'Maximum 2 parents par famille.');
      return false;
    }
    
    return true;
  };

  // 💾 Sauvegarder les modifications
  const saveChanges = async () => {
    if (!validateData()) return;
    
    setSaving(true);
    
    try {
      let newAvatarUrl = member.avatarUrl;
      
      // 1. Gérer avatar si changé
      if (selectedImage !== member.avatarUrl) {
        if (selectedImage) {
          setOptimizing(true);
          const { imageOptimizationService } = await import('../../services/imageOptimizationService');
          const optimizedResult = await imageOptimizationService.optimizeAvatar(selectedImage);
          setOptimizing(false);
          
          const imageToUpload = optimizedResult.error ? selectedImage : optimizedResult.uri;
          newAvatarUrl = await storageService.uploadAvatar(
            familyId,
            member.id,
            imageToUpload,
            (progress) => setUploadProgress(progress)
          );
        } else {
          await storageService.deleteAvatar(familyId, member.id);
          newAvatarUrl = null;
        }
      }
      
      // 2. Préparer les nouvelles données membre
      const updatedMemberData = {
        ...member,
        name: newName.trim(),
        birthDate: newBirthDate?.toISOString().split('T')[0], // Format YYYY-MM-DD
        role: member.role === 'admin' ? 'admin' : newRole, // Admin reste admin
        email: newEmail.trim() || null,
        color: memberColorPalettes[selectedColorIndex].colors[0],
        avatarUrl: newAvatarUrl
      };
      
      // 3. Mettre à jour dans Firebase
      await familyService.updateMember(familyId, member.id, updatedMemberData);
      
      Alert.alert('✅ Profil mis à jour !', 'Les modifications ont été sauvegardées.', [
        { text: 'Super !', onPress: () => { onSuccess(); onClose(); } }
      ]);
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      Alert.alert('❌ Erreur', error.message || 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
      setOptimizing(false);
      setUploadProgress(0);
    }
  };

  // 🎨 Vérifier s'il y a des changements
  const hasChanges = 
    newName.trim() !== member.name ||
    selectedImage !== member.avatarUrl || 
    newBirthDate?.toISOString().split('T')[0] !== member.birthDate ||
    (member.role !== 'admin' && newRole !== member.role) ||
    (newEmail.trim() || null) !== member.email ||
    memberColorPalettes[selectedColorIndex].colors[0] !== member.color;

  const canSave = hasChanges && !uploading && !optimizing && !saving;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Text style={styles.modalCloseText}>Annuler</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>✏️ Modifier profil</Text>
            
            <TouchableOpacity 
              style={[styles.modalSaveBtn, !canSave && styles.modalSaveBtnDisabled]}
              onPress={saveChanges}
              disabled={!canSave}
            >
              {saving || uploading || optimizing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[styles.modalSaveText, !canSave && styles.modalSaveTextDisabled]}>
                  Sauver
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Section Avatar */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📷 Photo de profil</Text>
              
              <View style={styles.avatarContainer}>
                <View style={styles.avatarPreview}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.avatarImage} />
                  ) : (
                    <LinearGradient
                      colors={memberColorPalettes[selectedColorIndex].colors}
                      style={styles.avatarFallback}
                    >
                      <Text style={styles.avatarEmoji}>{member.avatar}</Text>
                    </LinearGradient>
                  )}
                  
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                      {member.role === 'admin' ? '👑' : member.role === 'parent' ? '👤' : '⭐'}
                    </Text>
                  </View>
                </View>

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
                      onPress={() => setSelectedImage(null)}
                      disabled={uploading || optimizing}
                    >
                      <Text style={styles.avatarActionIcon}>🗑️</Text>
                      <Text style={styles.avatarActionText}>Supprimer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Section Informations personnelles */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Informations personnelles</Text>
              
              {/* Nom */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📝 Nom</Text>
                <TextInput
                  style={[styles.textInput, !canEditName && styles.textInputDisabled]}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Nom du membre"
                  editable={canEditName}
                  maxLength={50}
                />
                {!canEditName && (
                  <Text style={styles.permissionText}>
                    Seuls les parents peuvent modifier le nom des enfants
                  </Text>
                )}
              </View>

              {/* Date de naissance */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🎂 Date de naissance</Text>
                
                {/* Affichage de la date actuelle */}
                <View style={[styles.dateDisplay, !canEditBirthDate && styles.dateDisplayDisabled]}>
                  <Text style={[styles.dateDisplayText, !canEditBirthDate && styles.dateDisplayTextDisabled]}>
                    {newBirthDate 
                      ? `${newBirthDate.toLocaleDateString('fr-FR')} (${calculateAge(newBirthDate)} ans)`
                      : 'Aucune date sélectionnée'
                    }
                  </Text>
                </View>

                {/* Bouton pour changer */}
                {canEditBirthDate && (
                  <TouchableOpacity
                    style={styles.changeDateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.changeDateButtonText}>
                      📅 {newBirthDate ? 'Modifier la date' : 'Choisir une date'}
                    </Text>
                  </TouchableOpacity>
                )}

                {!canEditBirthDate && (
                  <Text style={styles.permissionText}>
                    Seuls les parents peuvent modifier la date de naissance des enfants
                  </Text>
                )}
              </View>

              {/* Email */}
              {(member.role === 'parent' || member.role === 'admin') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>📧 Email</Text>
                  <TextInput
                    style={[styles.textInput, !canEditEmail && styles.textInputDisabled]}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder="email@exemple.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={canEditEmail}
                  />
                  {!canEditEmail && (
                    <Text style={styles.permissionText}>
                      Seul l'admin peut modifier les emails
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Section Rôle */}
            {canEditRole && member.role !== 'admin' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👑 Rôle dans la famille</Text>
                
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[styles.roleOption, newRole === 'parent' && styles.roleOptionSelected]}
                    onPress={() => canChangeToParent && setNewRole('parent')}
                    disabled={!canChangeToParent}
                  >
                    <Text style={styles.roleOptionIcon}>👤</Text>
                    <Text style={[styles.roleOptionText, newRole === 'parent' && styles.roleOptionTextSelected]}>
                      Parent
                    </Text>
                    {!canChangeToParent && (
                      <Text style={styles.roleOptionLimit}>(Max atteint)</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.roleOption, newRole === 'child' && styles.roleOptionSelected]}
                    onPress={() => setNewRole('child')}
                  >
                    <Text style={styles.roleOptionIcon}>⭐</Text>
                    <Text style={[styles.roleOptionText, newRole === 'child' && styles.roleOptionTextSelected]}>
                      Enfant
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Section Couleur */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎨 Couleur personnelle</Text>
              
              <View style={styles.colorSelector}>
                {memberColorPalettes.map((palette, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.colorOption, selectedColorIndex === index && styles.colorOptionSelected]}
                    onPress={() => setSelectedColorIndex(index)}
                  >
                    <LinearGradient
                      colors={palette.colors}
                      style={styles.colorOptionGradient}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.colorName}>
                {memberColorPalettes[selectedColorIndex].name}
              </Text>
            </View>

            {/* Progress bars */}
            {(uploading || optimizing) && (
              <View style={styles.progressSection}>
                <Text style={styles.progressText}>
                  {optimizing ? '🔄 Optimisation...' : `📤 Upload ${Math.round(uploadProgress)}%`}
                </Text>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={memberColorPalettes[selectedColorIndex].colors}
                    style={[styles.progressFill, { width: optimizing ? '100%' : `${uploadProgress}%` }]}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* DatePicker Modal */}
          {/* DatePicker Modal - Version corrigée */}
          {showDatePicker && (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.dateModalOverlay}>
              <View style={styles.dateModalContent}>
                <View style={styles.dateModalHeader}>
                  <TouchableOpacity
                    style={styles.dateModalCancelBtn}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.dateModalCancelText}>Annuler</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.dateModalTitle}>Date de naissance</Text>
                  
                  <TouchableOpacity
                    style={styles.dateModalConfirmBtn}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.dateModalConfirmText}>OK</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={newBirthDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    textColor="#000000"
                    style={styles.datePickerSpinner}
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}
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

  // Sections
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 15,
  },

  // Avatar
  avatarContainer: {
    alignItems: 'center',
  },
  avatarPreview: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  roleBadgeText: {
    fontSize: 14,
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
    fontSize: 18,
    marginBottom: 4,
  },
  avatarActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4a5568',
  },

  // Inputs
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2d3748',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textInputDisabled: {
    backgroundColor: '#f7fafc',
    color: '#a0aec0',
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateButtonDisabled: {
    backgroundColor: '#f7fafc',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2d3748',
  },
  dateButtonTextDisabled: {
    color: '#a0aec0',
  },
  dateButtonIcon: {
    fontSize: 18,
  },
  permissionText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Role selector
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleOptionSelected: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
  },
  roleOptionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
  },
  roleOptionTextSelected: {
    color: '#48bb78',
    fontWeight: '600',
  },
  roleOptionLimit: {
    fontSize: 10,
    color: '#f56565',
    marginTop: 2,
  },

  // Color selector
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  colorOptionSelected: {
    borderColor: '#2d3748',
    borderWidth: 3,
  },
  colorOptionGradient: {
    flex: 1,
    borderRadius: 22,
  },
  colorName: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Progress
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
  // Date Display (nouveau)
  dateDisplay: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },

  dateDisplayDisabled: {
    backgroundColor: '#f7fafc',
  },

  dateDisplayText: {
    fontSize: 16,
    color: '#2d3748',
    textAlign: 'center',
  },

  dateDisplayTextDisabled: {
    color: '#a0aec0',
  },

  changeDateButton: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  changeDateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  // Date Modal (version corrigée)
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  dateModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area iPhone
    maxHeight: '50%', // ← AJOUTÉ: Limite la hauteur
  },

  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  dateModalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  dateModalCancelText: {
    fontSize: 16,
    color: '#f56565',
    fontWeight: '500',
  },

  dateModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },

  dateModalConfirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  dateModalConfirmText: {
    fontSize: 16,
    color: '#48bb78',
    fontWeight: '600',
  },

  // ← NOUVEAUX STYLES POUR LE PICKER
  datePickerContainer: {
    height: 250,                    // ← Hauteur fixe
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  datePickerSpinner: {
    height: 200,                    // ← Hauteur du spinner
    width: '100%',
  },
});