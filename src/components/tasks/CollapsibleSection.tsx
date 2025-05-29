// src/components/tasks/CollapsibleSection.tsx - Version FlatList/swipe compatible
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { useTheme } from '../../theme/useTheme';
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
  onDeleteTask?: (taskId: number) => void;
  onMarkAsNotDone?: (taskId: number, penalty: number) => void;   // 👈 AJOUTE MOI !
  currentUserRole?: string;
  getTaskUrgency: (dueDate?: Date) => { text: string; color: string; emoji: string };
}

export default function CollapsibleSection({ 
  title, 
  tasks, 
  isExpanded, 
  onToggle, 
  emoji,
  onCompleteTask,
  onDeleteTask,
  onMarkAsNotDone,     // ← AJOUTE MOI ICI
  currentUserRole,
  getTaskUrgency
}: CollapsibleSectionProps) {

  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <TouchableOpacity 
        style={[styles.sectionHeader, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {emoji} {title} ({tasks.length})
        </Text>
        <Text style={[
          styles.chevron, 
          { 
            color: colors.primary,
            transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] 
          }
        ]}>
          ›
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TaskItem 
            task={item}
            onComplete={onCompleteTask}
            onDelete={onDeleteTask}
            onMarkAsNotDone={onMarkAsNotDone}    // 👈 PASSE MOI BIEN ICI !
            currentUserRole={currentUserRole}
            getTaskUrgency={getTaskUrgency}
          />
          )}
          scrollEnabled={false}         // << C'est ça qui est CRUCIAL !
          contentContainerStyle={{ paddingBottom: 4 }}
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '600',
  },
});
