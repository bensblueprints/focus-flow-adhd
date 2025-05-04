import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  LayoutDashboard, 
  CheckSquare, 
  Timer, 
  CalendarClock,
  Settings as SettingsIcon,
  Brain,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import useFocusStore from '../../hooks/useFocusStore';
import useTaskStore from '../../hooks/useTaskStore';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const currentSession = useFocusStore(state => state.currentSession);
  const incompleteTasks = useTaskStore(state => 
    state.tasks.filter(task => !task.completed).length
  );
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { 
      name: 'Tasks', 
      path: '/tasks', 
      icon: <CheckSquare className="h-5 w-5" />,
      badge: incompleteTasks > 0 ? incompleteTasks : undefined
    },
    { 
      name: 'Focus Timer', 
      path: '/focus', 
      icon: <Timer className="h-5 w-5" />,
      highlight: !!currentSession
    },
    { name: 'Habit Tracker', path: '/habits', icon: <CalendarClock className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto bg-white pb-12 transition duration-300 ease-in-out dark:bg-gray-800 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-gray-900 dark:text-white"
            onClick={() => setIsOpen(false)}
          >
            <Zap className="h-6 w-6 text-primary-500" />
            <span className="text-xl font-bold">FocusFlow</span>
          </Link>
          
          <button
            type="button"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            onClick={() => setIsOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  } ${item.highlight ? 'animate-pulse text-accent-500 dark:text-accent-400' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-y-0 left-0 w-1 rounded-r-md bg-primary-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-xs font-medium text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
        
        {currentSession && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-green-50 p-4 dark:border-gray-700 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Focus Session Active</p>
                <Link 
                  to="/focus" 
                  className="mt-1 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  onClick={() => setIsOpen(false)}
                >
                  Return to timer →
                </Link>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;