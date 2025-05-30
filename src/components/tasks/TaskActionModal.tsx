// src/components/tasks/TaskActionModal.tsx - Version moderne avec animations
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TaskActionModalProps {
  visible: boolean;
  onClose: () => void;
  onValidate: () => void;
  onNotDone: () => void;
  onDelete: () => void;
  canDelete?: boolean;
  taskTitle?: string;
  taskTribs?: number;
  penaltyTribs?: number;
}

export default function TaskActionModal({
  visible,
  onClose,
  onValidate,
  onNotDone,
  onDelete,
  canDelete = true,
  taskTitle = 'cette tâche',
  taskTribs = 0,
  penaltyTribs = 0
}: TaskActionModalProps) {
  const { colors, fontSizeBase } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const iconScales = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1)
  ]).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Animations d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animations de sortie
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible]);

  // Animation au press d'un bouton
  const animatePress = (index: number, callback: () => void) => {
    Animated.sequence([
      Animated.timing(iconScales[index], {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(iconScales[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
    });
  };

  const actions = [
    {
      id: 'validate',
      icon: '✅',
      title: 'Valider la tâche',
      subtitle: taskTribs > 0 ? `+${taskTribs} Tribs` : 'Marquer comme terminée',
      gradientColors: [colors.system?.success || '#48bb78', '#38a169'],
      onPress: () => animatePress(0, onValidate),
    },
    {
      id: 'notdone',
      icon: '❌',
      title: 'Pas fait',
      subtitle: penaltyTribs > 0 ? `-${penaltyTribs} Tribs` : 'La tâche n\'a pas été réalisée',
      gradientColors: [colors.system?.error || '#f56565', '#e53e3e'],
      onPress: () => animatePress(1, onNotDone),
    },
  ];

  if (canDelete) {
    actions.push({
      id: 'delete',
      icon: '🗑️',
      title: 'Supprimer',
      subtitle: 'Retirer définitivement',
      gradientColors: ['#718096', '#4a5568'],
      onPress: () => animatePress(2, onDelete),
    });
  }

  // Gestion du blur (iOS seulement, Android utilise un overlay simple)
  const renderBackdrop = () => {
    if (Platform.OS === 'ios') {
      // Sur iOS, on peut utiliser un effet de blur natif si disponible
      try {
        const { BlurView } = require('expo-blur');
        return <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />;
      } catch {
        // Si expo-blur n'est pas installé, fallback sur overlay simple
        return null;
      }
    }
    return null;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          {renderBackdrop()}
          
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  backgroundColor: colors.card,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text, fontSize: fontSizeBase * 1.25 }]}>
                  Que faire avec
                </Text>
                <Text 
                  style={[styles.taskTitle, { color: colors.text, fontSize: fontSizeBase * 1.125 }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  "{taskTitle}" ?
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={action.id}
                    activeOpacity={0.8}
                    onPress={action.onPress}
                    style={styles.actionButton}
                  >
                    <Animated.View
                      style={[
                        styles.actionContent,
                        { transform: [{ scale: iconScales[index] }] }
                      ]}
                    >
                      <LinearGradient
                        colors={action.gradientColors}
                        style={styles.iconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.actionIcon}>{action.icon}</Text>
                      </LinearGradient>
                      
                      <View style={styles.actionTextContainer}>
                        <Text style={[styles.actionTitle, { color: colors.text, fontSize: fontSizeBase }]}>
                          {action.title}
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: colors.textSecondary, fontSize: fontSizeBase * 0.875 }]}>
                          {action.subtitle}
                        </Text>
                      </View>
                      
                      <View style={[styles.chevronContainer, { backgroundColor: colors.overlayLight || '#f7fafc' }]}>
                        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
                      </View>
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bouton annuler */}
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.border }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary, fontSize: fontSizeBase }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)',
  },

  container: {
    width: Math.min(SCREEN_WIDTH * 0.9, 380),
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  header: {
    marginBottom: 24,
    alignItems: 'center',
  },

  title: {
    fontWeight: '600',
    marginBottom: 4,
  },

  taskTitle: {
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  actions: {
    marginBottom: 16,
  },

  actionButton: {
    marginBottom: 12,
  },

  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 16,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  actionIcon: {
    fontSize: 24,
  },

  actionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },

  actionTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },

  actionSubtitle: {
    fontSize: 13,
  },

  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  chevron: {
    fontSize: 20,
    fontWeight: '300',
    transform: [{ rotate: '90deg' }],
  },

  cancelButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },

  cancelText: {
    fontWeight: '600',
  },
});