import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Habit } from '../types';
import { isSameDay, startOfDay, addDays } from 'date-fns';
import useTaskStore from './useTaskStore';

interface HabitState {
  habits: Habit[];
  categories: string[];
  
  // Habit CRUD operations
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  deleteHabit: (id: string) => void;
  
  // Habit tracking operations
  markHabitComplete: (id: string, date?: Date) => void;
  markHabitIncomplete: (id: string, date?: Date) => void;
  isHabitCompletedForDate: (id: string, date: Date) => boolean;
  
  // Category operations
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  
  // Task conversion
  convertHabitToTask: (habitId: string, date: Date) => void;
  generateTasksForHabits: () => void;
}

const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      categories: ['Health', 'Productivity', 'Personal', 'Learning'],
      
      addHabit: (habit) => {
        const { addTask } = useTaskStore.getState();
        
        set((state) => {
          const newHabit = {
            ...habit,
            id: uuidv4(),
            createdAt: new Date(),
            streak: 0,
            completedDates: [],
          };
          
          // Create initial task for tomorrow
          const tomorrow = addDays(new Date(), 1);
          addTask({
            title: habit.title,
            description: habit.description || '',
            completed: false,
            priority: 'medium',
            category: habit.category || 'Personal',
            tags: ['habit'],
            difficulty: habit.difficulty,
            energyLevel: 'medium',
            focusRequired: 'medium',
            isRecurring: true,
            recurrencePattern: habit.frequency,
            dueDate: tomorrow,
            estimatedMinutes: habit.startTime && habit.endTime 
              ? calculateDurationInMinutes(habit.startTime, habit.endTime)
              : undefined,
          });
          
          return {
            habits: [...state.habits, newHabit]
          };
        });
      },
      
      updateHabit: (id, updates) => {
        const { updateTask } = useTaskStore.getState();
        const tasks = useTaskStore.getState().tasks;
        
        set((state) => {
          // Find related tasks and update them
          const habitTasks = tasks.filter(task => 
            task.tags.includes('habit') && 
            task.title === state.habits.find(h => h.id === id)?.title
          );
          
          habitTasks.forEach(task => {
            updateTask(task.id, {
              title: updates.title,
              description: updates.description,
              category: updates.category,
              estimatedMinutes: updates.startTime && updates.endTime 
                ? calculateDurationInMinutes(updates.startTime, updates.endTime)
                : undefined,
            });
          });
          
          return {
            habits: state.habits.map((habit) => 
              habit.id === id 
                ? { ...habit, ...updates } 
                : habit
            )
          };
        });
      },
      
      deleteHabit: (id) => {
        const { deleteTask } = useTaskStore.getState();
        const tasks = useTaskStore.getState().tasks;
        
        set((state) => {
          const habit = state.habits.find(h => h.id === id);
          if (habit) {
            // Delete related tasks
            const habitTasks = tasks.filter(task => 
              task.tags.includes('habit') && 
              task.title === habit.title
            );
            habitTasks.forEach(task => deleteTask(task.id));
          }
          
          return {
            habits: state.habits.filter((habit) => habit.id !== id)
          };
        });
      },
      
      markHabitComplete: (id, date = new Date()) => {
        const { updateTask } = useTaskStore.getState();
        const tasks = useTaskStore.getState().tasks;
        
        set((state) => {
          const habit = state.habits.find(h => h.id === id);
          if (!habit) return state;
          
          const today = startOfDay(date);
          
          // Check if already completed for today
          if (habit.completedDates.some(d => isSameDay(new Date(d), today))) {
            return state;
          }
          
          // Mark related task as complete
          const relatedTask = tasks.find(task => 
            task.tags.includes('habit') && 
            task.title === habit.title &&
            task.dueDate && 
            isSameDay(new Date(task.dueDate), today)
          );
          
          if (relatedTask) {
            updateTask(relatedTask.id, { completed: true });
          }
          
          return {
            habits: state.habits.map((habit) => 
              habit.id === id 
                ? { 
                    ...habit, 
                    completedDates: [...habit.completedDates, today],
                    streak: habit.streak + 1
                  } 
                : habit
            )
          };
        });
      },
      
      markHabitIncomplete: (id, date = new Date()) => {
        const { updateTask } = useTaskStore.getState();
        const tasks = useTaskStore.getState().tasks;
        
        set((state) => {
          const habit = state.habits.find(h => h.id === id);
          if (!habit) return state;
          
          const today = startOfDay(date);
          
          // Check if completed for today
          if (!habit.completedDates.some(d => isSameDay(new Date(d), today))) {
            return state;
          }
          
          // Mark related task as incomplete
          const relatedTask = tasks.find(task => 
            task.tags.includes('habit') && 
            task.title === habit.title &&
            task.dueDate && 
            isSameDay(new Date(task.dueDate), today)
          );
          
          if (relatedTask) {
            updateTask(relatedTask.id, { completed: false });
          }
          
          return {
            habits: state.habits.map((habit) => 
              habit.id === id 
                ? { 
                    ...habit, 
                    completedDates: habit.completedDates.filter(d => !isSameDay(new Date(d), today)),
                    streak: Math.max(0, habit.streak - 1)
                  } 
                : habit
            )
          };
        });
      },
      
      isHabitCompletedForDate: (id, date) => {
        const habit = get().habits.find(h => h.id === id);
        if (!habit) return false;
        
        return habit.completedDates.some(d => isSameDay(new Date(d), date));
      },
      
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category]
      })),
      
      deleteCategory: (category) => set((state) => ({
        categories: state.categories.filter(c => c !== category),
        habits: state.habits.map(habit => 
          habit.category === category 
            ? { ...habit, category: undefined }
            : habit
        )
      })),
      
      convertHabitToTask: (habitId, date) => {
        const { addTask } = useTaskStore.getState();
        const habit = get().habits.find(h => h.id === habitId);
        
        if (habit) {
          addTask({
            title: habit.title,
            description: habit.description || '',
            completed: false,
            priority: 'medium',
            category: habit.category || 'Personal',
            tags: ['habit'],
            difficulty: habit.difficulty,
            energyLevel: 'medium',
            focusRequired: 'medium',
            isRecurring: true,
            recurrencePattern: habit.frequency,
            dueDate: date,
            estimatedMinutes: habit.startTime && habit.endTime 
              ? calculateDurationInMinutes(habit.startTime, habit.endTime)
              : undefined,
          });
        }
      },
      
      generateTasksForHabits: () => {
        const { addTask, tasks } = useTaskStore.getState();
        const habits = get().habits;
        const tomorrow = addDays(new Date(), 1);
        
        habits.forEach(habit => {
          // Check if task already exists for tomorrow
          const taskExists = tasks.some(task => 
            task.tags.includes('habit') && 
            task.title === habit.title &&
            task.dueDate && 
            isSameDay(new Date(task.dueDate), tomorrow)
          );
          
          if (!taskExists) {
            addTask({
              title: habit.title,
              description: habit.description || '',
              completed: false,
              priority: 'medium',
              category: habit.category || 'Personal',
              tags: ['habit'],
              difficulty: habit.difficulty,
              energyLevel: 'medium',
              focusRequired: 'medium',
              isRecurring: true,
              recurrencePattern: habit.frequency,
              dueDate: tomorrow,
              estimatedMinutes: habit.startTime && habit.endTime 
                ? calculateDurationInMinutes(habit.startTime, habit.endTime)
                : undefined,
            });
          }
        });
      },
    }),
    {
      name: 'focus-flow-habits',
    }
  )
);

// Helper function to calculate duration in minutes between two time strings (HH:mm)
function calculateDurationInMinutes(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
}

export default useHabitStore;