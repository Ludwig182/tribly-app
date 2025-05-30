// src/components/home/FloatingMoodIndicator.tsx
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
}

const moodConfig = {
  energetic: {
    emoji: '⚡',
    text: 'Famille active',
    colors: ['#FFB74D', '#FF9800'],
  },
  calm: {
    emoji: '😌',
    text: 'Tout va bien',
    colors: ['#81C784', '#66BB6A'],
  },
  stressed: {
    emoji: '😤',
    text: 'Journée chargée',
    colors: ['#FF7043', '#FF5722'],
  },
  celebrating: {
    emoji: '🎉',
    text: 'En fête !',
    colors: ['#FFD54F', '#FFC107'],
  },
};

export default function FloatingMoodIndicator({ mood }: Props) {
  const { colors, name: themeName } = useTheme();
  const config = moodConfig[mood];
  
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Animation de pulsation pour certaines humeurs
    if (mood === 'celebrating' || (mood === 'stressed' && themeName === 'child')) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [mood, themeName]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY },
            { scale: pulseAnim }
          ],
          opacity,
        }
      ]}
    >
      <TouchableOpacity activeOpacity={0.8}>
        <LinearGradient
          colors={config.colors}
          style={styles.indicator}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Pattern décoratif */}
          {mood === 'celebrating' && (
            <View style={styles.celebratePattern}>
              <Text style={styles.confetti}>🎊</Text>
              <Text style={[styles.confetti, styles.confetti2]}>✨</Text>
            </View>
          )}

          <View style={styles.content}>
            <Text style={styles.emoji}>{config.emoji}</Text>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Humeur famille</Text>
              <Text style={styles.moodText}>{config.text}</Text>
            </View>
            
            {/* Indicateur visuel supplémentaire */}
            <View style={styles.visualIndicator}>
              {mood === 'energetic' && (
                <View style={styles.energyBars}>
                  <View style={[styles.bar, styles.bar1]} />
                  <View style={[styles.bar, styles.bar2]} />
                  <View style={[styles.bar, styles.bar3]} />
                </View>
              )}
              {mood === 'calm' && (
                <View style={styles.calmWaves}>
                  <Text style={styles.waveEmoji}>〰️</Text>
                </View>
              )}
              {mood === 'stressed' && (
                <View style={styles.stressIndicator}>
                  <Text style={styles.alertEmoji}>⚠️</Text>
                </View>
              )}
            </View>
          </View>

          {/* Suggestion d'action */}
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>
              {mood === 'stressed' ? 'Voir les urgences' : 'Détails →'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },

  indicator: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  celebratePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  confetti: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.6,
    top: 10,
    left: 20,
  },

  confetti2: {
    top: 'auto',
    bottom: 10,
    left: 'auto',
    right: 20,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  emoji: {
    fontSize: 36,
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },

  moodText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },

  visualIndicator: {
    marginLeft: 'auto',
  },

  energyBars: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'flex-end',
  },

  bar: {
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
  },

  bar1: {
    height: 12,
  },

  bar2: {
    height: 18,
  },

  bar3: {
    height: 14,
  },

  calmWaves: {
    opacity: 0.8,
  },

  waveEmoji: {
    fontSize: 20,
  },

  stressIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
  },

  alertEmoji: {
    fontSize: 16,
  },

  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },

  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});