// src/components/tasks/CompletedTasksList.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TaskItem from './TaskItem';
import { Task } from '../../types/task';

interface Props {
  tasks: Task[];
  onUncomplete: (id: string) => void;
  getTaskUrgency: (d?: Date) => { text: string; color: string; emoji: string };
}

export default function CompletedTasksList({ tasks, onUncomplete, getTaskUrgency }: Props) {
  if (tasks.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Tâches terminées aujourd’hui</Text>

      {tasks.map((t) => (
       <TaskItem
          key={t.id}
          task={t}
          onUncomplete={() => onUncomplete(t.id)}
          getTaskUrgency={getTaskUrgency}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 32 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 }
});
