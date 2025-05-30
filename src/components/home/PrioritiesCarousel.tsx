// src/components/home/PrioritiesCarousel.tsx
import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Animated,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_SPACING = 16;

interface Priority {
  id: string;
  time: string;
  title: string;
  emoji: string;
  urgent: boolean;
}

interface Props {
  priorities: Priority[];
}

export default function PrioritiesCarousel({ priorities }: Props) {
  const { colors, name: themeName } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;

  if (!priorities || priorities.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {themeName === 'child' ? '🎯 Mes missions !' : '⚡ Priorités du jour'}
        </Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            Tout voir
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {priorities.map((priority, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={priority.id}
              style={[
                styles.cardContainer,
                {
                  transform: [{ scale }],
                  opacity,
                }
              ]}
            >
              <TouchableOpacity activeOpacity={0.9}>
                <LinearGradient
                  colors={priority.urgent 
                    ? ['#FF6B6B', '#FF8787']
                    : themeName === 'child'
                      ? ['#4FC3F7', '#29B6F6'] 
                      : [colors.card, colors.background]
                  }
                  style={[
                    styles.card,
                    priority.urgent && styles.urgentCard,
                    { 
                      borderColor: priority.urgent 
                        ? 'transparent' 
                        : colors.border,
                      shadowColor: priority.urgent 
                        ? '#FF6B6B' 
                        : colors.shadow
                    }
                  ]}
                >
                  {/* Emoji décoratif */}
                  <View style={styles.emojiContainer}>
                    <Text style={styles.cardEmoji}>{priority.emoji}</Text>
                    {priority.urgent && (
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>URGENT</Text>
                      </View>
                    )}
                  </View>

                  {/* Contenu */}
                  <View style={styles.cardContent}>
                    <Text style={[
                      styles.cardTime,
                      { color: priority.urgent ? 'rgba(255,255,255,0.9)' : colors.textSecondary }
                    ]}>
                      {priority.time}
                    </Text>
                    <Text style={[
                      styles.cardTitle,
                      { color: priority.urgent ? 'white' : colors.text }
                    ]}>
                      {priority.title}
                    </Text>
                  </View>

                  {/* Action button */}
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      priority.urgent && styles.urgentActionButton
                    ]}
                  >
                    <Text style={styles.actionButtonText}>→</Text>
                  </TouchableOpacity>

                  {/* Animation pour le thème enfant */}
                  {themeName === 'child' && priority.urgent && (
                    <Animated.View style={styles.pulseAnimation}>
                      <View style={styles.pulseCircle} />
                    </Animated.View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginHorizontal: -20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },

  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  cardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },

  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 120,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  urgentCard: {
    borderWidth: 0,
    shadowOpacity: 0.3,
  },

  emojiContainer: {
    marginRight: 16,
    alignItems: 'center',
  },

  cardEmoji: {
    fontSize: 36,
  },

  urgentBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  urgentText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },

  cardContent: {
    flex: 1,
  },

  cardTime: {
    fontSize: 14,
    marginBottom: 4,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  urgentActionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  actionButtonText: {
    fontSize: 20,
    color: 'white',
  },

  pulseAnimation: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  pulseCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
});