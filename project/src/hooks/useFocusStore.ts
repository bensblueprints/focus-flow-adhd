import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { FocusSession, Distraction, Achievement } from '../types';
import { Award, Zap, Clock, Trophy } from 'lucide-react';

interface FocusState {
  sessions: FocusSession[];
  currentSession: FocusSession | null;
  achievements: Achievement[];
  
  // Session operations
  startSession: (taskId?: string) => void;
  endSession: (notes?: string, rating?: 1 | 2 | 3 | 4 | 5) => void;
  updateCurrentSession: (updates: Partial<Omit<FocusSession, 'id' | 'startTime'>>) => void;
  
  // Distraction tracking
  addDistraction: (description?: string) => void;
  
  // Achievement operations
  addAchievement: (achievement: Omit<Achievement, 'id' | 'earnedAt'>) => void;
  
  // Analytics
  getTotalFocusTime: () => number; // in minutes
  getAverageSessionLength: () => number; // in minutes
  getAverageDistractions: () => number; // per session
  getSessionsForDay: (day: Date) => FocusSession[];
  getRecentAchievements: () => Achievement[];
}

const checkAchievements = (session: FocusSession, state: FocusState): Achievement[] => {
  const newAchievements: Achievement[] = [];
  
  // No distractions achievement
  if (session.distractions.length === 0 && session.durationMinutes >= 25) {
    newAchievements.push({
      id: uuidv4(),
      type: 'no_distractions',
      title: 'Deep Focus',
      description: 'Completed a session without any distractions',
      earnedAt: new Date(),
      icon: 'Zap',
      level: 'gold'
    });
  }
  
  // Long session achievement
  if (session.durationMinutes >= 50) {
    newAchievements.push({
      id: uuidv4(),
      type: 'long_session',
      title: 'Marathon Focus',
      description: 'Maintained focus for over 50 minutes',
      earnedAt: new Date(),
      icon: 'Clock',
      level: 'gold'
    });
  }
  
  // Focus streak achievement
  const recentSessions = state.sessions
    .slice(-3)
    .filter(s => s.durationMinutes >= 25 && s.distractions.length <= 1);
  
  if (recentSessions.length >= 3) {
    newAchievements.push({
      id: uuidv4(),
      type: 'focus_streak',
      title: 'Focus Streak',
      description: 'Completed 3 productive sessions in a row',
      earnedAt: new Date(),
      icon: 'Trophy',
      level: 'gold'
    });
  }
  
  return newAchievements;
};

const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      achievements: [],
      
      startSession: (taskId) => set(() => {
        const startTime = new Date();
        return {
          currentSession: {
            id: uuidv4(),
            startTime,
            durationMinutes: 0,
            taskId,
            distractions: [],
          }
        };
      }),
      
      endSession: (notes, rating) => set((state) => {
        if (!state.currentSession) return state;
        
        const endTime = new Date();
        const durationMinutes = Math.round(
          (endTime.getTime() - new Date(state.currentSession.startTime).getTime()) / 60000
        );
        
        const completedSession = {
          ...state.currentSession,
          endTime,
          durationMinutes,
          notes,
          rating,
        };
        
        // Check for achievements
        const newAchievements = checkAchievements(completedSession, state);
        
        return {
          sessions: [...state.sessions, completedSession],
          currentSession: null,
          achievements: [...state.achievements, ...newAchievements],
        };
      }),
      
      updateCurrentSession: (updates) => set((state) => {
        if (!state.currentSession) return state;
        
        return {
          currentSession: {
            ...state.currentSession,
            ...updates,
          }
        };
      }),
      
      addDistraction: (description) => set((state) => {
        if (!state.currentSession) return state;
        
        const newDistraction: Distraction = {
          id: uuidv4(),
          timestamp: new Date(),
          description,
        };
        
        return {
          currentSession: {
            ...state.currentSession,
            distractions: [...state.currentSession.distractions, newDistraction],
          }
        };
      }),
      
      addAchievement: (achievement) => set((state) => ({
        achievements: [
          ...state.achievements,
          {
            ...achievement,
            id: uuidv4(),
            earnedAt: new Date(),
          }
        ]
      })),
      
      getTotalFocusTime: () => {
        const { sessions, currentSession } = get();
        
        let totalMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);
        
        if (currentSession && currentSession.startTime) {
          const startTimeDate = new Date(currentSession.startTime);
          const currentDuration = Math.round(
            (new Date().getTime() - startTimeDate.getTime()) / 60000
          );
          totalMinutes += currentDuration;
        }
        
        return totalMinutes;
      },
      
      getAverageSessionLength: () => {
        const { sessions } = get();
        if (sessions.length === 0) return 0;
        
        const totalMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);
        return Math.round(totalMinutes / sessions.length);
      },
      
      getAverageDistractions: () => {
        const { sessions } = get();
        if (sessions.length === 0) return 0;
        
        const totalDistractions = sessions.reduce(
          (total, session) => total + session.distractions.length, 0
        );
        return Math.round((totalDistractions / sessions.length) * 10) / 10;
      },
      
      getSessionsForDay: (day) => {
        const { sessions } = get();
        const targetDate = new Date(day);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        return sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= targetDate && sessionDate < nextDay;
        });
      },
      
      getRecentAchievements: () => {
        const { achievements } = get();
        return achievements
          .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
          .slice(0, 5);
      },
    }),
    {
      name: 'focus-flow-sessions',
    }
  )
);

export default useFocusStore;