import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { BrainDumpItem } from '../types';

interface BrainDumpState {
  items: BrainDumpItem[];
  
  // CRUD operations
  addItem: (content: string) => void;
  updateItem: (id: string, updates: Partial<Omit<BrainDumpItem, 'id' | 'createdAt'>>) => void;
  deleteItem: (id: string) => void;
  
  // Processing operations
  markAsProcessed: (id: string, taskId?: string) => void;
  markAsUnprocessed: (id: string) => void;
  
  // Filtering
  getUnprocessedItems: () => BrainDumpItem[];
  getProcessedItems: () => BrainDumpItem[];
}

const useBrainDumpStore = create<BrainDumpState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (content) => set((state) => ({
        items: [
          ...state.items,
          {
            id: uuidv4(),
            content,
            createdAt: new Date(),
            processed: false,
          }
        ]
      })),
      
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id 
            ? { ...item, ...updates } 
            : item
        )
      })),
      
      deleteItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),
      
      markAsProcessed: (id, taskId) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id 
            ? { ...item, processed: true, convertedToTaskId: taskId } 
            : item
        )
      })),
      
      markAsUnprocessed: (id) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id 
            ? { ...item, processed: false, convertedToTaskId: undefined } 
            : item
        )
      })),
      
      getUnprocessedItems: () => {
        return get().items.filter(item => !item.processed);
      },
      
      getProcessedItems: () => {
        return get().items.filter(item => item.processed);
      },
    }),
    {
      name: 'focus-flow-brain-dump',
    }
  )
);

export default useBrainDumpStore;