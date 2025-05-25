// src/components/FloatingActionButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FloatingActionButtonProps {
  onPress: () => void;
  colors?: string[]; // Couleurs du gradient
  icon?: string; // Icône à afficher
  size?: number; // Taille du bouton
  bottom?: number; // Position depuis le bas
  right?: number; // Position depuis la droite
  shadowColor?: string; // Couleur de l'ombre
  disabled?: boolean;
}

export default function FloatingActionButton({
  onPress,
  colors = ['#FF8A80', '#7986CB'], // Couleurs par défaut Tribly
  icon = '+',
  size = 60,
  bottom = 30,
  right = 20,
  shadowColor,
  disabled = false
}: FloatingActionButtonProps) {
  
  const fabStyle: ViewStyle = {
    position: 'absolute',
    right: right,
    bottom: bottom,
    width: size,
    height: size,
    borderRadius: size / 2,
    shadowColor: shadowColor || colors[0],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: disabled ? 0.1 : 0.3,
    shadowRadius: 12,
    elevation: disabled ? 2 : 8,
    opacity: disabled ? 0.5 : 1,
  };

  const gradientStyle = {
    width: '100%',
    height: '100%',
    borderRadius: size / 2,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  };

  return (
    <TouchableOpacity 
      style={fabStyle}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
    >
      <LinearGradient
        colors={disabled ? ['#e2e8f0', '#cbd5e0'] : colors}
        style={gradientStyle}
      >
        <Text style={[styles.fabIcon, { fontSize: size * 0.47 }]}>
          {icon}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabIcon: {
    fontWeight: '300',
    color: 'white',
    textAlign: 'center',
  },
});