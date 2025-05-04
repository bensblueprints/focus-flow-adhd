import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import FocusTimer from './pages/FocusTimer';
import HabitTracker from './pages/HabitTracker';
import Settings from './pages/Settings';
import Registration from './pages/Registration';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">Loading FocusFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <SettingsProvider>
        <Routes>
          <Route path="/register" element={<Registration />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="focus" element={<FocusTimer />} />
            <Route path="habits" element={<HabitTracker />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;