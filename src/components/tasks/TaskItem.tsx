// src/components/tasks/TaskItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Task {
  id: number;
  title: string;
  assignee: string;
  tribs: number;
  status: 'pending' | 'completed';
  color: string[];
  dueDate?: Date;
  completedAt?: string;
  completedDate?: Date;
}

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: number) => void;
  onUncomplete?: (taskId: number) => void;
  getTaskUrgency: (dueDate?: Date) => { text: string; color: string; emoji: string };
  formatCompletedTime?: (completedDate?: Date, completedAt?: string) => string;
}

export default function TaskItem({ 
  task, 
  onComplete, 
  onUncomplete, 
  getTaskUrgency, 
  formatCompletedTime 
}: TaskItemProps) {
  const urgency = getTaskUrgency(task.dueDate);

  if (task.status === 'completed') {
    return (
      <TouchableOpacity 
        style={[styles.taskCard, styles.taskCompleted]}
        onPress={() => onUncomplete?.(task.id)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>{task.title}</Text>
            <Text style={styles.taskAssignee}>👤 {task.assignee}</Text>
          </View>
          <View style={styles.taskRight}>
            <LinearGradient
              colors={task.color}
              style={styles.tribsBadgeCompleted}
            >
              <Text style={styles.tribsText}>+{task.tribs} T</Text>
            </LinearGradient>
            <Text style={styles.completedTime}>
              ✅ {formatCompletedTime?.(task.completedDate, task.completedAt)}
            </Text>
          </View>
        </View>
        <Text style={styles.undoHint}>Appuyer pour annuler</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskAssignee}>👤 {task.assignee}</Text>
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
        style={styles.completeBtn}
        onPress={() => onComplete(task.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.completeBtnText}>✓ Marquer comme terminé</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  taskCompleted: {
    opacity: 0.8,
    borderWidth: 1,
    borderColor: '#48bb78',
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
    color: '#2d3748',
    marginBottom: 4,
  },
  
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#4a5568',
  },
  
  taskAssignee: {
    fontSize: 12,
    color: '#4a5568',
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
    backgroundColor: '#f0fff4',
    borderWidth: 1,
    borderColor: '#48bb78',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  completeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48bb78',
  },
  
  completedTime: {
    fontSize: 11,
    color: '#48bb78',
    fontWeight: '500',
  },
  
  undoHint: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});