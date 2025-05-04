import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useTaskStore from '../../hooks/useTaskStore';
import { Task, Subtask } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

const emptyTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completionStreak' | 'subtasks'> = {
  title: '',
  description: '',
  completed: false,
  dueDate: undefined,
  priority: 'medium',
  category: 'Personal',
  estimatedMinutes: undefined,
  actualMinutes: undefined,
  notes: '',
  tags: [],
  difficulty: 3,
  reward: '',
  energyLevel: 'medium',
  focusRequired: 'medium',
  isRecurring: false,
  recurrencePattern: '',
};

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task }) => {
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completionStreak'>>(
    { ...emptyTask, subtasks: [] }
  );
  const [newTag, setNewTag] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  
  const addTask = useTaskStore(state => state.addTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const categories = useTaskStore(state => state.categories);
  const tags = useTaskStore(state => state.tags);
  const addSubtask = useTaskStore(state => state.addSubtask);
  const toggleSubtaskCompletion = useTaskStore(state => state.toggleSubtaskCompletion);
  const deleteSubtask = useTaskStore(state => state.deleteSubtask);
  
  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({ ...emptyTask, subtasks: [] });
    }
  }, [task, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  const handleAddTag = () => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()],
    }));
    
    setNewTag('');
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };
  
  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    if (task) {
      // For existing tasks, use the store method
      addSubtask(task.id, newSubtask.trim());
    } else {
      // For new tasks, update the form data
      setFormData(prev => ({
        ...prev,
        subtasks: [
          ...prev.subtasks,
          { id: `temp-${Date.now()}`, title: newSubtask.trim(), completed: false },
        ],
      }));
    }
    
    setNewSubtask('');
  };
  
  const handleToggleSubtask = (subtaskId: string) => {
    if (task) {
      // For existing tasks, use the store method
      toggleSubtaskCompletion(task.id, subtaskId);
    } else {
      // For new tasks, update the form data
      setFormData(prev => ({
        ...prev,
        subtasks: prev.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, completed: !subtask.completed } 
            : subtask
        ),
      }));
    }
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    if (task) {
      // For existing tasks, use the store method
      deleteSubtask(task.id, subtaskId);
    } else {
      // For new tasks, update the form data
      setFormData(prev => ({
        ...prev,
        subtasks: prev.subtasks.filter(subtask => subtask.id !== subtaskId),
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    if (task) {
      // Update existing task
      updateTask(task.id, formData);
    } else {
      // Add new task
      const { subtasks, ...taskData } = formData;
      addTask(taskData);
    }
    
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <motion.div
        className="relative w-full max-w-3xl rounded-lg bg-white shadow-xl dark:bg-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="title" className="label">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="What needs to be done?"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="input min-h-20 resize-none"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Add more details about this task"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="form-group">
                  <label htmlFor="category" className="label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="input"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority" className="label">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="input"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="form-group">
                  <label htmlFor="energyLevel" className="label">
                    Energy Level Required
                  </label>
                  <select
                    id="energyLevel"
                    name="energyLevel"
                    className="input"
                    value={formData.energyLevel}
                    onChange={handleChange}
                  >
                    <option value="low">Low (Do when tired)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Needs full focus)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="focusRequired" className="label">
                    Focus Required
                  </label>
                  <select
                    id="focusRequired"
                    name="focusRequired"
                    className="input"
                    value={formData.focusRequired}
                    onChange={handleChange}
                  >
                    <option value="low">Low (Can multitask)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Deep work)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="form-group">
                  <label htmlFor="estimatedMinutes" className="label">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="estimatedMinutes"
                    name="estimatedMinutes"
                    className="input"
                    value={formData.estimatedMinutes || ''}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="dueDate" className="label">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    className="input"
                    value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="difficulty" className="label">
                  Difficulty (1-5)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    id="difficulty"
                    name="difficulty"
                    min="1"
                    max="5"
                    step="1"
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                    value={formData.difficulty}
                    onChange={handleChange}
                  />
                  <span className="w-8 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formData.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="reward" className="label">
                  Reward (What you get when done)
                </label>
                <input
                  type="text"
                  id="reward"
                  name="reward"
                  className="input"
                  value={formData.reward || ''}
                  onChange={handleChange}
                  placeholder="e.g., 10 minutes of free time, play a game, etc."
                />
              </div>
              
              <div className="form-group">
                <label className="label">Tags</label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:bg-gray-500 focus:text-white focus:outline-none dark:hover:bg-gray-600"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <span className="sr-only">Remove {tag} tag</span>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    id="newTag"
                    className="input rounded-r-none"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    list="availableTags"
                  />
                  <datalist id="availableTags">
                    {tags
                      .filter(tag => !formData.tags.includes(tag))
                      .map(tag => (
                        <option key={tag} value={tag} />
                      ))}
                  </datalist>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    onClick={handleAddTag}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="label">Subtasks</label>
                <div className="mb-2 space-y-2">
                  {formData.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center rounded-md border border-gray-200 p-2 dark:border-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(subtask.id)}
                        className="checkbox mr-2"
                      />
                      <span className={`flex-1 text-sm ${subtask.completed ? 'text-gray-500 line-through dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {subtask.title}
                      </span>
                      <button
                        type="button"
                        className="ml-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    id="newSubtask"
                    className="input rounded-r-none"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a subtask"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    onClick={handleAddSubtask}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes" className="label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="input resize-none"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Any additional notes"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  className="checkbox"
                  checked={formData.isRecurring}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  This is a recurring task
                </label>
              </div>
              
              {formData.isRecurring && (
                <div className="form-group">
                  <label htmlFor="recurrencePattern" className="label">
                    Recurrence Pattern
                  </label>
                  <select
                    id="recurrencePattern"
                    name="recurrencePattern"
                    className="input"
                    value={formData.recurrencePattern || 'daily'}
                    onChange={handleChange}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Save className="-ml-0.5 mr-2 h-4 w-4" />
              {task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskModal;