// src/components/tasks/TaskItem.tsx - Version modale actions

import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import TaskActionModal from './TaskActionModal';

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
  const penalty = Math.floor(task.tribs / 2);

  const [modalVisible, setModalVisible] = useState(false);

  // 🎯 Rendu pour tâche complétée
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

  // 🎯 Rendu tâche en cours (tap → modale actions)
  return (
    <>
      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
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
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.completeBtnText, { color: colors.primary }]}>
            ✓ Marquer comme terminé
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
      <TaskActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onValidate={() => {
          setModalVisible(false);
          onComplete(task.id);
        }}
        onNotDone={() => {
          setModalVisible(false);
          onMarkAsNotDone?.(task.id, penalty);
        }}
        onDelete={() => {
          setModalVisible(false);
          onDelete?.(task.id);
        }}
        canDelete={currentUserRole === 'admin' || currentUserRole === 'parent'}
      />
    </>
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
  taskInfo: { flex: 1 },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  taskAssignee: { fontSize: 12 },
  taskRight: { alignItems: 'flex-end' },
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
  dueTime: { fontSize: 11, fontWeight: '600' },
  completeBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  completeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedTime: { fontSize: 11, fontWeight: '500' },
  undoHint: { fontSize: 11, textAlign: 'center', fontStyle: 'italic' },
});

