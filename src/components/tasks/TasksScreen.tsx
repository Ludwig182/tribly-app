// src/components/tasks/TasksScreen.tsx - Version dynamique avec Auth + Firebase
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import des composants
import TaskStats from './TaskStats';
import TaskItem from './TaskItem';
import CollapsibleSection from './CollapsibleSection';
import CompletedTasksList from './CompletedTasksList';

// Import des hooks
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';
import { tasksService } from '../../services/tasksService';

interface Task {
  id: string;
  title: string;
  assignee: string;
  assigneeId: string;
  tribs: number;
  status: 'pending' | 'completed';
  color: string[];
  dueDate?: Date;
  completedAt?: string;
  completedDate?: Date;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdBy?: string;
  familyId?: string;
}

export default function TasksScreen() {
  // 🔐 Données d'authentification
  const { 
    userName, 
    familyMember, 
    isAuthenticated, 
    userRole 
  } = useAuth();

  // 👥 Données famille
  const { 
    familyData, 
    tasks: familyTasks, 
    stats, 
    familyId, 
    updateTribs, 
    loading: familyLoading 
  } = useFamily();

  // 🗃️ État local pour les tâches
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 📂 État pour gérer les sections repliables
  const [expandedSections, setExpandedSections] = useState({
    thisWeek: false,
    later: false
  });

  // 🔄 Charger les tâches depuis Firebase
  useEffect(() => {
    if (!familyId || !isAuthenticated) {
      // Mode fallback avec données d'exemple si pas connecté
      setTasks(getExampleTasks());
      setLoading(false);
      return;
    }

    // Utiliser les tâches depuis useFamily (temps réel)
    if (familyTasks && familyTasks.length > 0) {
      const processedTasks = familyTasks.map(task => ({
        ...task,
        color: getMemberColor(task.assigneeId || task.assignee),
        dueDate: task.dueDate ? new Date(task.dueDate.seconds * 1000) : undefined,
        completedDate: task.completedAt ? new Date(task.completedAt.seconds * 1000) : undefined
      }));
      
      setTasks(processedTasks);
      console.log('✅ Tâches Firebase chargées:', processedTasks.length);
    } else {
      // Si pas de tâches Firebase, utiliser des exemples
      setTasks(getExampleTasks());
      console.log('📝 Utilisation tâches d\'exemple');
    }
    
    setLoading(false);
  }, [familyTasks, familyId, isAuthenticated, familyData]);

  // 🎨 Récupérer la couleur d'un membre
  const getMemberColor = (memberId: string): string[] => {
    if (!familyData?.members) return ['#FF8A80', '#7986CB'];
    
    const member = familyData.members.find(m => m.id === memberId || m.name === memberId);
    if (member?.color) {
      return [member.color, member.color];
    }
    return ['#FF8A80', '#7986CB'];
  };

  // 📝 Tâches d'exemple (fallback)
  const getExampleTasks = (): Task[] => {
    const currentUser = familyMember?.name || userName || 'Utilisateur';
    
    return [
      {
        id: 'task-1',
        title: 'Ranger sa chambre',
        assignee: 'Clémentine',
        assigneeId: 'user-003',
        tribs: 15,
        status: 'pending' as const,
        color: ['#FF8A80', '#7986CB'],
        dueDate: new Date(),
        difficulty: 'medium' as const
      },
      {
        id: 'task-2',
        title: 'Faire ses devoirs',
        assignee: 'Clémentine',
        assigneeId: 'user-003',
        tribs: 25,
        status: 'completed' as const,
        color: ['#FF8A80', '#7986CB'],
        completedAt: '16:30',
        completedDate: new Date(),
        difficulty: 'hard' as const
      },
      {
        id: 'task-3',
        title: 'Nourrir le chat',
        assignee: 'Jacob',
        assigneeId: 'user-004',
        tribs: 10,
        status: 'pending' as const,
        color: ['#FFCC80', '#A29BFE'],
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        difficulty: 'easy' as const
      },
      {
        id: 'task-4',
        title: 'Mettre la table',
        assignee: currentUser,
        assigneeId: familyMember?.id || 'user-001',
        tribs: 8,
        status: 'pending' as const,
        color: getMemberColor(familyMember?.id || 'user-001'),
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        difficulty: 'easy' as const
      },
      {
        id: 'task-5',
        title: 'Réviser maths',
        assignee: 'Clémentine',
        assigneeId: 'user-003',
        tribs: 20,
        status: 'pending' as const,
        color: ['#FF8A80', '#7986CB'],
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        difficulty: 'medium' as const
      }
    ];
  };

  // 🎯 Fonctions utilitaires (gardées de ton code original)
  const toggleSection = (section: 'thisWeek' | 'later') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const totalTribsEarned = completedTasks.reduce((sum, task) => sum + task.tribs, 0);

  // 📂 Organisation des tâches par sections d'urgence (gardée de ton code)
  const organizeTasks = () => {
    const urgent: Task[] = [];
    const thisWeek: Task[] = [];
    const later: Task[] = [];

    pendingTasks.forEach(task => {
      if (!task.dueDate) {
        later.push(task);
        return;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const due = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
      
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        urgent.push(task);
      } else if (diffDays <= 6) {
        thisWeek.push(task);
      } else {
        later.push(task);
      }
    });

    return { urgent, thisWeek, later };
  };

  const { urgent, thisWeek, later } = organizeTasks();

  // 📅 Fonction pour afficher la date intelligemment (gardée de ton code)
  const formatCompletedTime = (completedDate?: Date, completedAt?: string) => {
    if (!completedDate) return completedAt;
    
    const today = new Date();
    const completed = new Date(completedDate);
    
    const isToday = today.toDateString() === completed.toDateString();
    
    if (isToday) {
      return completed.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      const diffTime = today.getTime() - completed.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Hier';
      } else if (diffDays === 2) {
        return 'Avant-hier';
      } else if (diffDays <= 6) {
        const dayName = completed.toLocaleDateString('fr-FR', { weekday: 'long' });
        return `${dayName} dernier`;
      } else {
        const currentYear = today.getFullYear();
        const completedYear = completed.getFullYear();
        
        if (currentYear === completedYear) {
          return completed.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit' 
          });
        } else {
          return completed.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit',
            year: '2-digit'
          });
        }
      }
    }
  };

  // 🎯 Fonction pour calculer l'urgence d'une tâche (gardée de ton code)
  const getTaskUrgency = (dueDate?: Date) => {
    if (!dueDate) return { text: 'Pas de limite', color: '#718096', emoji: '📋' };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return { 
        text: overdueDays === 1 ? 'En retard (hier)' : `En retard (${overdueDays}j)`,
        color: '#f56565', 
        emoji: '🔥' 
      };
    } else if (diffDays === 0) {
      return { text: 'Aujourd\'hui', color: '#ed8936', emoji: '⚡' };
    } else if (diffDays === 1) {
      return { text: 'Demain', color: '#ecc94b', emoji: '📅' };
    } else if (diffDays <= 6) {
      const dayName = due.toLocaleDateString('fr-FR', { weekday: 'long' });
      return { text: dayName, color: '#4a5568', emoji: '📆' };
    } else {
      const dateStr = due.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      return { text: dateStr, color: '#718096', emoji: '📋' };
    }
  };

  // 🎯 Fonction pour marquer une tâche comme terminée
  const completeTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const completionDate = new Date();
      const currentTime = completionDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Mettre à jour localement d'abord (UI réactive)
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                status: 'completed' as const, 
                completedAt: currentTime,
                completedDate: completionDate,
                dueDate: undefined
              }
            : t
        )
      );

      // Si connecté à Firebase, mettre à jour aussi
      if (familyId && isAuthenticated) {
        await tasksService.completeTask(familyId, taskId, familyMember?.id || 'user-001');
        
        // Attribution des Tribs
        if (task.assigneeId && updateTribs) {
          await updateTribs(task.assigneeId, task.tribs);
        }
      }

      // Feedback utilisateur
      Alert.alert(
        '🎉 Tâche terminée !', 
        `${task.assignee} a gagné +${task.tribs} Tribs !`, 
        [{ text: 'Super !', style: 'default' }]
      );

    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
      Alert.alert('❌ Erreur', 'Impossible de marquer la tâche comme terminée');
    }
  };

  // 🔄 Fonction pour remettre une tâche en cours
  const uncompleteTask = async (taskId: string) => {
    try {
      // Mettre à jour localement
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: 'pending' as const, 
                completedAt: undefined,
                completedDate: undefined,
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
              }
            : task
        )
      );

      // Si connecté à Firebase, mettre à jour aussi
      if (familyId && isAuthenticated) {
        await tasksService.uncompleteTask(familyId, taskId);
      }

    } catch (error) {
      console.error('❌ Erreur annulation tâche:', error);
      Alert.alert('❌ Erreur', 'Impossible de remettre la tâche en cours');
    }
  };

  // 🔄 Si loading
  if (loading || familyLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des tâches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#48bb78', '#38a169']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>✅ Tâches & Tribs</Text>
        <Text style={styles.headerSubtitle}>
          {familyData?.familyName || 'Famille'} • {urgent.length} urgent(es) • {pendingTasks.length} total
        </Text>
        {!isAuthenticated && (
          <Text style={styles.headerMode}>Mode démo - Connectez-vous pour synchroniser</Text>
        )}
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Statistiques des tâches */}
        <TaskStats
          urgentCount={urgent.length}
          pendingCount={pendingTasks.length}
          completedCount={completedTasks.length}
          totalTribsEarned={totalTribsEarned}
        />

        {/* Tâches URGENTES - Toujours visibles */}
        {urgent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 URGENT ({urgent.length})</Text>
            {urgent.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onComplete={completeTask}
                getTaskUrgency={getTaskUrgency}
              />
            ))}
          </View>
        )}

        {/* Tâches CETTE SEMAINE - Repliable */}
        {thisWeek.length > 0 && (
          <CollapsibleSection
            title="CETTE SEMAINE"
            tasks={thisWeek}
            isExpanded={expandedSections.thisWeek}
            onToggle={() => toggleSection('thisWeek')}
            emoji="📅"
            onCompleteTask={completeTask}
            getTaskUrgency={getTaskUrgency}
          />
        )}

        {/* Tâches PLUS TARD - Repliable */}
        {later.length > 0 && (
          <CollapsibleSection
            title="PLUS TARD"
            tasks={later}
            isExpanded={expandedSections.later}
            onToggle={() => toggleSection('later')}
            emoji="📋"
            onCompleteTask={completeTask}
            getTaskUrgency={getTaskUrgency}
          />
        )}

        {/* Liste des tâches terminées */}
        <CompletedTasksList
          completedTasks={completedTasks}
          pendingTasksCount={pendingTasks.length}
          onCompleteTask={completeTask}
          onUncompleteTask={uncompleteTask}
          getTaskUrgency={getTaskUrgency}
          formatCompletedTime={formatCompletedTime}
        />

        {/* Bouton ajouter tâche */}
        <TouchableOpacity style={styles.addTaskBtn}>
          <LinearGradient
            colors={['#FF8A80', '#7986CB']}
            style={styles.addTaskGradient}
          >
            <Text style={styles.addTaskIcon}>+</Text>
            <Text style={styles.addTaskText}>
              {isAuthenticated ? 'Ajouter une tâche' : 'Connectez-vous pour ajouter des tâches'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#4a5568',
  },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  
  headerMode: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  content: {
    flex: 1,
    padding: 20,
  },
  
  section: {
    marginBottom: 25,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 15,
  },
  
  addTaskBtn: {
    marginTop: 10,
    marginBottom: 20,
  },
  
  addTaskGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    gap: 8,
  },
  
  addTaskIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  
  addTaskText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  bottomSpacer: {
    height: 100,
  },
});