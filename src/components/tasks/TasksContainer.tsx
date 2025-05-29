// src/components/tasks/TasksContainer.tsx - Version thématique
import React, { useEffect, useState } from 'react';
import { SafeAreaView, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';
import { useTheme } from '../../theme/useTheme';
import { tasksService } from '../../services/tasksService';
import TasksHeader from './TasksHeader';
import TasksList from './TasksList';
import AddTaskModal from './AddTaskModal';
import { Task } from '../../types/task';
import { getExampleTasks, getMemberColor, getTaskUrgency } from '@/utils/tasksHelpers';
// src/utils/tasksHelpers.ts - Version corrigée pour les dates
import { Timestamp } from 'firebase/firestore';


// ⏱️ Format « Tâche terminée à … »
export const formatCompletedTime = (dt?: Date, fallback?: string) => {
  if (!dt) return fallback;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const comp = new Date(dt); comp.setHours(0, 0, 0, 0);
  const diff = Math.ceil((today.getTime() - comp.getTime()) / (24 * 60 * 60 * 1000));

  if (diff === 0) return dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diff === 1) return 'Hier';
  if (diff === 2) return 'Avant-hier';
  if (diff < 7) return `${dt.toLocaleDateString('fr-FR', { weekday: 'long' })} dernier`;
  return dt.toLocaleDateString('fr-FR');
};

export default function TasksContainer() {
  // 🎨 Thème adaptatif
  const { colors } = useTheme();
  
  // 🔐 Auth + 👥 Family
  const { isAuthenticated, familyMember, userName } = useAuth();
  const { familyId, familyData, tasks: familyTasks, loading: famLoading, updateTribs } = useFamily();

  // 🗃️ État local
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // ⇒ Charger / mapper
  useEffect(() => {
    if (!familyId || !isAuthenticated) {
      setTasks(getExampleTasks(familyMember?.id || 'demo', userName || 'Utilisateur'));
      setLoading(false);
      return;
    }
    const mapped = (familyTasks || []).map((t: any) => {
      // 👤 Récupérer le nom du membre assigné
      const assignee = familyData?.members?.find(m => m.id === t.assigneeId);
      const assigneeName = assignee?.name || t.assigneeName || 'Membre inconnu';
      
      return {
        ...t,
        assignee: assigneeName, // 👈 Nom pour l'affichage
        status: t.completed ? 'completed' : 'pending',
        color: getMemberColor(familyData?.members, t.assigneeId),
        // 🔄 Conversion Timestamp -> Date (Firebase stocke seconds/nanoseconds)
        dueDate: t.dueDate ? (() => {
          if (t.dueDate.seconds) {
            // Firebase Timestamp
            return new Date(t.dueDate.seconds * 1000);
          } else if (typeof t.dueDate === 'string') {
            // String ISO
            return new Date(t.dueDate);
          } else if (t.dueDate instanceof Date) {
            // Déjà une Date
            return t.dueDate;
          } else {
            // Invalide
            return undefined;
          }
        })() : undefined,
        completedDate: t.completedAt ? (() => {
          if (t.completedAt.seconds) {
            return new Date(t.completedAt.seconds * 1000);
          } else if (typeof t.completedAt === 'string') {
            return new Date(t.completedAt);
          } else if (t.completedAt instanceof Date) {
            return t.completedAt;
          } else {
            return undefined;
          }
        })() : undefined
      };
    }) as Task[];
    setTasks(mapped);
    setLoading(false);
  }, [familyTasks, familyId, isAuthenticated, familyData]);

  // ⇒ Sections
  const today = new Date();
  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');
  const urgent: Task[] = [], thisWeek: Task[] = [], later: Task[] = [];

  pending.forEach(t => {
    if (!t.dueDate) {
      later.push(t);
    } else {
      // Vérifier que dueDate est une Date valide
      const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
      
      if (isNaN(dueDate.getTime())) {
        // Si la date est invalide, mettre dans "plus tard"
        later.push(t);
      } else {
        const diff = Math.ceil((dueDate.getTime() - today.getTime()) / 8.64e7);
        if (diff <= 1) urgent.push(t);
        else if (diff <= 6) thisWeek.push(t);
        else later.push(t);
      }
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

// 🗑️ Supprimer une tâche (adultes seulement)
  const deleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Retirer de l'affichage local immédiatement
    setTasks(ts => ts.filter(t => t.id !== id));
    
    if (familyId && isAuthenticated) {
      try {
        await tasksService.deleteTask(familyId, id, familyMember?.id);
      } catch (error) {
        console.error('❌ Erreur suppression tâche:', error);
        // Remettre la tâche si erreur
        setTasks(ts => [...ts, task]);
        Alert.alert('❌ Erreur', 'Impossible de supprimer la tâche');
      }
    }
  };

  // ❌ Marquer une tâche comme "non faite" avec pénalité
  const markTaskAsNotDone = async (id: string, penalty: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    Alert.alert(
      '❌ Tâche non faite',
      `${task.assignee} va perdre ${penalty} Tribs pour ne pas avoir fait cette tâche.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          style: 'destructive',
          onPress: async () => {
            // Retirer la tâche de l'affichage
            setTasks(ts => ts.filter(t => t.id !== id));
            
            if (familyId && isAuthenticated && task.assigneeId) {
              try {
                // 1. Retirer les Tribs (pénalité)
                await familyService.updateMemberTribs(familyId, task.assigneeId, -penalty);
                
                // 2. Supprimer la tâche
                await tasksService.deleteTask(familyId, id, familyMember?.id);
                
                Alert.alert(
                  '✅ Appliqué',
                  `${task.assignee} a perdu ${penalty} Tribs.`,
                  [{ text: 'OK' }]
                );
              } catch (error) {
                console.error('❌ Erreur tâche non faite:', error);
                // Remettre la tâche si erreur
                setTasks(ts => [...ts, task]);
                Alert.alert('❌ Erreur', 'Impossible d\'appliquer la pénalité');
              }
            }
          }
        }
      ]
    );
  };

  if (loading || famLoading) return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
        onDelete={deleteTask}
        currentUserRole={familyMember?.role}
        getTaskUrgency={getTaskUrgency}
      />

      {/* ➕ Bouton ajout thématique (parents/admin seulement) */}
      {isAuthenticated && familyMember?.role !== 'child' && (
        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: colors.primary }]} 
          onPress={() => setShowAddModal(true)}
        >
          <Text style={[styles.addTxt, { color: colors.onPrimary }]}>+</Text>
        </TouchableOpacity>
      )}

      {/* Modal de création de tâche */}
      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          // Pas besoin de recharger, les tâches sont en temps réel via useFamily
          setShowAddModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  addBtn: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addTxt: { 
    fontSize: 32, 
    fontWeight: '300',
    marginTop: -2 
  }
});