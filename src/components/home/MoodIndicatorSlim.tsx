// src/components/home/MoodIndicatorSlim.tsx
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  mood: 'energetic' | 'calm' | 'stressed' | 'celebrating';
  style?: any;
}

const moodConfig = {
  energetic: {
    emoji: '⚡',
    text: 'Active',
    colors: ['#FFB74D', '#FF9800'],
  },
  calm: {
    emoji: '😌',
    text: 'Calme',
    colors: ['#81C784', '#66BB6A'],
  },
  stressed: {
    emoji: '😤',
    text: 'Chargée',
    colors: ['#FF7043', '#FF5722'],
  },
  celebrating: {
    emoji: '🎉',
    text: 'En fête',
    colors: ['#FFD54F', '#FFC107'],
  },
};

export default function MoodIndicatorSlim({ mood, style }: Props) {
  const { colors } = useTheme();
  const config = moodConfig[mood];
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Pulsation légère pour certaines humeurs
    if (mood === 'celebrating' || mood === 'stressed') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [mood]);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [
            { scaleX: scaleAnim },
            { scale: pulseAnim }
          ],
        }
      ]}
    >
      <TouchableOpacity activeOpacity={0.8}>
        <LinearGradient
          colors={config.colors}
          style={styles.indicator}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.content}>
            <Text style={styles.emoji}>{config.emoji}</Text>
            <Text style={styles.label}>Humeur famille :</Text>
            <Text style={styles.moodText}>{config.text}</Text>
            
            {/* Mini indicateur visuel */}
            {mood === 'energetic' && (
              <View style={styles.energyDots}>
                <View style={styles.dot} />
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dot, styles.dotActive]} />
              </View>
            )}
            
            {mood === 'stressed' && (
              <Text style={styles.alertIcon}>!</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  indicator: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  emoji: {
    fontSize: 20,
  },

  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  moodText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  energyDots: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  dotActive: {
    backgroundColor: 'white',
  },

  alertIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
  },
});