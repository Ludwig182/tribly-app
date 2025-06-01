// src/components/home/MoodIndicatorContextual.tsx
import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  mood: 'energetic' | 'calm' | 'stressed' | 'celebrating';
  urgentTasks?: number;
  upcomingEvents?: number;
}

export default function MoodIndicatorContextual({ mood, urgentTasks = 0, upcomingEvents = 0 }: Props) {
  const { colors } = useTheme();
  const [contextMessage, setContextMessage] = useState('');
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Déterminer le message contextuel
    const hour = new Date().getHours();
    let message = '';

    if (mood === 'stressed' && urgentTasks > 0) {
      message = `${urgentTasks} tâches urgentes à gérer`;
    } else if (mood === 'energetic' && hour < 12) {
      message = 'Belle énergie matinale !';
    } else if (mood === 'calm' && hour >= 20) {
      message = 'Soirée tranquille en famille';
    } else if (mood === 'celebrating') {
      message = 'Objectif famille atteint ! 🎊';
    } else if (upcomingEvents > 0) {
      message = `${upcomingEvents} événements aujourd'hui`;
    } else {
      message = 'Tout va bien';
    }

    setContextMessage(message);

    // Animation d'apparition
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, [mood, urgentTasks, upcomingEvents]);

  const getMoodGradient = () => {
    switch (mood) {
      case 'energetic': return ['#FFE082', '#FFB74D'];
      case 'calm': return ['#A5D6A7', '#81C784'];
      case 'stressed': return ['#FFAB91', '#FF7043'];
      case 'celebrating': return ['#FFD54F', '#FFCA28'];
      default: return [colors.primary, colors.secondary];
    }
  };

  const getMoodIcon = () => {
    if (mood === 'stressed' && urgentTasks > 0) return '⏰';
    if (mood === 'celebrating') return '🏆';
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 18) return '🌤️';
    return '🌙';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <TouchableOpacity activeOpacity={0.8}>
        <LinearGradient
          colors={getMoodGradient()}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{getMoodIcon()}</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.message}>{contextMessage}</Text>
            {mood === 'stressed' && urgentTasks > 0 && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Voir les urgences →</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Indicateur visuel subtil */}
          <View style={styles.visualIndicator}>
            {mood === 'energetic' && (
              <View style={styles.energyBar}>
                <View style={[styles.energyLevel, { width: '80%' }]} />
              </View>
            )}
            {mood === 'calm' && (
              <Text style={styles.calmIndicator}>〰️</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  icon: {
    fontSize: 24,
  },

  content: {
    flex: 1,
  },

  message: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },

  actionButton: {
    marginTop: 4,
  },

  actionText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },

  visualIndicator: {
    marginLeft: 12,
  },

  energyBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },

  energyLevel: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },

  calmIndicator: {
    fontSize: 16,
    opacity: 0.6,
  },
});