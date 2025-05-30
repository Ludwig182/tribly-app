// src/components/home/TribsHeroCard.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Child {
  name: string;
  tribs: number;
  avatar: string;
  color: string[];
}

interface FamilyGoal {
  current: number;
  target: number;
  reward: string;
}

interface Props {
  familyGoal: FamilyGoal;
  children: Child[];
}

export default function TribsHeroCard({ familyGoal, children }: Props) {
  const { colors, name: themeName } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const progress = Math.min((familyGoal.current / familyGoal.target) * 100, 100);

  useEffect(() => {
    // Animation de progression
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Animation de pulsation pour le thème enfant
    if (themeName === 'child') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
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
  }, [progress, themeName]);

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', `${progress}%`],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        themeName === 'child' && { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <LinearGradient
        colors={themeName === 'child' 
          ? ['#FFE082', '#FFCA28', '#FFC107'] 
          : [colors.primary, colors.secondary, colors.accent || colors.primary]
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background pattern */}
        <View style={styles.pattern}>
          {themeName === 'child' && (
            <>
              <Text style={[styles.patternEmoji, styles.star1]}>⭐</Text>
              <Text style={[styles.patternEmoji, styles.star2]}>✨</Text>
              <Text style={[styles.patternEmoji, styles.star3]}>🌟</Text>
            </>
          )}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {themeName === 'child' ? '🏆 Super Tribs !' : '🎯 Objectif Famille'}
          </Text>
          <View style={styles.goalBadge}>
            <Text style={styles.goalText}>
              {familyGoal.current}/{familyGoal.target}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: widthInterpolate }]}>
              <LinearGradient
                colors={['#4CAF50', '#81C784']}
                style={styles.progressGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
            {themeName === 'child' && progress > 10 && (
              <Animated.View 
                style={[
                  styles.progressIcon,
                  { left: widthInterpolate }
                ]}
              >
                <Text style={styles.progressEmoji}>🚀</Text>
              </Animated.View>
            )}
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        {/* Reward */}
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>
            {themeName === 'child' ? '🎁 Récompense :' : 'Prochain objectif :'}
          </Text>
          <Text style={styles.rewardText}>{familyGoal.reward}</Text>
          <Text style={styles.rewardRemaining}>
            Plus que {familyGoal.target - familyGoal.current} Tribs !
          </Text>
        </View>

        {/* Children contributions */}
        {children.length > 0 && (
          <View style={styles.childrenContainer}>
            <Text style={styles.childrenTitle}>
              {themeName === 'child' ? '🌟 Champions' : '📊 Contributions'}
            </Text>
            <View style={styles.childrenList}>
              {children.slice(0, 3).map((child, index) => (
                <View key={index} style={styles.childItem}>
                  <LinearGradient
                    colors={child.color}
                    style={styles.childAvatar}
                  >
                    <Text style={styles.childEmoji}>{child.avatar}</Text>
                  </LinearGradient>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childTribs}>{child.tribs}T</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  gradient: {
    padding: 20,
    minHeight: 200,
  },

  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  patternEmoji: {
    position: 'absolute',
    fontSize: 20,
    opacity: 0.3,
  },

  star1: {
    top: 20,
    right: 30,
  },

  star2: {
    bottom: 30,
    left: 20,
  },

  star3: {
    top: 60,
    left: 100,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },

  goalBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  progressContainer: {
    marginBottom: 20,
  },

  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    borderRadius: 6,
  },

  progressGradient: {
    flex: 1,
  },

  progressIcon: {
    position: 'absolute',
    top: -8,
    marginLeft: -15,
  },

  progressEmoji: {
    fontSize: 24,
  },

  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'right',
    fontWeight: '600',
  },

  rewardContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  rewardLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },

  rewardText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },

  rewardRemaining: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },

  childrenContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },

  childrenTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },

  childrenList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  childItem: {
    alignItems: 'center',
  },

  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  childEmoji: {
    fontSize: 20,
  },

  childName: {
    fontSize: 12,
    color: 'white',
    marginBottom: 2,
  },

  childTribs: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});