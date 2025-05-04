import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Monitor, Palette, Clock, Sparkles, Gauge, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const { settings, updateSettings, playNotificationSound } = useSettings();
  const { theme, setTheme } = useTheme();
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    updateSettings({ [name]: checked });
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateSettings({ [name]: value });
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSettings({ [name]: parseInt(value, 10) });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">Customize your productivity experience</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Appearance Settings */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h2>
          </div>
          
          <div className="space-y-4">
            <div className="form-group">
              <label className="label">Theme</label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 ${
                    theme === 'light'
                      ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-500 dark:bg-primary-900/10 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </button>
                <button
                  type="button"
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 ${
                    theme === 'dark'
                      ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-500 dark:bg-primary-900/10 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="fontSize" className="label">Font Size</label>
              <select
                id="fontSize"
                name="fontSize"
                className="input"
                value={settings.fontSize}
                onChange={handleSelectChange}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="reduceMotion"
                  name="reduceMotion"
                  type="checkbox"
                  className="checkbox"
                  checked={settings.reduceMotion}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="reduceMotion" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Reduce motion
                </label>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Minimizes animations</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="highContrast"
                  name="highContrast"
                  type="checkbox"
                  className="checkbox"
                  checked={settings.highContrast}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="highContrast" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  High contrast
                </label>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Improves readability</span>
            </div>
          </div>
        </motion.div>
        
        {/* Notification Settings */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="notificationSound"
                  name="notificationSound"
                  type="checkbox"
                  className="checkbox"
                  checked={settings.notificationSound}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="notificationSound" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Timer sounds
                </label>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Play sound when timer ends</span>
            </div>

            {settings.notificationSound && (
              <div className="space-y-3 rounded-md bg-gray-50 p-3 dark:bg-gray-700/30">
                <div className="form-group">
                  <label htmlFor="notificationSoundType" className="label">Sound Type</label>
                  <select
                    id="notificationSoundType"
                    name="notificationSoundType"
                    className="input"
                    value={settings.notificationSoundType}
                    onChange={handleSelectChange}
                  >
                    <option value="bell">Bell</option>
                    <option value="chime">Chime</option>
                    <option value="ding">Ding</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Preview sound:</span>
                  <button
                    type="button"
                    onClick={() => playNotificationSound(settings.notificationSoundType)}
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-500"
                  >
                    <Volume2 className="h-4 w-4" />
                    Play
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Timer Settings */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Timer</h2>
          </div>
          
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="defaultPomodoroLength" className="label">
                Focus Session Length (minutes)
              </label>
              <input
                type="number"
                id="defaultPomodoroLength"
                name="defaultPomodoroLength"
                className="input"
                min="1"
                max="60"
                value={settings.defaultPomodoroLength}
                onChange={handleNumberChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="defaultBreakLength" className="label">
                Short Break Length (minutes)
              </label>
              <input
                type="number"
                id="defaultBreakLength"
                name="defaultBreakLength"
                className="input"
                min="1"
                max="30"
                value={settings.defaultBreakLength}
                onChange={handleNumberChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="defaultLongBreakLength" className="label">
                Long Break Length (minutes)
              </label>
              <input
                type="number"
                id="defaultLongBreakLength"
                name="defaultLongBreakLength"
                className="input"
                min="1"
                max="60"
                value={settings.defaultLongBreakLength}
                onChange={handleNumberChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="pomodorosUntilLongBreak" className="label">
                Focus Sessions Until Long Break
              </label>
              <input
                type="number"
                id="pomodorosUntilLongBreak"
                name="pomodorosUntilLongBreak"
                className="input"
                min="1"
                max="10"
                value={settings.pomodorosUntilLongBreak}
                onChange={handleNumberChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="autoStartBreaks"
                  name="autoStartBreaks"
                  type="checkbox"
                  className="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="autoStartBreaks" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Auto-start breaks
                </label>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Automatically start breaks</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="autoStartPomodoros"
                  name="autoStartPomodoros"
                  type="checkbox"
                  className="checkbox"
                  checked={settings.autoStartPomodoros}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="autoStartPomodoros" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Auto-start focus sessions
                </label>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Automatically start next focus session</span>
            </div>
          </div>
        </motion.div>
        
        {/* About Section */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">About</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">FocusFlow</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Version 0.1.0</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                An ADHD-friendly productivity tracker designed to help you manage tasks, build habits, and improve focus.
              </p>
            </div>
            
            <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700/30">
              <h4 className="font-medium text-gray-900 dark:text-white">Feature Suggestions?</h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Have an idea for how to make FocusFlow better for ADHD brains? Let us know!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;