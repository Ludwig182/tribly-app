// src/components/tasks/TaskItem.tsx - Version avec swipe pour supprimer
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, RectButton, Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../theme/useTheme';

interface Task {
  id: number | string;
  title: string;
  assignee: string;
  tribs: number;
  status: 'pending' | 'completed';
  color: string[];
  dueDate?: Date;
  completedAt?: string;
  completedDate?: Date;
  assigneeId?: string;
}

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: number | string) => void;
  onUncomplete?: (taskId: number | string) => void;
  onDelete?: (taskId: number | string) => void;
  onMarkAsNotDone?: (taskId: number | string, penalty: number) => void;
  currentUserRole?: string;
  getTaskUrgency: (dueDate?: Date) => { text: string; color: string; emoji: string };
  formatCompletedTime?: (completedDate?: Date, completedAt?: string) => string;
}

export default function TaskItem({ 
  task, 
  onComplete, 
  onUncomplete, 
  onDelete,
  onMarkAsNotDone,
  currentUserRole,
  getTaskUrgency, 
  formatCompletedTime 
}: TaskItemProps) {
  const { colors } = useTheme();
  const urgency = getTaskUrgency(task.dueDate);
  const swipeableRef = useRef<Swipeable>(null);

  // 🔐 Permissions pour supprimer (adultes seulement)
  const canDelete = currentUserRole === 'admin' || currentUserRole === 'parent';

  // 🎯 Calcul de la pénalité (50% des Tribs, arrondi inférieur)
  const penalty = Math.floor(task.tribs / 2);

  // 🗑️ Gestion de la suppression simple
  const handleDelete = () => {
    Alert.alert(
      '🗑️ Supprimer la tâche',
      `Êtes-vous sûr de vouloir supprimer "${task.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel', onPress: () => swipeableRef.current?.close() },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            swipeableRef.current?.close();
            onDelete?.(task.id);
          }
        }
      ]
    );
  };

  // ❌ Gestion de "tâche non faite" avec pénalité
  const handleNotDone = () => {
    Alert.alert(
      '❌ Marquer comme non faite',
      `Cette action va retirer ${penalty} Tribs à ${task.assignee}.\n\nÊtes-vous sûr que la tâche n'a pas été faite ?`,
      [
        { text: 'Annuler', style: 'cancel', onPress: () => swipeableRef.current?.close() },
        { 
          text: 'Confirmer', 
          style: 'destructive',
          onPress: () => {
            swipeableRef.current?.close();
            onMarkAsNotDone?.(task.id, penalty);
          }
        }
      ]
    );
  };

  // 🎨 Rendu des actions swipe
  const renderRightActions = (progress: Animated.AnimatedInterpolation, dragX: Animated.AnimatedInterpolation) => {
    if (!canDelete || task.status === 'completed') return null;

    const trans = dragX.interpolate({
      inputRange: [-200, -100, 0],
      outputRange: [0, 0, 100],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActionsContainer}>
        {/* Action "Non faite" avec pénalité */}
        <Animated.View
          style={[
            styles.actionAnimated,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <RectButton
            style={[styles.rightAction, { backgroundColor: colors.system?.warning || '#FF9800' }]}
            onPress={handleNotDone}
          >
            <Text style={styles.actionIcon}>❌</Text>
            <Text style={styles.actionText}>Non faite</Text>
            <Text style={styles.penaltyText}>-{penalty} Tribs</Text>
          </RectButton>
        </Animated.View>

        {/* Action "Supprimer" */}
        <Animated.View
          style={[
            styles.actionAnimated,
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          <RectButton
            style={[styles.rightAction, { backgroundColor: colors.dangerBackground || '#F44336' }]}
            onPress={handleDelete}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={styles.actionText}>Supprimer</Text>
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  // 🎯 Rendu pour tâche complétée (non swipeable)
  if (task.status === 'completed') {
    return (
      <TouchableOpacity 
        style={[
          styles.taskCard, 
          styles.taskCompleted,
          { 
            backgroundColor: colors.card,
            borderColor: colors.system?.success || '#48bb78'
          }
        ]}
        onPress={() => onUncomplete?.(task.id)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, styles.taskTitleCompleted, { color: colors.textSecondary }]}>
              {task.title}
            </Text>
            <Text style={[styles.taskAssignee, { color: colors.textTertiary }]}>
              👤 {task.assignee}
            </Text>
          </View>
          <View style={styles.taskRight}>
            <LinearGradient
              colors={task.color}
              style={styles.tribsBadgeCompleted}
            >
              <Text style={styles.tribsText}>+{task.tribs} T</Text>
            </LinearGradient>
            <Text style={[styles.completedTime, { color: colors.system?.success || '#48bb78' }]}>
              ✅ {formatCompletedTime?.(task.completedDate, task.completedAt)}
            </Text>
          </View>
        </View>
        <Text style={[styles.undoHint, { color: colors.textTertiary }]}>
          Appuyer pour annuler
        </Text>
      </TouchableOpacity>
    );
  }

  // 🎯 Rendu pour tâche en cours (swipeable)
  const taskContent = (
    <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, { color: colors.text }]}>
            {task.title}
          </Text>
          <Text style={[styles.taskAssignee, { color: colors.textSecondary }]}>
            👤 {task.assignee}
          </Text>
        </View>
        <View style={styles.taskRight}>
          <LinearGradient
            colors={task.color}
            style={styles.tribsBadge}
          >
            <Text style={styles.tribsText}>{task.tribs} T</Text>
          </LinearGradient>
          <Text style={[styles.dueTime, { color: urgency.color }]}>
            {urgency.emoji} {urgency.text}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.completeBtn,
          { 
            backgroundColor: colors.overlayLight || 'rgba(76, 187, 120, 0.1)',
            borderColor: colors.primary,
          }
        ]}
        onPress={() => onComplete(task.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.completeBtnText, { color: colors.primary }]}>
          ✓ Marquer comme terminé
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Si l'utilisateur ne peut pas supprimer, afficher sans swipe
  if (!canDelete) {
    return taskContent;
  }

  // Sinon, afficher avec swipe
  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
      friction={2}
    >
      {taskContent}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
  },
  
  taskCompleted: {
    opacity: 0.8,
  },
  
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  taskInfo: {
    flex: 1,
  },
  
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  
  taskAssignee: {
    fontSize: 12,
  },
  
  taskRight: {
    alignItems: 'flex-end',
  },
  
  tribsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  
  tribsBadgeCompleted: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  
  tribsText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  
  dueTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  
  completeBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  completeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  completedTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  
  undoHint: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Styles pour les actions swipe
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionAnimated: {
    height: '100%',
    justifyContent: 'center',
  },

  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: '100%',
    minWidth: 80,
  },

  actionIcon: {
    fontSize: 20,
    color: 'white',
    marginBottom: 4,
  },

  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  penaltyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.9,
  },
});