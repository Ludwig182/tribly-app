// src/components/shopping/modals/CreateCategoryModal.tsx
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CreateCategoryModalProps {
  visible: boolean;
  newCategoryName: string;
  selectedEmoji: string;
  selectedColorIndex: number;
  customCategoriesCount: number;
  colorPalettes: string[][];
  categoryEmojis: string[];
  onClose: () => void;
  onCreateCategory: () => void;
  onNameChange: (text: string) => void;
  onEmojiSelect: (emoji: string) => void;
  onColorSelect: (index: number) => void;
}

export default function CreateCategoryModal({
  visible,
  newCategoryName,
  selectedEmoji,
  selectedColorIndex,
  customCategoriesCount,
  colorPalettes,
  categoryEmojis,
  onClose,
  onCreateCategory,
  onNameChange,
  onEmojiSelect,
  onColorSelect
}: CreateCategoryModalProps) {
  const canCreate = newCategoryName.trim().length > 0;

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
            >
              <Text style={styles.modalCloseText}>Annuler</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>✨ Nouvelle catégorie</Text>
            
            <TouchableOpacity 
              style={[styles.modalSaveBtn, !canCreate && styles.modalSaveBtnDisabled]}
              onPress={onCreateCategory}
              disabled={!canCreate}
            >
              <Text style={[styles.modalSaveText, !canCreate && styles.modalSaveTextDisabled]}>
                Créer
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Nom de la catégorie */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>📝 Nom de la catégorie</Text>
              <TextInput
                style={styles.textInput}
                value={newCategoryName}
                onChangeText={onNameChange}
                placeholder="Ex: Bio, Animalerie, Jardinage..."
                placeholderTextColor="#a0aec0"
                autoFocus={true}
                returnKeyType="next"
              />
            </View>

            {/* Choix d'emoji */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>😊 Emoji</Text>
              <View style={styles.emojiSelector}>
                {categoryEmojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.emojiOption,
                      selectedEmoji === emoji && styles.emojiOptionSelected
                    ]}
                    onPress={() => onEmojiSelect(emoji)}
                  >
                    <Text style={styles.emojiOptionText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Choix de couleur */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>🎨 Couleur</Text>
              <View style={styles.colorSelector}>
                {colorPalettes.map((colors, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorOption,
                      selectedColorIndex === index && styles.colorOptionSelected
                    ]}
                    onPress={() => onColorSelect(index)}
                  >
                    <LinearGradient
                      colors={colors}
                      style={styles.colorOptionGradient}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Prévisualisation */}
            <View style={styles.previewSection}>
              <Text style={styles.inputLabel}>👀 Aperçu</Text>
              <View style={styles.categoryPreview}>
                <LinearGradient
                  colors={colorPalettes[selectedColorIndex]}
                  style={styles.categoryIcon}
                >
                  <Text style={styles.categoryEmoji}>{selectedEmoji}</Text>
                </LinearGradient>
                <Text 
                  style={styles.categoryCardText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {newCategoryName || 'Votre catégorie'}
                </Text>
              </View>
            </View>

            {/* Info limite */}
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                📊 {customCategoriesCount}/10 catégories personnalisées
              </Text>
            </View>
          </ScrollView>
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
    paddingHorizontal: 12,
    backgroundColor: '#FFCC80',
    borderRadius: 20,
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

  inputSection: {
    marginBottom: 30,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },

  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2d3748',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  emojiSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  emojiOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emojiOptionSelected: {
    backgroundColor: '#FF8A80',
    borderColor: '#FF8A80',
  },

  emojiOptionText: {
    fontSize: 24,
  },

  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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

  previewSection: {
    marginTop: 10,
  },

  categoryPreview: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  categoryEmoji: {
    fontSize: 20,
  },

  categoryCardText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2d3748',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },

  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  infoText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
  },
});