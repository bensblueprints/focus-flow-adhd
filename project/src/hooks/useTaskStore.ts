import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Task, Subtask } from '../types';

interface TaskState {
  tasks: Task[];
  categories: string[];
  tags: string[];
  
  // Task CRUD operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completionStreak' | 'subtasks'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Subtask operations
  addSubtask: (taskId: string, title: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  
  // Category operations
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  
  // Tag operations
  addTag: (tag: string) => void;
  deleteTag: (tag: string) => void;
  addTagToTask: (taskId: string, tag: string) => void;
  removeTagFromTask: (taskId: string, tag: string) => void;
}

const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      categories: ['Work', 'Personal', 'Health', 'Learning', 'Errands'],
      tags: ['important', 'urgent', 'fun', 'creative', 'admin', 'social'],
      
      addTask: (task) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            ...task,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
            completionStreak: 0,
            subtasks: [],
            tags: task.tags || [],
          }
        ]
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === id 
            ? { ...task, ...updates, updatedAt: new Date() } 
            : task
        )
      })),
      
      toggleTaskCompletion: (id) => set((state) => {
        const task = state.tasks.find(t => t.id === id);
        if (!task) return state;
        
        const wasCompleted = task.completed;
        const newStreak = wasCompleted 
          ? task.completionStreak - 1 
          : task.completionStreak + 1;
        
        return {
          tasks: state.tasks.map((task) => 
            task.id === id 
              ? { 
                  ...task, 
                  completed: !task.completed, 
                  completionStreak: Math.max(0, newStreak),
                  updatedAt: new Date() 
                } 
              : task
          )
        };
      }),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id)
      })),
      
      addSubtask: (taskId, title) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === taskId 
            ? { 
                ...task, 
                subtasks: [
                  ...task.subtasks, 
                  { id: uuidv4(), title, completed: false }
                ],
                updatedAt: new Date()
              } 
            : task
        )
      })),
      
      updateSubtask: (taskId, subtaskId, title) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === taskId 
            ? { 
                ...task, 
                subtasks: task.subtasks.map(subtask => 
                  subtask.id === subtaskId
                    ? { ...subtask, title }
                    : subtask
                ),
                updatedAt: new Date()
              } 
            : task
        )
      })),
      
      toggleSubtaskCompletion: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === taskId 
            ? { 
                ...task, 
                subtasks: task.subtasks.map(subtask => 
                  subtask.id === subtaskId
                    ? { ...subtask, completed: !subtask.completed }
                    : subtask
                ),
                updatedAt: new Date()
              } 
            : task
        )
      })),
      
      deleteSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === taskId 
            ? { 
                ...task, 
                subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId),
                updatedAt: new Date()
              } 
            : task
        )
      })),
      
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category]
      })),
      
      deleteCategory: (category) => set((state) => ({
        categories: state.categories.filter(c => c !== category),
        tasks: state.tasks.map(task => 
          task.category === category 
            ? { ...task, category: 'Uncategorized', updatedAt: new Date() }
            : task
        )
      })),
      
      addTag: (tag) => set((state) => ({
        tags: [...state.tags, tag]
      })),
      
      deleteTag: (tag) => set((state) => ({
        tags: state.tags.filter(t => t !== tag),
        tasks: state.tasks.map(task => ({
          ...task,
          tags: task.tags.filter(t => t !== tag),
          updatedAt: new Date()
        }))
      })),
      
      addTagToTask: (taskId, tag) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId && !task.tags.includes(tag)
            ? { ...task, tags: [...task.tags, tag], updatedAt: new Date() }
            : task
        )
      })),
      
      removeTagFromTask: (taskId, tag) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId
            ? { ...task, tags: task.tags.filter(t => t !== tag), updatedAt: new Date() }
            : task
        )
      })),
    }),
    {
      name: 'focus-flow-tasks',
    }
  )
);

export default useTaskStore;