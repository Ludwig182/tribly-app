// src/components/home/MoodIndicatorHeader.tsx
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  mood: 'energetic' | 'calm' | 'stressed' | 'celebrating';
}

const moodConfig = {
  energetic: {
    emoji: '⚡',
    color: '#FF9800',
  },
  calm: {
    emoji: '😌',
    color: '#66BB6A',
  },
  stressed: {
    emoji: '😤',
    color: '#FF5722',
  },
  celebrating: {
    emoji: '🎉',
    color: '#FFC107',
  },
};

export default function MoodIndicatorHeader({ mood }: Props) {
  const config = moodConfig[mood];
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de rebond subtile
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7}>
      <View style={[styles.bubble, { backgroundColor: config.color }]}>
        <Animated.Text 
          style={[
            styles.emoji,
            { transform: [{ translateY: bounceAnim }] }
          ]}
        >
          {config.emoji}
        </Animated.Text>
      </View>
      {mood === 'stressed' && (
        <View style={styles.alertDot} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  bubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },

  emoji: {
    fontSize: 18,
  },

  alertDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
    borderWidth: 2,
    borderColor: 'white',
  },
});