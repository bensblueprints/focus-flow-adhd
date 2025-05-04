export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  notes?: string;
  tags: string[];
  subtasks: Subtask[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  reward?: string;
  energyLevel: 'low' | 'medium' | 'high';
  focusRequired: 'low' | 'medium' | 'high';
  isRecurring: boolean;
  recurrencePattern?: string;
  completionStreak: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  taskId?: string;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  distractions: Distraction[];
  pauseReason?: string;
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  type: 'focus_streak' | 'no_distractions' | 'long_session' | 'completion_streak';
  title: string;
  description: string;
  earnedAt: Date;
  icon: string;
  level: 'bronze' | 'silver' | 'gold';
}

export interface Distraction {
  id: string;
  timestamp: Date;
  description?: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: string;
  timeOfDay?: string;
  startTime?: string;
  endTime?: string;
  calendarSync: boolean;
  calendarProvider?: 'google' | 'apple';
  streak: number;
  color: string;
  category?: string;
  completedDates: Date[];
  reminderTime?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  motivation?: string;
  icon?: string;
}

export interface TimerState {
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  timeRemaining: number;
  isRunning: boolean;
  completedPomodoros: number;
}

export interface BrainDumpItem {
  id: string;
  content: string;
  createdAt: Date;
  processed: boolean;
  convertedToTaskId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  type: 'habit' | 'task';
  itemId: string;
}