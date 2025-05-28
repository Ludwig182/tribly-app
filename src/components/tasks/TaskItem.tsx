// src/components/tasks/TaskItem.tsx - Version thématique (boutons seulement)
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface Task {
  id: number;
  title: string;
  assignee: string;
  tribs: number;
  status: 'pending' | 'completed';
  color: string[]; // 👈 Garder les couleurs membres (reconnaissance familiale)
  dueDate?: Date;
  completedAt?: string;
  completedDate?: Date;
}

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: number) => void;
  onUncomplete?: (taskId: number) => void;
  onDelete?: (taskId: number) => void; // 🗑️ Nouveau prop
  currentUserRole?: string; // 🔐 Rôle pour permissions
  getTaskUrgency: (dueDate?: Date) => { text: string; color: string; emoji: string };
  formatCompletedTime?: (completedDate?: Date, completedAt?: string) => string;
}

export default function TaskItem({ 
  task, 
  onComplete, 
  onUncomplete, 
  onDelete,
  currentUserRole,
  getTaskUrgency, 
  formatCompletedTime 
}: TaskItemProps) {
  const { colors } = useTheme();
  const urgency = getTaskUrgency(task.dueDate);

  // 🔐 Permissions pour supprimer (adultes seulement)
  const canDelete = currentUserRole === 'admin' || currentUserRole === 'parent';

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
            {/* 👈 Badge Tribs : Garder les couleurs membres */}
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

  return (
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
          {/* 👈 Badge Tribs : Garder les couleurs membres */}
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
      
      {/* 👈 Bouton completion : Thématique */}
      <View style={styles.taskActions}>
        <TouchableOpacity 
          style={[
            styles.completeBtn,
            { 
              backgroundColor: colors.overlayLight || 'rgba(76, 187, 120, 0.1)',
              borderColor: colors.primary,
              flex: canDelete ? 1 : undefined,
              marginRight: canDelete ? 8 : 0
            }
          ]}
          onPress={() => onComplete(task.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.completeBtnText, { color: colors.primary }]}>
            ✓ Marquer comme terminé
          </Text>
        </TouchableOpacity>

        {/* 🗑️ Bouton supprimer (adultes seulement) */}
        {canDelete && onDelete && (
          <TouchableOpacity 
            style={[
              styles.deleteBtn,
              { 
                backgroundColor: colors.dangerBackground || 'rgba(244, 67, 54, 0.1)',
                borderColor: colors.dangerBorder || '#f44336'
              }
            ]}
            onPress={() => onDelete(task.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.deleteBtnText, { color: colors.dangerText || '#d32f2f' }]}>
              🗑️
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
});