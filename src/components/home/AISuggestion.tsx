// src/components/home/AISuggestion.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AISuggestionProps {
  suggestion: string;
  actionText: string;
  onActionPress: () => void;
}

export default function AISuggestion({ suggestion, actionText, onActionPress }: AISuggestionProps) {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.aiSuggestion}
    >
      <View style={styles.aiHeader}>
        <Text style={styles.aiIcon}>🤖</Text>
        <Text style={styles.aiTitle}>IA suggère</Text>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>PREMIUM</Text>
        </View>
      </View>
      <Text style={styles.aiText}>
        {suggestion}
      </Text>
      <TouchableOpacity style={styles.aiAction} onPress={onActionPress}>
        <Text style={styles.aiActionText}>{actionText}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  aiSuggestion: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    position: 'relative',
    overflow: 'hidden',
  },
  
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  
  aiIcon: {
    fontSize: 20,
  },
  
  aiTitle: {
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  
  premiumText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  
  aiText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.95,
    color: 'white',
  },
  
  aiAction: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  
  aiActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});