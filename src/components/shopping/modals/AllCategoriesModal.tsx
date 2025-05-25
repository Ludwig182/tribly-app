// src/components/shopping/modals/AllCategoriesModal.tsx
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity
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

interface AllCategoriesModalProps {
  visible: boolean;
  allCategories: Category[];
  customCategoriesCount: number;
  onClose: () => void;
  onCategorySelect: (categoryName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onCreateNewCategory: () => void;
}

export default function AllCategoriesModal({
  visible,
  allCategories,
  customCategoriesCount,
  onClose,
  onCategorySelect,
  onDeleteCategory,
  onCreateNewCategory
}: AllCategoriesModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.modalCloseBtn}
            onPress={onClose}
          >
            <Text style={styles.modalCloseText}>Fermer</Text>
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>📋 Toutes les catégories</Text>
          
          <View style={styles.modalSaveBtn} />
        </View>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <View style={styles.allCategoriesGrid}>
            {allCategories.map((category) => (
              <View key={category.name || category.id} style={styles.categoryCardContainer}>
                <TouchableOpacity 
                  style={[styles.categoryCard, styles.categoryCardInContainer]}
                  onPress={() => {
                    onClose();
                    onCategorySelect(category.name);
                  }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={category.colors}
                    style={styles.categoryIcon}
                  >
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  </LinearGradient>
                  <Text 
                    style={styles.categoryCardText}
                    numberOfLines={2} 
                    ellipsizeMode="tail"
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
                
                {/* Bouton supprimer pour catégories custom */}
                {category.isCustom && (
                  <TouchableOpacity 
                    style={styles.deleteCategoryBtn}
                    onPress={() => onDeleteCategory(category.id!)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteCategoryText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            {/* Bouton créer nouvelle catégorie */}
            <TouchableOpacity 
              style={[styles.categoryCard, styles.createCategoryCard]}
              onPress={() => {
                onClose();
                onCreateNewCategory();
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF8A80', '#7986CB']}
                style={styles.categoryIcon}
              >
                <Text style={styles.categoryEmoji}>✨</Text>
              </LinearGradient>
              <Text 
                style={[styles.categoryCardText, styles.createCategoryText]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Créer nouvelle
              </Text>
              <Text style={styles.categoryLimit}>
                ({customCategoriesCount}/10)
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    width: 60, // Espace pour équilibrer le header
  },

  modalBody: {
    flex: 1,
    padding: 20,
  },

  allCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  categoryCardContainer: {
    position: 'relative',
    width: '31%',
    minWidth: 95,
  },

  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  categoryCardInContainer: {
    width: '100%',
    minWidth: 'auto',
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

  deleteCategoryBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f56565',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f56565',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  deleteCategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    lineHeight: 20,
  },

  createCategoryCard: {
    borderWidth: 2,
    borderColor: '#FF8A80',
    backgroundColor: '#fef5e7',
  },

  createCategoryText: {
    color: '#FF8A80',
    fontWeight: '600',
  },

  categoryLimit: {
    fontSize: 10,
    color: '#4a5568',
    marginTop: 2,
  },
});