import React, { useState, useEffect } from 'react';
import { X, Save, Check, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import useHabitStore from '../../hooks/useHabitStore';
import { Habit } from '../../types';
import { syncToGoogleCalendar, syncToAppleCalendar } from '../../utils/calendar';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit | null;
}

const emptyHabit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'> = {
  title: '',
  description: '',
  frequency: 'daily',
  customFrequency: '',
  timeOfDay: '',
  startTime: '',
  endTime: '',
  calendarSync: false,
  calendarProvider: undefined,
  color: '#3B82F6',
  category: 'Health',
  reminderTime: '',
  difficulty: 3,
  motivation: '',
  icon: '',
};

const colorOptions = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F97316', // orange
  '#8B5CF6', // purple
  '#EF4444', // red
  '#F59E0B', // amber
  '#EC4899', // pink
  '#06B6D4', // cyan
];

const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, habit }) => {
  const [formData, setFormData] = useState<Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>>(
    { ...emptyHabit }
  );
  
  const addHabit = useHabitStore(state => state.addHabit);
  const updateHabit = useHabitStore(state => state.updateHabit);
  const categories = useHabitStore(state => state.categories);
  
  useEffect(() => {
    if (habit) {
      const { id, createdAt, streak, completedDates, ...habitData } = habit;
      setFormData(habitData);
    } else {
      setFormData({ ...emptyHabit });
    }
  }, [habit, isOpen]);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    const habitData = {
      ...formData,
    };
    
    if (habit) {
      // Update existing habit
      updateHabit(habit.id, habitData);
    } else {
      // Add new habit
      addHabit(habitData);
    }
    
    // Handle calendar sync if enabled
    if (habitData.calendarSync && habitData.calendarProvider && habitData.startTime && habitData.endTime) {
      try {
        if (habitData.calendarProvider === 'google') {
          await syncToGoogleCalendar([{
            id: habit?.id || 'new',
            title: habitData.title,
            startTime: habitData.startTime,
            endTime: habitData.endTime,
            description: habitData.description,
            type: 'habit',
            itemId: habit?.id || 'new'
          }]);
        } else if (habitData.calendarProvider === 'apple') {
          await syncToAppleCalendar([{
            id: habit?.id || 'new',
            title: habitData.title,
            startTime: habitData.startTime,
            endTime: habitData.endTime,
            description: habitData.description,
            type: 'habit',
            itemId: habit?.id || 'new'
          }]);
        }
      } catch (error) {
        console.error('Failed to sync with calendar:', error);
      }
    }
    
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <motion.div
        className="relative w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {habit ? 'Edit Habit' : 'Add New Habit'}
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
                  Habit Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Drink water, Meditate, Exercise..."
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
                  placeholder="Why is this habit important to you?"
                  rows={2}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="frequency" className="label">
                  Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  className="input"
                  value={formData.frequency}
                  onChange={handleChange}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              {formData.frequency === 'custom' && (
                <div className="form-group">
                  <label htmlFor="customFrequency" className="label">
                    Custom Frequency
                  </label>
                  <input
                    type="text"
                    id="customFrequency"
                    name="customFrequency"
                    className="input"
                    value={formData.customFrequency || ''}
                    onChange={handleChange}
                    placeholder="e.g., Monday, Wednesday, Friday"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="startTime" className="label">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    className="input"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="endTime" className="label">End Time</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    className="input"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="category" className="label">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="input"
                  value={formData.category || ''}
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
                <label className="label">Color</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 w-8 rounded-full ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    >
                      {formData.color === color && (
                        <Check className="mx-auto h-4 w-4 text-white" />
                      )}
                    </button>
                  ))}
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
                <label htmlFor="motivation" className="label">
                  Motivation (Why is this important?)
                </label>
                <textarea
                  id="motivation"
                  name="motivation"
                  className="input resize-none"
                  value={formData.motivation || ''}
                  onChange={handleChange}
                  placeholder="What will this habit help you achieve?"
                  rows={2}
                />
              </div>
              
              <div className="space-y-4 rounded-md bg-gray-50 p-4 dark:bg-gray-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Calendar Sync
                    </span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="calendarSync"
                      name="calendarSync"
                      className="checkbox"
                      checked={formData.calendarSync}
                      onChange={handleCheckboxChange}
                    />
                  </div>
                </div>
                
                {formData.calendarSync && (
                  <div className="form-group">
                    <label htmlFor="calendarProvider" className="label">
                      Calendar Provider
                    </label>
                    <select
                      id="calendarProvider"
                      name="calendarProvider"
                      className="input"
                      value={formData.calendarProvider || ''}
                      onChange={handleChange}
                    >
                      <option value="">Select a provider</option>
                      <option value="google">Google Calendar</option>
                      <option value="apple">Apple Calendar</option>
                    </select>
                  </div>
                )}
              </div>
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
              {habit ? 'Save Changes' : 'Add Habit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default HabitModal;