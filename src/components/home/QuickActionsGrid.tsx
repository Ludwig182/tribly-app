// src/components/home/QuickActionsGrid.tsx
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
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 52) / 2; // 20px padding + 12px gap

interface QuickAction {
  id: string;
  title: string;
  count: string;
  emoji: string;
  colors: string[];
}

interface Props {
  actions: QuickAction[];
}

export default function QuickActionsGrid({ actions }: Props) {
  const { colors, name: themeName } = useTheme();
  const navigation = useNavigation();
  const scaleAnims = useRef(actions.map(() => new Animated.Value(0))).current;
  const bounceAnims = useRef(actions.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animation d'entrée en cascade
    actions.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    });

    // Animation de rebond pour le thème enfant
    if (themeName === 'child') {
      actions.forEach((_, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(bounceAnims[index], {
              toValue: -10,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnims[index], {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }
  }, [themeName]);

  const handlePress = (action: QuickAction) => {
    // Navigation selon l'action
    switch (action.title) {
      case 'Calendrier':
        navigation.navigate('calendar' as never);
        break;
      case 'Tâches':
        navigation.navigate('tasks' as never);
        break;
      case 'Courses':
        navigation.navigate('shopping' as never);
        break;
      case 'Famille':
        navigation.navigate('family' as never);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {themeName === 'child' ? '🚀 Tes raccourcis' : '⚡ Actions rapides'}
      </Text>

      <View style={styles.grid}>
        {actions.map((action, index) => (
          <Animated.View
            key={action.id}
            style={[
              styles.cardWrapper,
              {
                transform: [
                  { scale: scaleAnims[index] },
                  { translateY: bounceAnims[index] }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.cardTouchable}
              onPress={() => handlePress(action)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={themeName === 'child' ? action.colors.map(c => c + '99') : action.colors}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Background pattern pour enfants */}
                {themeName === 'child' && (
                  <View style={styles.childPattern}>
                    <View style={[styles.patternCircle, styles.patternCircle1]} />
                    <View style={[styles.patternCircle, styles.patternCircle2]} />
                  </View>
                )}

                {/* Emoji principal */}
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{action.emoji}</Text>
                  {parseInt(action.count) > 0 && (
                    <View style={[
                      styles.countBadge,
                      { backgroundColor: colors.dangerBackground }
                    ]}>
                      <Text style={[styles.countText, { color: colors.dangerText }]}>
                        {action.count}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Titre */}
                <Text style={styles.cardTitle}>{action.title}</Text>

                {/* Indicateur d'action */}
                <View style={styles.actionIndicator}>
                  <Text style={styles.actionArrow}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  cardWrapper: {
    width: CARD_SIZE,
    height: CARD_SIZE,
  },

  cardTouchable: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  card: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },

  childPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  patternCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
  },

  patternCircle1: {
    width: 60,
    height: 60,
    top: -20,
    right: -20,
  },

  patternCircle2: {
    width: 40,
    height: 40,
    bottom: -10,
    left: -10,
  },

  emojiContainer: {
    alignSelf: 'flex-start',
    position: 'relative',
  },

  emoji: {
    fontSize: 32,
  },

  countBadge: {
    position: 'absolute',
    top: -8,
    right: -12,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },

  countText: {
    fontSize: 12,
    fontWeight: '700',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  actionIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionArrow: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});