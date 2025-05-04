import React, { useState } from 'react';
import { Plus, Filter, CheckSquare, X, Clock, Calendar, Edit3, Trash2, Tag, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useTaskStore from '../hooks/useTaskStore';
import useFocusStore from '../hooks/useFocusStore';
import TaskModal from '../components/tasks/TaskModal';
import { Task as TaskType } from '../types';
import { useNavigate } from 'react-router-dom';

const TasksPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<string | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  
  const navigate = useNavigate();
  const tasks = useTaskStore(state => state.tasks);
  const categories = useTaskStore(state => state.categories);
  const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const startSession = useFocusStore(state => state.startSession);
  
  // Filter tasks based on current filter settings
  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && task.completed) return false;
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-700/50';
    }
  };
  
  const handleEditTask = (task: TaskType) => {
    setEditingTask(task);
    setIsAddModalOpen(true);
  };
  
  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingTask(null);
  };

  const handleStartFocus = (taskId: string) => {
    startSession(taskId);
    navigate('/focus');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Manage your tasks and track your progress</p>
        </div>
        
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Task
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
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
        
        <div className="flex items-center rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
          <span className="mx-2 text-sm text-gray-500 dark:text-gray-400">Priority:</span>
          <select
            className="rounded-md border-0 bg-transparent py-1 pl-2 pr-7 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as string | 'all')}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        <button
          type="button"
          className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
            showCompleted 
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' 
              : 'bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30'
          }`}
          onClick={() => setShowCompleted(!showCompleted)}
        >
          <CheckSquare className="-ml-0.5 mr-2 h-4 w-4" />
          {showCompleted ? 'Hiding Completed' : 'Show Completed'}
        </button>
      </div>
      
      <div className="rounded-md bg-white shadow-sm dark:bg-gray-800">
        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <motion.li
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`group relative ${
                      task.completed ? 'bg-gray-50 dark:bg-gray-700/30' : ''
                    }`}
                  >
                    <div className="flex items-center px-4 py-4 sm:px-6">
                      <div className="flex min-w-0 flex-1 items-center">
                        <div className="mr-4 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleTaskCompletion(task.id)}
                            className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                              task.completed 
                                ? 'border-green-500 bg-green-100 dark:border-green-700 dark:bg-green-900/30' 
                                : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
                            }`}
                          >
                            {task.completed && <CheckSquare className="h-4 w-4 text-green-500 dark:text-green-400" />}
                          </button>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`truncate text-sm font-medium ${
                              task.completed 
                                ? 'text-gray-500 line-through dark:text-gray-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {task.title}
                            </p>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <span className="truncate">
                              <span className="mr-1.5 inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {task.category}
                              </span>
                              {task.tags.length > 0 && (
                                <span className="mr-1.5 inline-flex items-center text-xs">
                                  <Tag className="mr-1 h-3 w-3" />
                                  {task.tags.join(', ')}
                                </span>
                              )}
                              {task.estimatedMinutes && (
                                <span className="mr-1.5 inline-flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {task.estimatedMinutes} min
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!task.completed && (
                          <button
                            type="button"
                            onClick={() => handleStartFocus(task.id)}
                            className="rounded-md p-2 text-primary-500 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-primary-900/20"
                          >
                            <span className="sr-only">Start Focus Session</span>
                            <PlayCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEditTask(task)}
                          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        >
                          <span className="sr-only">Edit</span>
                          <Edit3 className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="rounded-md p-2 text-gray-400 hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <span className="sr-only">Delete</span>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))
              ) : (
                <li className="py-20 text-center">
                  <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating a new task.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      New Task
                    </button>
                  </div>
                </li>
              )}
            </AnimatePresence>
          </ul>
        </div>
      </div>
      
      <TaskModal 
        isOpen={isAddModalOpen} 
        onClose={closeModal} 
        task={editingTask} 
      />
    </div>
  );
};

export default TasksPage;