// src/components/tasks/CompletedTasksList.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TaskItem from './TaskItem';

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

interface CompletedTasksListProps {
  completedTasks: Task[];
  pendingTasksCount: number;
  onCompleteTask: (taskId: number) => void;
  onUncompleteTask: (taskId: number) => void;
  getTaskUrgency: (dueDate?: Date) => { text: string; color: string; emoji: string };
  formatCompletedTime: (completedDate?: Date, completedAt?: string) => string;
}

export default function CompletedTasksList({
  completedTasks,
  pendingTasksCount,
  onCompleteTask,
  onUncompleteTask,
  getTaskUrgency,
  formatCompletedTime
}: CompletedTasksListProps) {
  // Message si aucune tâche en cours
  if (pendingTasksCount === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🎉</Text>
        <Text style={styles.emptyText}>Toutes les tâches sont terminées !</Text>
      </View>
    );
  }

  // Si pas de tâches terminées, on ne rend rien
  if (completedTasks.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎉 Tâches terminées aujourd'hui</Text>
      {completedTasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onComplete={onCompleteTask}
          onUncomplete={onUncompleteTask}
          getTaskUrgency={getTaskUrgency}
          formatCompletedTime={formatCompletedTime}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 25,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 15,
  },

  emptyState: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
  },
});