// src/components/tasks/TasksScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import des composants
import TaskStats from './TaskStats';
import TaskItem from './TaskItem';
import CollapsibleSection from './CollapsibleSection';
import CompletedTasksList from './CompletedTasksList';

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

export default function TasksScreen() {
  // 🗃️ État principal des tâches
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Ranger sa chambre',
      assignee: 'Clémentine',
      tribs: 15,
      status: 'pending',
      color: ['#FF8A80', '#7986CB'],
      dueDate: new Date() // Aujourd'hui - urgent!
    },
    {
      id: 2,
      title: 'Faire ses devoirs',
      assignee: 'Clémentine',
      tribs: 25,
      status: 'completed',
      color: ['#FF8A80', '#7986CB'],
      completedAt: '16:30',
      completedDate: new Date() // Aujourd'hui
    },
    {
      id: 3,
      title: 'Nourrir le chat',
      assignee: 'Jacob',
      tribs: 10,
      status: 'pending',
      color: ['#FFCC80', '#A29BFE'],
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Demain
    },
    {
      id: 4,
      title: 'Mettre la table',
      assignee: 'Jacob',
      tribs: 8,
      status: 'completed',
      color: ['#FFCC80', '#A29BFE'],
      completedAt: '12:15',
      completedDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Hier
    },
    {
      id: 5,
      title: 'Réviser maths',
      assignee: 'Clémentine',
      tribs: 20,
      status: 'pending',
      color: ['#FF8A80', '#7986CB'],
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Hier - en retard!
    },
    {
      id: 6,
      title: 'Sortir la poubelle',
      assignee: 'Jacob',
      tribs: 5,
      status: 'pending',
      color: ['#FFCC80', '#A29BFE'],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Dans 3 jours
    },
    {
      id: 7,
      title: 'Préparer exposé histoire',
      assignee: 'Clémentine',
      tribs: 30,
      status: 'pending',
      color: ['#FF8A80', '#7986CB'],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // Dans 5 jours
    },
    {
      id: 8,
      title: 'Arroser les plantes',
      assignee: 'Jacob',
      tribs: 8,
      status: 'pending',
      color: ['#FFCC80', '#A29BFE'],
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // Dans 10 jours
    }
  ]);

  // 📂 État pour gérer les sections repliables
  const [expandedSections, setExpandedSections] = useState({
    thisWeek: false,
    later: false
  });

  // 🎯 Fonctions utilitaires
  const toggleSection = (section: 'thisWeek' | 'later') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const totalTribsEarned = completedTasks.reduce((sum, task) => sum + task.tribs, 0);

  // 📂 Organisation des tâches par sections d'urgence
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

      if (diffDays <= 1) { // En retard, aujourd'hui ou demain
        urgent.push(task);
      } else if (diffDays <= 6) { // Cette semaine
        thisWeek.push(task);
      } else { // Plus tard
        later.push(task);
      }
    });

    return { urgent, thisWeek, later };
  };

  const { urgent, thisWeek, later } = organizeTasks();

  // 📅 Fonction pour afficher la date intelligemment
  const formatCompletedTime = (completedDate?: Date, completedAt?: string) => {
    if (!completedDate) return completedAt; // Fallback pour les anciennes données
    
    const today = new Date();
    const completed = new Date(completedDate);
    
    // Vérifier si c'est le même jour
    const isToday = today.toDateString() === completed.toDateString();
    
    if (isToday) {
      // Aujourd'hui : afficher juste l'heure
      return completed.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      // Autre jour : calculer la différence
      const diffTime = today.getTime() - completed.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Hier';
      } else if (diffDays === 2) {
        return 'Avant-hier';
      } else if (diffDays <= 6) {
        // Cette semaine : jour + "dernier" pour clarifier
        const dayName = completed.toLocaleDateString('fr-FR', { weekday: 'long' });
        return `${dayName} dernier`;
      } else {
        // Plus ancien : date courte + année si différente
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

  // 🎯 Fonction pour calculer l'urgence d'une tâche
  const getTaskUrgency = (dueDate?: Date) => {
    if (!dueDate) return { text: 'Pas de limite', color: '#718096', emoji: '📋' };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      // En retard
      const overdueDays = Math.abs(diffDays);
      return { 
        text: overdueDays === 1 ? 'En retard (hier)' : `En retard (${overdueDays}j)`,
        color: '#f56565', 
        emoji: '🔥' 
      };
    } else if (diffDays === 0) {
      // Aujourd'hui
      return { text: 'Aujourd\'hui', color: '#ed8936', emoji: '⚡' };
    } else if (diffDays === 1) {
      // Demain
      return { text: 'Demain', color: '#ecc94b', emoji: '📅' };
    } else if (diffDays <= 6) {
      // Cette semaine
      const dayName = due.toLocaleDateString('fr-FR', { weekday: 'long' });
      return { text: dayName, color: '#4a5568', emoji: '📆' };
    } else {
      // Plus tard
      const dateStr = due.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      return { text: dateStr, color: '#718096', emoji: '📋' };
    }
  };

  // 🎯 Fonction pour marquer une tâche comme terminée
  const completeTask = (taskId: number) => {
    const completionDate = new Date();
    const currentTime = completionDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'completed' as const, 
              completedAt: currentTime,
              completedDate: completionDate,
              dueDate: undefined // Supprimer la deadline
            }
          : task
      )
    );

    // Feedback utilisateur
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      Alert.alert(
        '🎉 Tâche terminée !', 
        `${task.assignee} a gagné +${task.tribs} Tribs !`, 
        [{ text: 'Super !', style: 'default' }]
      );
    }
  };

  // 🔄 Fonction pour remettre une tâche en cours
  const uncompleteTask = (taskId: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'pending' as const, 
              completedAt: undefined,
              completedDate: undefined,
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Nouvelle deadline demain
            }
          : task
      )
    );
  };

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
          Famille Questroy • {urgent.length} urgent(es) • {pendingTasks.length} total
        </Text>
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
            <Text style={styles.addTaskText}>Ajouter une tâche</Text>
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