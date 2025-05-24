import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TasksScreen() {
  const tasks = [
    {
      id: 1,
      title: 'Ranger sa chambre',
      assignee: 'Clémentine',
      tribs: 15,
      status: 'pending',
      color: ['#FF8A80', '#7986CB'],
      dueTime: '18:00'
    },
    {
      id: 2,
      title: 'Faire ses devoirs',
      assignee: 'Clémentine',
      tribs: 25,
      status: 'completed',
      color: ['#FF8A80', '#7986CB'],
      completedAt: '16:30'
    },
    {
      id: 3,
      title: 'Nourrir le chat',
      assignee: 'Jacob',
      tribs: 10,
      status: 'pending',
      color: ['#FFCC80', '#A29BFE'],
      dueTime: '19:00'
    },
    {
      id: 4,
      title: 'Mettre la table',
      assignee: 'Jacob',
      tribs: 8,
      status: 'completed',
      color: ['#FFCC80', '#A29BFE'],
      completedAt: '12:15'
    }
  ];

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');

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
        <Text style={styles.headerSubtitle}>Famille Questroy • {pendingTasks.length} à faire</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingTasks.length}</Text>
            <Text style={styles.statLabel}>À faire</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Terminées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {completedTasks.reduce((sum, task) => sum + task.tribs, 0)}
            </Text>
            <Text style={styles.statLabel}>Tribs gagnés</Text>
          </View>
        </View>

        {/* Tâches en cours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Tâches en cours</Text>
          {pendingTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskAssignee}>👤 {task.assignee}</Text>
                </View>
                <View style={styles.taskRight}>
                  <LinearGradient
                    colors={task.color}
                    style={styles.tribsBadge}
                  >
                    <Text style={styles.tribsText}>{task.tribs} T</Text>
                  </LinearGradient>
                  <Text style={styles.dueTime}>⏰ {task.dueTime}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.completeBtn}>
                <Text style={styles.completeBtnText}>✓ Marquer comme terminé</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Tâches terminées */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎉 Tâches terminées aujourd'hui</Text>
          {completedTasks.map((task) => (
            <View key={task.id} style={[styles.taskCard, styles.taskCompleted]}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>{task.title}</Text>
                  <Text style={styles.taskAssignee}>👤 {task.assignee}</Text>
                </View>
                <View style={styles.taskRight}>
                  <LinearGradient
                    colors={task.color}
                    style={styles.tribsBadgeCompleted}
                  >
                    <Text style={styles.tribsText}>+{task.tribs} T</Text>
                  </LinearGradient>
                  <Text style={styles.completedTime}>✅ {task.completedAt}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

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
  
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#48bb78',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
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
  
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  taskCompleted: {
    opacity: 0.8,
    borderWidth: 1,
    borderColor: '#48bb78',
  },
  
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  taskInfo: {
    flex: 1,
  },
  
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#4a5568',
  },
  
  taskAssignee: {
    fontSize: 12,
    color: '#4a5568',
  },
  
  taskRight: {
    alignItems: 'flex-end',
  },
  
  tribsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  
  tribsBadgeCompleted: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  
  tribsText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  
  dueTime: {
    fontSize: 11,
    color: '#f56565',
    fontWeight: '500',
  },
  
  completedTime: {
    fontSize: 11,
    color: '#48bb78',
    fontWeight: '500',
  },
  
  completeBtn: {
    backgroundColor: '#f0fff4',
    borderWidth: 1,
    borderColor: '#48bb78',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  
  completeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48bb78',
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