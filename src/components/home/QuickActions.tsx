// src/components/home/QuickActions.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface QuickAction {
  title: string;
  subtitle: string;
  emoji: string;
  colors: string[];
  onPress: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚀 Actions rapides</Text>
      <View style={styles.quickActions}>
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.quickAction}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <LinearGradient colors={action.colors} style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
            </LinearGradient>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
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
  
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  quickAction: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  actionEmoji: {
    fontSize: 24,
  },
  
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  
  actionSubtitle: {
    fontSize: 12,
    color: '#718096',
  },
});