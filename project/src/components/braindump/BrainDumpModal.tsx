import React, { useState, useRef, useEffect } from 'react';
import { X, Save, PlusCircle, Brain, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useBrainDumpStore from '../../hooks/useBrainDumpStore';
import useTaskStore from '../../hooks/useTaskStore';
import { BrainDumpItem } from '../../types';

interface BrainDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BrainDumpModal: React.FC<BrainDumpModalProps> = ({ isOpen, onClose }) => {
  const [newItemText, setNewItemText] = useState('');
  const [selectedItem, setSelectedItem] = useState<BrainDumpItem | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const addItem = useBrainDumpStore(state => state.addItem);
  const updateItem = useBrainDumpStore(state => state.updateItem);
  const deleteItem = useBrainDumpStore(state => state.deleteItem);
  const markAsProcessed = useBrainDumpStore(state => state.markAsProcessed);
  const unprocessedItems = useBrainDumpStore(state => state.getUnprocessedItems());
  
  const addTask = useTaskStore(state => state.addTask);
  const categories = useTaskStore(state => state.categories);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemText.trim()) return;
    
    addItem(newItemText.trim());
    setNewItemText('');
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleCreateTask = (item: BrainDumpItem) => {
    // Create a new task from the brain dump item
    const newTask = {
      title: item.content,
      description: '',
      completed: false,
      priority: 'medium' as const,
      category: 'Personal',
      tags: [],
      difficulty: 3 as const,
      energyLevel: 'medium' as const,
      focusRequired: 'medium' as const,
      isRecurring: false,
    };
    
    // Add the task to the store
    addTask(newTask);
    
    // Mark the brain dump item as processed
    markAsProcessed(item.id);
    
    // Set selected item to null
    setSelectedItem(null);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <motion.div
        className="relative w-full max-w-xl rounded-lg bg-white shadow-xl dark:bg-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Brain Dump</h2>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Quickly capture your thoughts, ideas, and tasks without having to organize them right away.
          </p>
          
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                className="input flex-1 resize-none"
                placeholder="What's on your mind? Type anything here..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                rows={2}
              />
              <button
                type="submit"
                className="self-end rounded-md bg-accent-500 px-3 py-2 text-sm font-medium text-white hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={!newItemText.trim()}
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          </form>
          
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Unprocessed Thoughts</h3>
            
            <div className="max-h-56 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
              {unprocessedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500 dark:text-gray-400">
                  <Brain className="mb-2 h-8 w-8 opacity-30" />
                  <p>Your mind is clear! Add some thoughts above.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  <AnimatePresence>
                    {unprocessedItems.map((item) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        className={`group relative cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedItem?.id === item.id ? 'bg-gray-50 dark:bg-gray-700' : ''
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <p className="pr-8 text-sm text-gray-800 dark:text-gray-200">{item.content}</p>
                        <div className="absolute right-2 top-2 flex items-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateTask(item);
                            }}
                            title="Convert to task"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(item.id);
                              if (selectedItem?.id === item.id) {
                                setSelectedItem(null);
                              }
                            }}
                            title="Delete"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </div>
          
          {selectedItem && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
              <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">Process this thought</h3>
              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{selectedItem.content}</p>
              
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-primary-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => handleCreateTask(selectedItem)}
                >
                  <PlusCircle className="-ml-0.5 mr-2 h-4 w-4" />
                  Create Task
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-success-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
                  onClick={() => {
                    markAsProcessed(selectedItem.id);
                    setSelectedItem(null);
                  }}
                >
                  <CheckCircle2 className="-ml-0.5 mr-2 h-4 w-4" />
                  Mark Processed
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BrainDumpModal;