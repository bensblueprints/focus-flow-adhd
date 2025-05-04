import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths } from 'date-fns';
import { 
  Plus, 
  CheckSquare, 
  Calendar, 
  Edit3, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
  Calendar as CalendarIcon,
  LayoutGrid,
  ListFilter,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useHabitStore from '../hooks/useHabitStore';
import HabitModal from '../components/habits/HabitModal';
import { Habit } from '../types';

type ViewMode = 'list' | 'grid' | 'calendar' | 'all';

const HabitTracker: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const habits = useHabitStore(state => state.habits);
  const categories = useHabitStore(state => state.categories);
  const markHabitComplete = useHabitStore(state => state.markHabitComplete);
  const markHabitIncomplete = useHabitStore(state => state.markHabitIncomplete);
  const isHabitCompletedForDate = useHabitStore(state => state.isHabitCompletedForDate);
  const deleteHabit = useHabitStore(state => state.deleteHabit);
  
  // Filter habits based on current filter settings
  const filteredHabits = habits.filter(habit => {
    if (filterCategory !== 'all' && habit.category !== filterCategory) return false;
    return true;
  });
  
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsAddModalOpen(true);
  };
  
  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingHabit(null);
  };
  
  const toggleHabitCompletion = (habitId: string, date = new Date()) => {
    if (isHabitCompletedForDate(habitId, date)) {
      markHabitIncomplete(habitId, date);
    } else {
      markHabitComplete(habitId, date);
    }
  };

  const renderAllHabits = () => {
    return (
      <div className="space-y-4">
        {filteredHabits.map(habit => {
          const isCompletedToday = isHabitCompletedForDate(habit.id, new Date());
          const completionRate = habit.completedDates.length > 0 
            ? Math.round((habit.completedDates.length / 30) * 100) 
            : 0;

          return (
            <div 
              key={habit.id}
              className={`rounded-lg border p-4 ${
                isCompletedToday
                  ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-10 w-1 rounded-full" 
                    style={{ backgroundColor: habit.color || '#3B82F6' }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{habit.title}</h3>
                    <div className="mt-1 flex items-center space-x-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{habit.frequency}</span>
                      {habit.streak > 0 && (
                        <span className="flex items-center text-amber-600 dark:text-amber-400">
                          <Flame className="mr-1 h-4 w-4" />
                          {habit.streak} day streak
                        </span>
                      )}
                      {habit.startTime && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {habit.startTime} - {habit.endTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className={`flex h-10 w-10 items-center justify-center rounded-md ${
                      isCompletedToday
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => toggleHabitCompletion(habit.id)}
                  >
                    {isCompletedToday ? <CheckSquare className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </button>
                  
                  <button
                    type="button"
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleEditHabit(habit)}
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>
                  
                  <button
                    type="button"
                    className="rounded-md p-2 text-gray-400 hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {habit.description && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{habit.description}</p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {habit.category && (
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {habit.category}
                    </span>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Completion rate: {completionRate}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    
    return (
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-8 gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
            <div className="px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400">Habit</div>
            {weekDays.map((day, index) => (
              <div key={index} className="px-2 py-1 text-center">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {format(day, 'EEE')}
                </p>
                <p className={`mt-1 text-sm font-semibold ${
                  isSameDay(day, new Date()) 
                    ? 'rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 pt-2">
            {filteredHabits.map(habit => (
              <div key={habit.id} className="grid grid-cols-8 gap-2">
                <div className="flex items-center px-2 py-1">
                  <div 
                    className="mr-2 h-3 w-3 rounded-full" 
                    style={{ backgroundColor: habit.color || '#3B82F6' }}
                  />
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {habit.title}
                  </span>
                </div>
                
                {weekDays.map((day, index) => (
                  <div key={index} className="flex items-center justify-center">
                    <button
                      type="button"
                      className={`flex h-8 w-8 items-center justify-center rounded-md ${
                        isHabitCompletedForDate(habit.id, day)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => toggleHabitCompletion(habit.id, day)}
                    >
                      {isHabitCompletedForDate(habit.id, day) && (
                        <CheckSquare className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {filteredHabits.map(habit => {
          const isCompletedToday = isHabitCompletedForDate(habit.id, new Date());
          
          return (
            <div 
              key={habit.id} 
              className={`rounded-lg border p-4 ${
                isCompletedToday
                  ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="mr-3 h-10 w-1 rounded-full" 
                    style={{ backgroundColor: habit.color || '#3B82F6' }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{habit.title}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="mr-2">{habit.frequency}</span>
                      {habit.streak > 0 && (
                        <span className="flex items-center text-amber-600 dark:text-amber-400">
                          <Flame className="mr-1 h-4 w-4" />
                          {habit.streak} day streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`flex h-10 w-10 items-center justify-center rounded-md ${
                      isCompletedToday
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => toggleHabitCompletion(habit.id)}
                  >
                    {isCompletedToday ? <CheckSquare className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </button>
                  
                  <button
                    type="button"
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleEditHabit(habit)}
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>
                  
                  <button
                    type="button"
                    className="rounded-md p-2 text-gray-400 hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {habit.description && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{habit.description}</p>
              )}
              
              {habit.category && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {habit.category}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredHabits.map(habit => {
          const isCompletedToday = isHabitCompletedForDate(habit.id, new Date());
          const completionRate = habit.completedDates.length > 0 
            ? Math.round((habit.completedDates.length / 30) * 100) 
            : 0;
          
          return (
            <div 
              key={habit.id} 
              className={`rounded-lg border p-4 ${
                isCompletedToday
                  ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: habit.color || '#3B82F6' }}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleEditHabit(habit)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  
                  <button
                    type="button"
                    className="rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="mb-1 font-medium text-gray-900 dark:text-white">{habit.title}</h3>
              
              {habit.category && (
                <span className="mb-2 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {habit.category}
                </span>
              )}
              
              <div className="mb-3 mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{habit.frequency}</span>
                {habit.streak > 0 && (
                  <span className="flex items-center text-amber-600 dark:text-amber-400">
                    <Flame className="mr-1 h-4 w-4" />
                    {habit.streak}
                  </span>
                )}
              </div>
              
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-2 rounded-full bg-green-500" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              
              <button
                type="button"
                className={`mt-2 flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${
                  isCompletedToday
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => toggleHabitCompletion(habit.id)}
              >
                {isCompletedToday ? (
                  <>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Mark Complete
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: monthEnd });
    
    while (days.length < 42) {
      days.push(addDays(days[days.length - 1], 1));
    }
    
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
          
          {days.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            
            // Count habits completed for this day
            const completedHabits = filteredHabits.filter(habit => 
              isHabitCompletedForDate(habit.id, day)
            ).length;
            
            const totalHabits = filteredHabits.length;
            const completionPercentage = totalHabits > 0 
              ? (completedHabits / totalHabits) * 100 
              : 0;
            
            return (
              <div
                key={i}
                className={`relative min-h-24 rounded-md border p-1 ${
                  isCurrentMonth
                    ? isToday
                      ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/10'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                    : 'border-gray-100 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-600'
                }`}
              >
                <div className="mb-1 text-right text-sm font-medium">
                  {format(day, 'd')}
                </div>
                
                {isCurrentMonth && (
                  <>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div 
                        className={`h-1.5 rounded-full ${
                          completionPercentage === 100
                            ? 'bg-green-500'
                            : completionPercentage > 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    
                    <div className="mt-1 text-xs">
                      {completedHabits > 0 && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <CheckSquare className="mr-1 h-3 w-3" />
                          {completedHabits}/{totalHabits}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-1 flex flex-wrap gap-1">
                      {filteredHabits.slice(0, 3).map(habit => (
                        isHabitCompletedForDate(habit.id, day) && (
                          <div 
                            key={habit.id}
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: habit.color || '#3B82F6' }}
                            title={habit.title}
                          />
                        )
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habit Tracker</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Build consistent routines to achieve your goals</p>
        </div>
        
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Habit
        </button>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
          <span className="mx-2 text-sm text-gray-500 dark:text-gray-400">View:</span>
          <div className="flex rounded-md bg-gray-100 p-1 dark:bg-gray-700">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setViewMode('list')}
            >
              <ListFilter className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${
                viewMode === 'all'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setViewMode('all')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
          <span className="mx-2 text-sm text-gray-500 dark:text-gray-400">Category:</span>
          <select
            className="rounded-md border-0 bg-transparent py-1 pl-2 pr-7 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as string | 'all')}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="rounded-md bg-white shadow-sm dark:bg-gray-800">
        <div className="p-4">
          {filteredHabits.length > 0 ? (
            <>
              {viewMode === 'list' && renderListView()}
              {viewMode === 'grid' && renderGridView()}
              {viewMode === 'calendar' && renderCalendarView()}
              {viewMode === 'all' && renderAllHabits()}
            </>
          ) : (
            <div className="py-20 text-center">
              <Zap className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No habits</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new habit.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Habit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <HabitModal 
        isOpen={isAddModalOpen} 
        onClose={closeModal} 
        habit={editingHabit} 
      />
    </div>
  );
};

export default HabitTracker;