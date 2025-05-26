// src/types/task.ts
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Task {
  id: string;
  title: string;
  assignee: string;      // Nom affiché
  assigneeId: string;    // UID membre
  tribs: number;
  status: 'pending' | 'completed';
  color: string[];       // Dégradé carte
  difficulty?: Difficulty;
  dueDate?: Date;
  completedAt?: string;  // HH:MM (legacy)
  completedDate?: Date;  // Date JS
}
