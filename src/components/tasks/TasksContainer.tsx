// src/components/tasks/TasksContainer.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';
import { tasksService } from '../../services/tasksService';
import TasksHeader from './TasksHeader';
import TasksList from './TasksList';
import { Task } from '../../types/task';
import { getExampleTasks, getMemberColor } from '../../utils/tasksHelpers';

export default function TasksContainer() {
  // 🔐 Auth + 👥 Family
  const { isAuthenticated, familyMember, userName } = useAuth();
  const { familyId, familyData, tasks: familyTasks, loading: famLoading, updateTribs } = useFamily();

  // 🗃️ État local
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // ⇒ Charger / mapper
  useEffect(() => {
    if (!familyId || !isAuthenticated) {
      setTasks(getExampleTasks(familyMember?.id || 'demo', userName || 'Utilisateur'));
      setLoading(false);
      return;
    }
    const mapped = (familyTasks || []).map((t: any) => ({
   ...t,
   status: t.completed ? 'completed' : 'pending',
   color: getMemberColor(familyData?.members, t.assigneeId),
   // 🔄 Conversion Timestamp -> Date (Firebase stocke seconds/nanoseconds)
   dueDate: t.dueDate
     ? (t.dueDate.seconds ? new Date(t.dueDate.seconds * 1000) : t.dueDate)
     : undefined,
   completedDate: t.completedAt
     ? (t.completedAt.seconds ? new Date(t.completedAt.seconds * 1000) : t.completedAt)
    : undefined
})) as Task[];
    setTasks(mapped);
    setLoading(false);
  }, [familyTasks, familyId, isAuthenticated, familyData]);

  // ⇒ Sections
  const today = new Date();
  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');
  const urgent: Task[] = [], thisWeek: Task[] = [], later: Task[] = [];

  pending.forEach(t => {
    if (!t.dueDate) later.push(t);
    else {
      const diff = Math.ceil((t.dueDate.getTime() - today.getTime()) / 8.64e7);
      if (diff <= 1) urgent.push(t);
      else if (diff <= 6) thisWeek.push(t);
      else later.push(t);
    }
  });

  // ⇒ Actions
  const completeTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setTasks(ts => ts.map(t => (t.id === id ? { ...t, status: 'completed', completedDate: new Date() } : t)));

    if (familyId && isAuthenticated) {
      await tasksService.completeTask(familyId, id, familyMember?.id);
    }
    Alert.alert('🎉 Tâche terminée', `+${task.tribs} Tribs`, [{ text: 'OK' }]);
  };

  const [expanded, setExpanded] = useState({
    urgent: true,        // ← ouvert par défaut
    thisWeek: false,
    later: false
  });

  const undoTask = async (id: string) => {
    setTasks(ts => ts.map(t => (t.id === id ? { ...t, status: 'pending', completedDate: undefined } : t)));
    if (familyId && isAuthenticated) await tasksService.uncompleteTask(familyId, id, familyMember?.id);
  };

  if (loading || famLoading) return <SafeAreaView />;

  return (
    <SafeAreaView style={styles.container}>
      <TasksHeader
        familyName={familyData?.familyName}
        urgentCount={urgent.length}
        todoCount={pending.length}
        isDemo={!isAuthenticated}
      />

      <TasksList
        urgent={urgent}
        thisWeek={thisWeek}
        later={later}
        completedToday={completed}
        expandedSections={expanded}
        toggleSection={section =>
          setExpanded(prev => ({ ...prev, [section]: !prev[section] }))
        }
        onComplete={completeTask}
        onUndo={undoTask}
      />

      {/* ➕ Bouton ajout (parents/admin seulement) */}
      {isAuthenticated && familyMember?.role !== 'child' && (
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('TODO: AddTaskModal')}>
          <Text style={styles.addTxt}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  addBtn: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF8A80',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4
  },
  addTxt: { fontSize: 32, color: '#fff', marginTop: -2 }
});
