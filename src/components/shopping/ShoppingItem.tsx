// src/components/shopping/ShoppingItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ShoppingItem {
  id: number;
  item: string;
  category: string;
  addedBy: string;
  checked: boolean;
}

interface ShoppingItemProps {
  item: ShoppingItem;
  onToggle: (itemId: number) => void;
  getCategoryColors: (categoryName: string) => string[];
}

export default function ShoppingItemComponent({ 
  item, 
  onToggle, 
  getCategoryColors 
}: ShoppingItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.itemCard, item.checked && styles.itemChecked]}
      onPress={() => onToggle(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.checkbox}>
          <Text style={item.checked ? styles.checkboxFilled : styles.checkboxEmpty}>
            {item.checked ? '✓' : '○'}
          </Text>
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
            {item.item}
          </Text>
          <Text style={styles.itemMeta}>
            Ajouté par {item.addedBy}
          </Text>
        </View>
        
        <LinearGradient
          colors={getCategoryColors(item.category)}
          style={[styles.categoryBadge, item.checked && styles.categoryBadgeChecked]}
        >
          <Text style={styles.categoryText}>{item.category}</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  itemChecked: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
  },
  
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkboxEmpty: {
    fontSize: 20,
    color: '#cbd5e0',
  },
  
  checkboxFilled: {
    fontSize: 18,
    color: '#48bb78',
    fontWeight: '600',
  },
  
  itemInfo: {
    flex: 1,
  },
  
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#4a5568',
  },
  
  itemMeta: {
    fontSize: 12,
    color: '#4a5568',
  },
  
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  categoryBadgeChecked: {
    opacity: 0.6,
  },
  
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
});