// src/components/shopping/CategoryGrid.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Category {
  name: string;
  emoji: string;
  colors: string[];
  isDefault?: boolean;
}

interface CategoryGridProps {
  defaultCategories: Category[];
  onCategoryPress: (categoryName: string) => void;
  onShowAllCategories: () => void;
}

export default function CategoryGrid({ 
  defaultCategories, 
  onCategoryPress, 
  onShowAllCategories 
}: CategoryGridProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏷️ Ajouter par catégorie</Text>
      <View style={styles.categoriesGrid}>
        {defaultCategories.map((category) => (
          <TouchableOpacity 
            key={category.name} 
            style={styles.categoryCard}
            onPress={() => onCategoryPress(category.name)}
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
        ))}
        
        {/* Bouton "Autres" */}
        <TouchableOpacity 
          style={[styles.categoryCard, styles.categoryCardOthers]}
          onPress={onShowAllCategories}
          activeOpacity={0.7}
        >
          <View style={[styles.categoryIcon, styles.categoryIconOthers]}>
            <Text style={styles.categoryEmoji}>➕</Text>
          </View>
          <Text 
            style={styles.categoryCardText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Autres
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 25,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 15,
  },
  
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    minWidth: 90,
    minHeight: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  categoryCardOthers: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  categoryIconOthers: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
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
});