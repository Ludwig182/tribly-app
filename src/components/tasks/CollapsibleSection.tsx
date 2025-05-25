// src/components/tasks/CollapsibleSection.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

interface CollapsibleSectionProps {
  title: string;
  tasks: Task[];
  isExpanded: boolean;
  onToggle: () => void;
  emoji: string;
  onCompleteTask: (taskId: number) => void;
  getTaskUrgency: (dueDate?: Date) => { text: string; color: string; emoji: string };
}

export default function CollapsibleSection({ 
  title, 
  tasks, 
  isExpanded, 
  onToggle, 
  emoji,
  onCompleteTask,
  getTaskUrgency
}: CollapsibleSectionProps) {
  return (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>
          {emoji} {title} ({tasks.length})
        </Text>
        <Text style={[styles.chevron, { transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }]}>
          ›
        </Text>
      </TouchableOpacity>
      
      {isExpanded && tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onComplete={onCompleteTask}
          getTaskUrgency={getTaskUrgency}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 25,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },

  chevron: {
    fontSize: 20,
    color: '#4a5568',
    fontWeight: '600',
  },
});