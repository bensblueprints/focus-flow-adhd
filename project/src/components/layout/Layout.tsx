import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TimerOverlay from '../timer/TimerOverlay';
import { useSettings } from '../../context/SettingsContext';
import useFocusStore from '../../hooks/useFocusStore';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useSettings();
  const currentSession = useFocusStore(state => state.currentSession);
  const endSession = useFocusStore(state => state.endSession);
  const [timeRemaining, setTimeRemaining] = useState(settings.defaultPomodoroLength * 60);
  const [isRunning, setIsRunning] = useState(true);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    if (currentSession) {
      endSession();
    }
    setIsRunning(false);
    setTimeRemaining(settings.defaultPomodoroLength * 60);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${settings.fontSize === 'small' ? 'text-sm' : settings.fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col lg:pl-64">
        <Header openSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        
        <footer className="border-t border-gray-200 bg-white py-3 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <p>FocusFlow - ADHD Productivity Tracker - &copy; {new Date().getFullYear()}</p>
        </footer>

        <TimerOverlay
          timeRemaining={timeRemaining}
          isRunning={isRunning}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
        />
      </div>
    </div>
  );
};

export default Layout;