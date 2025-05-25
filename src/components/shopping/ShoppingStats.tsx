// src/components/shopping/ShoppingStats.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ShoppingStatsProps {
  totalItems: number;
  uncheckedItems: number;
  checkedItems: number;
  onClearBasket: () => void;
}

export default function ShoppingStats({ 
  totalItems, 
  uncheckedItems, 
  checkedItems, 
  onClearBasket 
}: ShoppingStatsProps) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalItems}</Text>
        <Text style={styles.statLabel}>Total articles</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={[styles.statNumber, { color: '#ed8936' }]}>{uncheckedItems}</Text>
        <Text style={styles.statLabel}>À acheter</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={[styles.statNumber, { color: '#48bb78' }]}>{checkedItems}</Text>
        <Text style={styles.statLabel}>Dans le panier</Text>
      </View>
      
      {checkedItems > 0 && (
        <TouchableOpacity style={styles.statCard} onPress={onClearBasket}>
          <Text style={[styles.statNumber, { color: '#f56565' }]}>🗑️</Text>
          <Text style={[styles.statLabel, { color: '#f56565' }]}>Vider</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 25,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFCC80',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: '500',
    textAlign: 'center',
  },
});