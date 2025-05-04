import React, { useState } from 'react';
import { Menu, Bell, Sun, Moon, Settings as SettingsIcon, Music2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import BrainDumpButton from '../braindump/BrainDumpButton';
import MusicPlayer from '../music/MusicPlayer';

interface HeaderProps {
  openSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ openSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  
  // Helper function to get the page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/tasks')) return 'Tasks';
    if (path.startsWith('/focus')) return 'Focus Timer';
    if (path.startsWith('/habits')) return 'Habit Tracker';
    if (path.startsWith('/settings')) return 'Settings';
    
    return 'FocusFlow';
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            onClick={openSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <BrainDumpButton />
          
          <button
            type="button"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            onClick={() => setIsMusicPlayerOpen(true)}
          >
            <span className="sr-only">Music Player</span>
            <Music2 className="h-5 w-5" />
          </button>
          
          <button
            type="button"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            onClick={toggleTheme}
          >
            <span className="sr-only">Toggle theme</span>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <Link
            to="/settings"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <span className="sr-only">Settings</span>
            <SettingsIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
      
      <MusicPlayer isOpen={isMusicPlayerOpen} onClose={() => setIsMusicPlayerOpen(false)} />
    </header>
  );
};

export default Header;