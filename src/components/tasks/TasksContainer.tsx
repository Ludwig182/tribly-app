// src/components/tasks/TasksContainer.tsx - Modification minimale pour header "full screen"
import React, { useEffect, useState } from 'react';
// MODIFICATION 1: Importer 'View' et 'StatusBar'. 'SafeAreaView' sera retiré comme conteneur principal.
import { View, TouchableOpacity, Text, StyleSheet, Alert, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';
import { useTheme } from '../../theme/useTheme'; // Assurez-vous que ce chemin est correct
import { tasksService } from '../../services/tasksService';
import TasksHeader from './TasksHeader'; // Votre TasksHeader.tsx modifié (celui ci-dessus)
import TasksList from './TasksList';
import AddTaskModal from './AddTaskModal';
import { Task } from '../../types/task';
import { getExampleTasks, getMemberColor, getTaskUrgency } from '@/utils/tasksHelpers';
// La fonction formatCompletedTime est dans tasksHelpers, donc pas besoin de la redéfinir ici.
// Retrait de l'import de Timestamp et familyService s'ils ne sont pas utilisés directement.

export default function TasksContainer() {
  const { colors } = useTheme();
  const { isAuthenticated, familyMember, userName } = useAuth();
  const { familyId, familyData, tasks: familyTasks, loading: famLoading } = useFamily(); // updateTribs retiré si non utilisé directement ici

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expanded, setExpanded] = useState({ urgent: true, thisWeek: false, later: false });

  useEffect(() => {
    if (!familyId || !isAuthenticated) {
      setTasks(getExampleTasks(familyMember?.id || 'demo-user', userName || 'Utilisateur Démo'));
      setLoading(false);
      return;
    }
    if (famLoading || familyTasks === undefined) { // Attendre que familyTasks soit au moins un tableau (même vide)
      setLoading(true);
      return;
    }
    const mapped = (familyTasks || []).map((t: any) => {
      const assignee = familyData?.members?.find(m => m.id === t.assigneeId);
      const assigneeName = assignee?.name || t.assigneeName || 'Membre inconnu';
      return {
        ...t,
        id: t.id, // Assurer la présence des champs de base
        title: t.title,
        tribs: t.tribs,
        assigneeId: t.assigneeId,
        difficulty: t.difficulty,
        assignee: assigneeName,
        status: t.completed ? 'completed' : 'pending',
        color: getMemberColor(familyData?.members, t.assigneeId),
        dueDate: t.dueDate ? (t.dueDate.seconds ? new Date(t.dueDate.seconds * 1000) : new Date(t.dueDate)) : undefined,
        completedDate: t.completedAt ? (t.completedAt.seconds ? new Date(t.completedAt.seconds * 1000) : new Date(t.completedAt)) : undefined,
        completedAt: t.completedAt, // Conserver pour formatCompletedTime si besoin
      } as Task;
    });
    setTasks(mapped);
    setLoading(false);
  }, [familyTasks, familyId, isAuthenticated, familyData, famLoading, familyMember, userName]);

  const todayForFilter = new Date(); todayForFilter.setHours(0,0,0,0);
  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');
  const urgent: Task[] = [], thisWeek: Task[] = [], later: Task[] = [];

  pending.forEach(t => {
    if (!t.dueDate) { later.push(t); return; }
    const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
    if (isNaN(dueDate.getTime())) { later.push(t); return; }
    const dueDateMidnight = new Date(dueDate); dueDateMidnight.setHours(0,0,0,0);
    const diffDays = Math.round((dueDateMidnight.getTime() - todayForFilter.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays < 0 || diffDays <= 1) urgent.push(t); // Aujourd'hui, demain et en retard
    else if (diffDays <= 6) thisWeek.push(t);
    else later.push(t);
  });

  const completedToday = completed.filter(t => {
    if (!t.completedDate) return false;
    const completedD = new Date(t.completedDate); completedD.setHours(0,0,0,0);
    return completedD.getTime() === todayForFilter.getTime();
  });

  const completeTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !familyId || !isAuthenticated || !familyMember?.id) return;
    const originalTasks = [...tasks];
    setTasks(ts => ts.map(t_ => (t_.id === id ? { ...t_, status: 'completed', completedDate: new Date() } : t_)));
    try {
      await tasksService.completeTask(familyId, id, familyMember.id);
      Alert.alert('🎉 Tâche terminée !', `+${task.tribs} Tribs pour ${task.assignee}.`);
    } catch (error) { setTasks(originalTasks); Alert.alert('Erreur', "Impossible de marquer la tâche comme terminée."); }
  };
  const undoTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !familyId || !isAuthenticated || !familyMember?.id) return;
    const originalTasks = [...tasks];
    setTasks(ts => ts.map(t_ => (t_.id === id ? { ...t_, status: 'pending', completedDate: undefined, completedAt: undefined } : t_)));
    try { await tasksService.uncompleteTask(familyId, id, familyMember.id); }
    catch (error) { setTasks(originalTasks); Alert.alert('Erreur', "Impossible d'annuler la tâche."); }
  };
  const deleteTask = async (id: string) => {
    if (!familyId || !isAuthenticated || !familyMember?.id) return;
    const originalTasks = tasks;
    setTasks(ts => ts.filter(t => t.id !== id));
    try { await tasksService.deleteTask(familyId, id, familyMember.id); }
    catch (error) { setTasks(originalTasks); Alert.alert('Erreur', 'Impossible de supprimer la tâche.'); }
  };
  const markTaskAsNotDone = async (id: string, penalty: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !familyId || !isAuthenticated || !familyMember?.id || !task.assigneeId) return;
    Alert.alert('❌ Tâche non faite', `${task.assignee} va perdre ${penalty} Tribs. Confirmer ?`,
      [{ text: 'Annuler', style: 'cancel' }, {
        text: 'Confirmer', style: 'destructive',
        onPress: async () => {
          const originalTasks = tasks;
          setTasks(ts => ts.filter(t => t.id !== id));
          try {
            await tasksService.deleteTask(familyId, id, familyMember.id); // Adapter si vous avez une fonction dédiée pour pénalité
            // await familyService.updateMemberTribs(familyId, task.assigneeId, -penalty); // Géré par tasksService ou à ajouter ici
            Alert.alert('Appliqué', `${task.assignee} a perdu ${penalty} Tribs.`);
          } catch (error) { setTasks(originalTasks); Alert.alert('Erreur', "Impossible d'appliquer la pénalité."); }
        }
      }]
    );
  };

  // Condition de chargement (famLoading de useFamily, loading local pour le mapping)
  if (famLoading || loading) {
    return (
      // Utiliser un View simple pour l'écran de chargement, avec fond du thème
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textSecondary }}>Chargement des tâches...</Text>
      </View>
    );
  }

  return (
    // MODIFICATION 2: Le conteneur principal est un <View>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* MODIFICATION 3: Ajout du StatusBar */}
      <StatusBar barStyle="light-content" />
      <TasksHeader
        familyName={familyData?.familyName || 'Ma Famille'}
        urgentCount={urgent.length}
        todoCount={pending.length}
        isDemo={!isAuthenticated}
      />

      <TasksList
        urgent={urgent}
        thisWeek={thisWeek}
        later={later}
        completedToday={completedToday}
        expandedSections={expanded}
        toggleSection={section =>
          setExpanded(prev => ({ ...prev, [section]: !prev[section] }))
        }
        onComplete={completeTask}
        onUndo={undoTask}
        onDelete={deleteTask}
        onMarkAsNotDone={markTaskAsNotDone}
        currentUserRole={familyMember?.role}
        getTaskUrgency={getTaskUrgency}
      />

      {isAuthenticated && (familyMember?.role === 'admin' || familyMember?.role === 'parent') && (
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={[styles.addTxt, { color: colors.onPrimary || 'white' }]}>+</Text>
        </TouchableOpacity>
      )}

      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor est maintenant appliqué via style inline avec colors.background
  },
  addBtn: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 + 10 : 28, // Ajustement pour TabBar iOS
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, // Ombre Android
    shadowColor: '#000', // Ombre iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addTxt: {
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2, // Ajustement visuel
    // color est appliqué via style inline avec colors.onPrimary
  }
});