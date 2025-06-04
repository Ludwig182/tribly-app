// src/components/home/PrioritiesCarousel.tsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  TouchableOpacity, // Gardé pour le bouton "Tout voir" et le fallback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import {
  TapGestureHandler,
  LongPressGestureHandler,
  State,
  ScrollView as GestureScrollView, // Utiliser le ScrollView de RNGH si besoin de compatibilité
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_SPACING = 12;
const EDGE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

interface Priority {
  id: string;
  time: string;
  title: string;
  emoji: string;
  urgent: boolean;
  completed?: boolean;
  category?: 'task' | 'event' | 'reminder';
  actionText?: string; // Texte pour le bouton d'action sur la carte
}

interface Props {
  priorities: Priority[];
  onUpdatePriority?: (priorityId: string, updates: Partial<Priority>) => void;
  onViewAllPress?: () => void; // Pour le bouton "Tout voir"
  onCardActionPress?: (priority: Priority) => void; // Pour l'action principale de la carte
}

export default function PrioritiesCarousel({
  priorities: initialPriorities,
  onUpdatePriority,
  onViewAllPress,
  onCardActionPress,
}: Props) {
  const { colors, name: themeName, fontSizeBase } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [priorities, setPriorities] = useState(initialPriorities);

  // Animation pour le thème enfant "bouncy"
  const childBounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setPriorities(initialPriorities);
  }, [initialPriorities]);

  const handleDoubleTap = useCallback((priorityId: string) => {
    const updatedPriority = priorities.find(p => p.id === priorityId);
    if (updatedPriority) {
      const newCompletedState = !updatedPriority.completed;
      setPriorities(prev => prev.map(p => (p.id === priorityId ? { ...p, completed: newCompletedState } : p)));
      onUpdatePriority?.(priorityId, { completed: newCompletedState });
      Haptics.notificationAsync(
        newCompletedState ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
      );
      Alert.alert("Priorité mise à jour", `${updatedPriority.title} marquée comme ${newCompletedState ? 'faite' : 'à faire'}.`);

      if (themeName === 'child' && newCompletedState) {
        Animated.sequence([
          Animated.spring(childBounceAnim, { toValue: 1.1, useNativeDriver: true }),
          Animated.spring(childBounceAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [priorities, onUpdatePriority, themeName, childBounceAnim]);

  const handleLongPress = useCallback((priority: Priority) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let actions = [];
    if (priority.category === 'task') {
      actions = [
        { text: 'Reporter la tâche', onPress: () => console.log('Reporter Tâche:', priority.id) },
        { text: 'Déléguer la tâche', onPress: () => console.log('Déléguer Tâche:', priority.id) },
      ];
    } else if (priority.category === 'event') {
      actions = [
        { text: 'Modifier l\'événement', onPress: () => console.log('Modifier Événement:', priority.id) },
        { text: 'Inviter quelqu\'un', onPress: () => console.log('Inviter pour:', priority.id) },
      ];
    } else {
      actions = [{ text: 'Modifier', onPress: () => console.log('Modifier Priorité:', priority.id) }];
    }

    Alert.alert(
      priority.title,
      'Actions rapides :',
      [...actions, { text: 'Annuler', style: 'cancel' }],
      { cancelable: true }
    );
  }, []);

  const getCardButtonText = (priority: Priority): string => {
    if (priority.actionText) return priority.actionText;
    if (priority.category === 'task') return 'Détails'; // [cite: 4]
    if (priority.category === 'event') return 'Planifier'; // [cite: 4]
    return 'Ouvrir';
  };


  if (!priorities || priorities.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizeBase * 1.15 }]}>
            {themeName === 'child' ? '🎯 Mes missions !' : '⚡ Priorités du jour'}
          </Text>
        </View>
        <View style={[styles.emptyStateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyStateEmoji, { fontSize: fontSizeBase * 2.5 }]}>🎉</Text>
          <Text style={[styles.emptyStateText, { color: colors.text, fontSize: fontSizeBase * 1.05 }]}>
            Aucune priorité pour aujourd'hui !
          </Text>
          <Text style={[styles.emptyStateSubText, { color: colors.textSecondary, fontSize: fontSizeBase * 0.9 }]}>
            Profitez de votre journée ou ajoutez de nouvelles tâches.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizeBase * 1.15 }]}>
          {themeName === 'child' ? '🎯 Mes missions !' : '⚡ Priorités du jour'}
        </Text>
        {onViewAllPress && (
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAllPress}>
            <Text style={[styles.viewAllText, { color: colors.primary, fontSize: fontSizeBase * 0.9 }]}>
              Tout voir
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: EDGE_PADDING }]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true } // native driver pour le scroll
        )}
        scrollEventThrottle={16}
        // Pour le thème enfant, on peut ajouter une sur-extension
        overScrollMode={themeName === 'child' ? 'auto' : 'never'} // 'auto' permet le rebond natif sur Android
        bounces={themeName === 'child'} // Permet le rebond sur iOS
      >
        {priorities.map((priority, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const scale = scrollX.interpolate({ inputRange, outputRange: [0.92, 1, 0.92], extrapolate: 'clamp' }); // [cite: 4]
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.75, 1, 0.75], extrapolate: 'clamp' }); // [cite: 4]

          return (
            <LongPressGestureHandler
              key={priority.id}
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === State.ACTIVE) {
                  handleLongPress(priority);
                }
              }}
              minDurationMs={600} // Durée standard pour un long press
            >
              <TapGestureHandler
                numberOfTaps={2}
                onHandlerStateChange={({ nativeEvent }) => {
                  if (nativeEvent.state === State.ACTIVE) {
                    handleDoubleTap(priority.id);
                  }
                }}
              >
                <Animated.View
                  style={[
                    styles.cardWrapper,
                    { transform: [{ scale: themeName === 'child' && priority.completed ? childBounceAnim : scale }], opacity },
                  ]}
                >
                  <LinearGradient
                    colors={
                      priority.urgent
                        ? priority.completed ? [colors.border, colors.textTertiary+'33'] : ['#FF6B6B', '#FF8787']
                        : priority.completed ? [colors.border, colors.textTertiary+'33']
                          : themeName === 'child' ? ['#4FC3F7', '#29B6F6']
                            : [colors.card, colors.card]
                    }
                    style={[
                      styles.card,
                      {
                        borderColor: priority.completed ? colors.border : (priority.urgent ? 'transparent' : colors.border),
                        shadowColor: priority.urgent && !priority.completed ? '#FF6B6B' : colors.shadow,
                        borderWidth: (themeName !== 'child' && !priority.urgent && !priority.completed) ? 1 : 0,
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardEmoji, { fontSize: fontSizeBase * 1.8 }]}>{priority.emoji}</Text>
                      <View style={styles.cardTitleContainer}>
                        <Text
                          style={[
                            styles.cardTitle,
                            {
                              color: (priority.urgent || themeName === 'child') && !priority.completed ? 'white' : colors.text,
                              textDecorationLine: priority.completed ? 'line-through' : 'none',
                              fontSize: fontSizeBase * 1.05,
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {priority.title}
                        </Text>
                        <Text
                          style={[
                            styles.cardTime,
                            {
                              color: (priority.urgent || themeName === 'child') && !priority.completed ? 'rgba(255,255,255,0.85)' : colors.textSecondary,
                              textDecorationLine: priority.completed ? 'line-through' : 'none',
                              fontSize: fontSizeBase * 0.85,
                            },
                          ]}
                        >
                          {priority.time}
                        </Text>
                      </View>
                    </View>

                    {priority.urgent && !priority.completed && (
                      <View style={styles.urgentBadge}>
                        <Text style={[styles.urgentText, { fontSize: fontSizeBase * 0.65 }]}>URGENT</Text>
                      </View>
                    )}

                    {!priority.completed && (
                      <TouchableOpacity
                        style={[
                          styles.actionButtonOnCard,
                          {
                            backgroundColor: (priority.urgent || themeName === 'child') ? 'rgba(255,255,255,0.25)' : colors.primary + '2A',
                            borderColor: (priority.urgent || themeName === 'child') ? 'rgba(255,255,255,0.4)' : colors.primary + '55',
                            borderWidth: 1,
                          },
                        ]}
                        onPress={() => onCardActionPress ? onCardActionPress(priority) : Alert.alert("Action", `Ouvrir les détails pour: ${priority.title}`)}
                      >
                        <Text
                          style={[
                            styles.actionButtonOnCardText,
                            {
                              color: (priority.urgent || themeName === 'child') ? 'white' : colors.primary,
                              fontSize: fontSizeBase * 0.8,
                            },
                          ]}
                        >
                          {getCardButtonText(priority)}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {priority.completed && (
                      <View style={styles.completedOverlay}>
                        <Text style={[styles.completedCheck, { fontSize: fontSizeBase * 2.2 }]}>✅</Text>
                      </View>
                    )}
                  </LinearGradient>
                </Animated.View>
              </TapGestureHandler>
            </LongPressGestureHandler>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8, // Moins de padding pour un look plus compact
  },
  viewAllText: {
    fontWeight: '600',
  },
  scrollContent: {
    // paddingHorizontal: EDGE_PADDING, // Appliqué dans le JSX
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    // Ajout d'une petite perspective pour l'effet de profondeur avec scale
    // perspective: 1000, // Peut être nécessaire sur certaines plateformes pour le scale 3D
  },
  card: {
    borderRadius: 20,
    padding: 16, // Padding standardisé
    minHeight: 135, // Hauteur un peu augmentée
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 5 }, // Ombre un peu plus marquée
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'visible', // Permettre aux badges de déborder légèrement si besoin
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Maintenir l'alignement en haut
    marginBottom: 8, // Espace avant le bouton d'action
  },
  cardEmoji: {
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 2, // Espace réduit
  },
  cardTime: {
    opacity: 0.9,
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)', // Badge plus contrasté
    paddingHorizontal: 10,
    paddingVertical: 5, // Légèrement plus grand
    borderRadius: 10,
  },
  urgentText: {
    fontWeight: 'bold', // Texte du badge en gras
    color: 'white',
  },
  actionButtonOnCard: {
    paddingVertical: 10, // Hauteur du bouton
    paddingHorizontal: 14,
    borderRadius: 12, // Coins plus arrondis
    alignSelf: 'flex-start',
    marginTop: 'auto', // Pousse le bouton en bas si l'espace le permet
  },
  actionButtonOnCardText: {
    fontWeight: 'bold', // Texte du bouton en gras
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(120, 144, 156, 0.15)', // Gris plus neutre et transparent
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheck: {
    opacity: 0.8,
  },
  emptyStateCard: {
    width: CARD_WIDTH,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 135,
    alignSelf: 'center',
    borderWidth: 1,
  },
  emptyStateEmoji: {
    marginBottom: 12,
  },
  emptyStateText: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyStateSubText: {
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
});