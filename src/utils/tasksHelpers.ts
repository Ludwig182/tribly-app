// src/utils/tasksHelpers.ts - Version corrigée pour les dates
import { Timestamp } from 'firebase/firestore';
import { Task } from '../types/task';

// 🖌️ Renvoie un dégradé (array 2 couleurs) pour un membre
export const getMemberColor = (members: any[] | undefined, memberId: string, fallback = '#FF8A80'): string[] => {
  if (!members) return [fallback, fallback];
  const member = members.find((m: any) => m.id === memberId);
  return member?.color ? [member.color, member.color] : [fallback, fallback];
};

// 🔥 Urgence d'une tâche - VERSION CORRIGÉE
export const getTaskUrgency = (due?: Date | Timestamp) => {
  if (!due) return { text: 'Pas de limite', color: '#718096', emoji: '📋' };
  
  const dueDate = due instanceof Date ? due : new Date(due.seconds * 1000);
  
  // 🎯 CORRECTION : Comparer avec la date du jour (sans heure)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Minuit aujourd'hui
  
  const dueDateMidnight = new Date(dueDate);
  dueDateMidnight.setHours(0, 0, 0, 0); // Minuit du jour de deadline
  
  const diffMs = dueDateMidnight.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000)); // Arrondir au lieu de ceil

  if (diffDays < 0) return { text: `En retard (${Math.abs(diffDays)}j)`, color: '#e53e3e', emoji: '🔥' };
  if (diffDays === 0) return { text: 'Aujourd\'hui', color: '#ed8936', emoji: '⚡' };
  if (diffDays === 1) return { text: 'Demain', color: '#ecc94b', emoji: '📅' };
  if (diffDays <= 6) {
    const day = dueDate.toLocaleDateString('fr-FR', { weekday: 'long' });
    return { text: day, color: '#4a5568', emoji: '📆' };
  }
  const dateStr = dueDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  return { text: dateStr, color: '#4a5568', emoji: '🗓️' };
};

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

// 📋 Exemples hors-ligne (mode démo)
export const getExampleTasks = (currentUserId: string, currentUserName: string): Task[] => ([
  {
    id: 'demo-1',
    title: 'Ranger sa chambre',
    assignee: currentUserName,
    assigneeId: currentUserId,
    tribs: 15,
    status: 'pending',
    color: ['#FF8A80', '#7986CB'],
    difficulty: 'medium',
    dueDate: new Date()
  },
  {
    id: 'demo-2',
    title: 'Faire ses devoirs',
    assignee: currentUserName,
    assigneeId: currentUserId,
    tribs: 25,
    status: 'completed',
    color: ['#FF8A80', '#7986CB'],
    difficulty: 'hard',
    completedDate: new Date(),
    completedAt: '16:30'
  }
]);