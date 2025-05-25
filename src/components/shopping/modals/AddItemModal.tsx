// src/components/shopping/modals/AddItemModal.tsx
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

interface Category {
  name: string;
  emoji: string;
  colors: string[];
  isDefault?: boolean;
  isCustom?: boolean;
  id?: string;
}

interface AddItemModalProps {
  visible: boolean;
  newItemName: string;
  selectedCategory: string;
  currentUser: string;
  allCategories: Category[];
  onClose: () => void;
  onAddItem: () => void;
  onItemNameChange: (text: string) => void;
  onCategorySelect: (categoryName: string) => void;
}

export default function AddItemModal({
  visible,
  newItemName,
  selectedCategory,
  currentUser,
  allCategories,
  onClose,
  onAddItem,
  onItemNameChange,
  onCategorySelect
}: AddItemModalProps) {
  const canAdd = newItemName.trim().length > 0;

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
            
            <Text style={styles.modalTitle}>Ajouter un article</Text>
            
            <TouchableOpacity 
              style={[styles.modalSaveBtn, !canAdd && styles.modalSaveBtnDisabled]}
              onPress={onAddItem}
              disabled={!canAdd}
            >
              <Text style={[styles.modalSaveText, !canAdd && styles.modalSaveTextDisabled]}>
                Ajouter
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Nom de l'article */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>📝 Nom de l'article</Text>
              <TextInput
                style={styles.textInput}
                value={newItemName}
                onChangeText={onItemNameChange}
                placeholder="Ex: Bananes, Fromage, Shampoing..."
                placeholderTextColor="#a0aec0"
                autoFocus={true}
                returnKeyType="next"
              />
            </View>

            {/* Sélection de catégorie */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>🏷️ Catégorie</Text>
              <View style={styles.categorySelector}>
                {allCategories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category.name && styles.categoryOptionSelected
                    ]}
                    onPress={() => onCategorySelect(category.name)}
                  >
                    <LinearGradient
                      colors={selectedCategory === category.name ? category.colors : ['#f7fafc', '#edf2f7']}
                      style={styles.categoryOptionIcon}
                    >
                      <Text style={styles.categoryOptionEmoji}>{category.emoji}</Text>
                    </LinearGradient>
                    <Text style={[
                      styles.categoryOptionText,
                      selectedCategory === category.name && styles.categoryOptionTextSelected
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info utilisateur */}
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                👤 Ajouté par {currentUser}
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

  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  categoryOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  categoryOptionSelected: {
    borderColor: '#FFCC80',
    borderWidth: 2,
    shadowColor: '#FFCC80',
    shadowOpacity: 0.2,
  },

  categoryOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  categoryOptionEmoji: {
    fontSize: 20,
  },

  categoryOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 4,
  },

  categoryOptionTextSelected: {
    color: '#2d3748',
    fontWeight: '600',
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