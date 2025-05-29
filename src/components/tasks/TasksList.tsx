// src/components/tasks/TasksList.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import CollapsibleSection from './CollapsibleSection';
import CompletedTasksList from './CompletedTasksList';
import { Task } from '../../types/task';
import { getTaskUrgency } from '../../utils/tasksHelpers';

interface Props {
  urgent: Task[];
  thisWeek: Task[];
  later: Task[];
  completedToday: Task[];
  expandedSections: { urgent: boolean; thisWeek: boolean; later: boolean };
  toggleSection: (s: 'urgent' | 'thisWeek' | 'later') => void;
  onComplete: (id: string) => void;
  onUndo: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkAsNotDone?: (id: string, penalty: number) => void;
  currentUserRole?: string;
  getTaskUrgency: (dueDate?: Date) => { text: string; color: string; emoji: string };
}

export default function TasksList({
  urgent,
  thisWeek,
  later,
  completedToday,
  expandedSections,
  toggleSection,
  onComplete,
  onUndo
}: Props) {
  return (
    <ScrollView style={styles.content}>
      {urgent.length > 0 && (
        <CollapsibleSection
          title="URGENT"
          tasks={urgent}
          isExpanded={expandedSections.urgent}
          onToggle={() => toggleSection('urgent')}
          emoji="🔥"
          onCompleteTask={onComplete}
          getTaskUrgency={getTaskUrgency}
        />
      )}

      <CollapsibleSection
        title="CETTE SEMAINE"
        tasks={thisWeek}
        isExpanded={expandedSections.thisWeek}
        onToggle={() => toggleSection('thisWeek')}
        emoji="📅"
        onCompleteTask={onComplete}
        getTaskUrgency={getTaskUrgency}
      />

      <CollapsibleSection
        title="PLUS TARD"
        tasks={later}
        isExpanded={expandedSections.later}
        onToggle={() => toggleSection('later')}
        emoji="📋"
        onCompleteTask={onComplete}
        getTaskUrgency={getTaskUrgency}
      />

      <CompletedTasksList
       tasks={completedToday}
        onUncomplete={onUndo}
        getTaskUrgency={getTaskUrgency}
      />

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20 }
});
