import React, { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { Award, Trophy, Zap, Clock, Target, Brain, Gauge, TrendingUp, CheckSquare, Timer, Plus, ListTodo, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useFocusStore from '../hooks/useFocusStore';
import useTaskStore from '../hooks/useTaskStore';
import useHabitStore from '../hooks/useHabitStore';

type CalendarView = 'day' | 'week' | 'month';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [calendarView, setCalendarView] = useState<CalendarView>('day');
  const [currentDate, setCurrentDate] = useState(addDays(new Date(), 1)); // Start with tomorrow
  
  const totalFocusTime = useFocusStore(state => state.getTotalFocusTime());
  const averageSessionLength = useFocusStore(state => state.getAverageSessionLength());
  const averageDistractions = useFocusStore(state => state.getAverageDistractions());
  const recentAchievements = useFocusStore(state => state.getRecentAchievements());
  
  const tasks = useTaskStore(state => state.tasks);
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const habits = useHabitStore(state => state.habits);
  const isHabitCompletedForDate = useHabitStore(state => state.isHabitCompletedForDate);
  const markHabitComplete = useHabitStore(state => state.markHabitComplete);
  const markHabitIncomplete = useHabitStore(state => state.markHabitIncomplete);
  
  const toggleHabitCompletion = (habitId: string, date: Date) => {
    if (isHabitCompletedForDate(habitId, date)) {
      markHabitIncomplete(habitId, date);
    } else {
      markHabitComplete(habitId, date);
    }
  };

  // Generate time slots for the schedule
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  // Sort habits by start time
  const scheduledHabits = habits
    .filter(habit => habit.startTime)
    .sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      return a.startTime.localeCompare(b.startTime);
    });
  
  const navigateDate = (direction: 'prev' | 'next') => {
    switch (calendarView) {
      case 'day':
        setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : addDays(prev, -1));
        break;
      case 'week':
        setCurrentDate(prev => direction === 'next' ? addDays(prev, 7) : addDays(prev, -7));
        break;
      case 'month':
        setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
        break;
    }
  };
  
  const renderDayView = (date: Date) => {
    return (
      <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-[80px_1fr] divide-x divide-gray-200 dark:divide-gray-700">
          {/* Time slots */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {timeSlots.map(time => (
              <div key={time} className="h-16 px-2 py-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{time}</span>
              </div>
            ))}
          </div>
          
          {/* Schedule grid */}
          <div className="relative divide-y divide-gray-200 dark:divide-gray-700">
            {/* Time slots background */}
            {timeSlots.map(time => (
              <div key={time} className="h-16" />
            ))}
            
            {/* Habits */}
            {scheduledHabits.map(habit => {
              const [startHour, startMinute] = habit.startTime?.split(':') || [];
              const [endHour, endMinute] = habit.endTime?.split(':') || [];
              const startMinutes = parseInt(startHour) * 60 + parseInt(startMinute);
              const endMinutes = parseInt(endHour) * 60 + parseInt(endMinute);
              const duration = endMinutes - startMinutes;
              const isCompleted = isHabitCompletedForDate(habit.id, date);
              
              return (
                <div
                  key={habit.id}
                  className={`absolute left-0 right-2 rounded-md border px-2 py-1 ${
                    isCompleted
                      ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                  style={{
                    top: `${(startMinutes / (24 * 60)) * 100}%`,
                    height: `${(duration / (24 * 60)) * 100}%`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: habit.color || '#3B82F6' }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {habit.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleHabitCompletion(habit.id, date)}
                      className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                        isCompleted
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <CheckSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    
    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map(day => (
          <div key={day.toString()} className="space-y-2">
            <div className={`text-center ${
              isSameDay(day, new Date()) ? 'rounded-md bg-primary-50 p-1 dark:bg-primary-900/20' : ''
            }`}>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {format(day, 'EEE')}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {format(day, 'd')}
              </div>
            </div>
            
            <div className="space-y-1">
              {scheduledHabits.map(habit => {
                const isCompleted = isHabitCompletedForDate(habit.id, day);
                return (
                  <div
                    key={habit.id}
                    className={`rounded-md border px-2 py-1 text-sm ${
                      isCompleted
                        ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: habit.color || '#3B82F6' }}
                        />
                        <span className="truncate text-xs font-medium text-gray-900 dark:text-white">
                          {habit.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleHabitCompletion(habit.id, day)}
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderMonthView = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(start);
    const days = eachDayOfInterval({ start: startOfWeek(start, { weekStartsOn: 1 }), end });
    
    while (days.length < 42) {
      days.push(addDays(days[days.length - 1], 1));
    }
    
    return (
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
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          
          // Get habits for this day
          const dayHabits = scheduledHabits.filter(habit => {
            const isScheduledForDay = true; // You can add frequency check here
            return isScheduledForDay;
          });
          
          // Count completed habits
          const completedHabits = dayHabits.filter(habit => 
            isHabitCompletedForDate(habit.id, day)
          ).length;
          
          const totalHabits = dayHabits.length;
          const completionPercentage = totalHabits > 0 
            ? (completedHabits / totalHabits) * 100 
            : 0;
          
          return (
            <div
              key={i}
              className={`min-h-24 rounded-md border p-2 ${
                isCurrentMonth
                  ? isToday
                    ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/10'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  : 'border-gray-100 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-600'
              }`}
            >
              <div className="mb-2 text-right text-sm font-medium">
                {format(day, 'd')}
              </div>
              
              {isCurrentMonth && dayHabits.length > 0 && (
                <>
                  <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${
                        completionPercentage === 100
                          ? 'bg-green-500'
                          : completionPercentage > 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    {dayHabits.map(habit => {
                      const isCompleted = isHabitCompletedForDate(habit.id, day);
                      return (
                        <button
                          key={habit.id}
                          onClick={() => toggleHabitCompletion(habit.id, day)}
                          className="flex w-full items-center gap-1 rounded-sm px-1 py-0.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: habit.color || '#3B82F6' }}
                          />
                          <span className={`truncate ${
                            isCompleted 
                              ? 'text-green-600 line-through dark:text-green-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {habit.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">Track your productivity and progress</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          onClick={() => navigate('/focus')}
          className="flex items-center justify-center gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4 text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-900 dark:bg-primary-900/10 dark:text-primary-400 dark:hover:bg-primary-900/20"
        >
          <Timer className="h-5 w-5" />
          <span className="text-sm font-medium">Start Focus Timer</span>
        </button>

        <button
          onClick={() => navigate('/habits')}
          className="flex items-center justify-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 transition-colors hover:bg-green-100 dark:border-green-900 dark:bg-green-900/10 dark:text-green-400 dark:hover:bg-green-900/20"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium">Add a Habit</span>
        </button>

        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center justify-center gap-3 rounded-lg border border-accent-200 bg-accent-50 p-4 text-accent-700 transition-colors hover:bg-accent-100 dark:border-accent-900 dark:bg-accent-900/10 dark:text-accent-400 dark:hover:bg-accent-900/20"
        >
          <ListTodo className="h-5 w-5" />
          <span className="text-sm font-medium">Create a Task</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Focus Time Stats */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-primary-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Total Focus Time</h2>
              <p className="mt-1 text-2xl font-semibold text-primary-600 dark:text-primary-400">
                {Math.round(totalFocusTime / 60)}h {totalFocusTime % 60}m
              </p>
            </div>
          </div>
        </div>
        
        {/* Average Session Length */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Avg. Session Length</h2>
              <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                {averageSessionLength} min
              </p>
            </div>
          </div>
        </div>
        
        {/* Average Distractions */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Avg. Distractions</h2>
              <p className="mt-1 text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {averageDistractions}/session
              </p>
            </div>
          </div>
        </div>
        
        {/* Task Completion Rate */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Gauge className="h-6 w-6 text-accent-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Task Completion</h2>
              <p className="mt-1 text-2xl font-semibold text-accent-600 dark:text-accent-400">
                {completionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar Section */}
      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Schedule</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex rounded-md bg-gray-100 p-1 dark:bg-gray-700">
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm ${
                  calendarView === 'day'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setCalendarView('day')}
              >
                Day
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm ${
                  calendarView === 'week'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setCalendarView('week')}
              >
                Week
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm ${
                  calendarView === 'month'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setCalendarView('month')}
              >
                Month
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateDate('prev')}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {calendarView === 'day' && format(currentDate, 'MMMM d, yyyy')}
                {calendarView === 'week' && `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')}`}
                {calendarView === 'month' && format(currentDate, 'MMMM yyyy')}
              </span>
              <button
                type="button"
                onClick={() => navigateDate('next')}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {calendarView === 'day' && renderDayView(currentDate)}
        {calendarView === 'week' && renderWeekView()}
        {calendarView === 'month' && renderMonthView()}
      </div>
      
      {/* Achievements Section */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Achievements</h2>
          </div>
        </div>
        
        <div className="space-y-4">
          {recentAchievements.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20"
                >
                  <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/40">
                    {achievement.icon === 'Trophy' && <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                    {achievement.icon === 'Zap' && <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                    {achievement.icon === 'Clock' && <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-900 dark:text-amber-100">{achievement.title}</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{achievement.description}</p>
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      {format(new Date(achievement.earnedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No achievements yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Complete focus sessions to earn achievements
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;