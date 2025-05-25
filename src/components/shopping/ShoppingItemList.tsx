// src/components/shopping/ShoppingItemList.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ShoppingItemComponent from './ShoppingItem';

interface ShoppingItem {
  id: number;
  item: string;
  category: string;
  addedBy: string;
  checked: boolean;
}

interface ShoppingItemListProps {
  uncheckedItems: ShoppingItem[];
  checkedItems: ShoppingItem[];
  totalItems: number;
  onToggleItem: (itemId: number) => void;
  onRestartShopping: () => void;
  getCategoryColors: (categoryName: string) => string[];
}

export default function ShoppingItemList({
  uncheckedItems,
  checkedItems,
  totalItems,
  onToggleItem,
  onRestartShopping,
  getCategoryColors
}: ShoppingItemListProps) {
  // Message si liste vide
  if (totalItems === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Liste de courses vide</Text>
        <Text style={styles.emptySubtext}>Ajoutez vos premiers articles !</Text>
      </View>
    );
  }

  // Message si tout coché
  if (totalItems > 0 && uncheckedItems.length === 0) {
    return (
      <View style={styles.completedState}>
        <Text style={styles.completedIcon}>🎉</Text>
        <Text style={styles.completedText}>Courses terminées !</Text>
        <Text style={styles.completedSubtext}>
          Tous les articles sont dans le panier
        </Text>
        <TouchableOpacity style={styles.restartBtn} onPress={onRestartShopping}>
          <Text style={styles.restartText}>🔄 Recommencer les courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {/* Articles à acheter */}
      {uncheckedItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛍️ À acheter ({uncheckedItems.length})</Text>
          {uncheckedItems.map(item => (
            <ShoppingItemComponent 
              key={item.id} 
              item={item} 
              onToggle={onToggleItem}
              getCategoryColors={getCategoryColors}
            />
          ))}
        </View>
      )}

      {/* Articles dans le panier */}
      {checkedItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Dans le panier ({checkedItems.length})</Text>
          {checkedItems.map(item => (
            <ShoppingItemComponent 
              key={item.id} 
              item={item} 
              onToggle={onToggleItem}
              getCategoryColors={getCategoryColors}
            />
          ))}
        </View>
      )}
    </>
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

  emptyState: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 50,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 5,
  },

  emptySubtext: {
    fontSize: 14,
    color: '#4a5568',
  },

  completedState: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#48bb78',
  },

  completedIcon: {
    fontSize: 48,
    marginBottom: 15,
  },

  completedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#48bb78',
    marginBottom: 5,
  },

  completedSubtext: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 20,
    textAlign: 'center',
  },

  restartBtn: {
    backgroundColor: '#f7fafc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  restartText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
  },
});