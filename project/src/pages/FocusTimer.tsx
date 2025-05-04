import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw, PlayCircle, CheckCircle, AlertTriangle, Brain, Timer, Plus, XCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import useFocusStore from '../hooks/useFocusStore';
import useTaskStore from '../hooks/useTaskStore';

enum TimerMode {
  Pomodoro = 'pomodoro',
  ShortBreak = 'shortBreak',
  LongBreak = 'longBreak',
}

type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

const FocusTimer: React.FC = () => {
  const { settings } = useSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [timerMode, setTimerMode] = useState<TimerMode>(TimerMode.Pomodoro);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.defaultPomodoroLength * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);
  const [distractionText, setDistractionText] = useState<string>('');
  const [pauseReason, setPauseReason] = useState<string>('');
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  
  const currentSession = useFocusStore(state => state.currentSession);
  const startSession = useFocusStore(state => state.startSession);
  const endSession = useFocusStore(state => state.endSession);
  const addDistraction = useFocusStore(state => state.addDistraction);
  const updateCurrentSession = useFocusStore(state => state.updateCurrentSession);
  
  const tasks = useTaskStore(state => state.tasks.filter(task => !task.completed));
  
  useEffect(() => {
    // Set timer duration based on current mode and settings
    if (timerStatus === 'idle') {
      switch (timerMode) {
        case TimerMode.Pomodoro:
          setTimeRemaining(settings.defaultPomodoroLength * 60);
          break;
        case TimerMode.ShortBreak:
          setTimeRemaining(settings.defaultBreakLength * 60);
          break;
        case TimerMode.LongBreak:
          setTimeRemaining(settings.defaultLongBreakLength * 60);
          break;
      }
    }
  }, [timerMode, settings, timerStatus]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerStatus === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && timerStatus === 'running') {
      setTimerStatus('completed');
      playSound();
      
      if (timerMode === TimerMode.Pomodoro) {
        const newCompletedPomodoros = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedPomodoros);
        
        // Check if we should take a long break
        if (newCompletedPomodoros % settings.pomodorosUntilLongBreak === 0) {
          setTimeout(() => {
            if (settings.autoStartBreaks) {
              setTimerMode(TimerMode.LongBreak);
              setTimerStatus('running');
            } else {
              setTimerMode(TimerMode.LongBreak);
              setTimerStatus('idle');
            }
          }, 1500);
        } else {
          setTimeout(() => {
            if (settings.autoStartBreaks) {
              setTimerMode(TimerMode.ShortBreak);
              setTimerStatus('running');
            } else {
              setTimerMode(TimerMode.ShortBreak);
              setTimerStatus('idle');
            }
          }, 1500);
        }
      } else {
        // After a break, go back to pomodoro
        setTimeout(() => {
          if (settings.autoStartPomodoros) {
            setTimerMode(TimerMode.Pomodoro);
            setTimerStatus('running');
          } else {
            setTimerMode(TimerMode.Pomodoro);
            setTimerStatus('idle');
          }
        }, 1500);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus, timeRemaining, timerMode, completedPomodoros, settings]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTimerModeLabel = (mode: TimerMode): string => {
    switch (mode) {
      case TimerMode.Pomodoro:
        return 'Focus Time';
      case TimerMode.ShortBreak:
        return 'Short Break';
      case TimerMode.LongBreak:
        return 'Long Break';
    }
  };
  
  const playSound = () => {
    if (settings.notificationSound && audioRef.current) {
      audioRef.current.play().catch(error => console.error('Error playing sound:', error));
    }
  };
  
  const handleStartTimer = () => {
    if (timerStatus === 'idle' || timerStatus === 'paused') {
      setTimerStatus('running');
      
      if (timerStatus === 'idle' && timerMode === TimerMode.Pomodoro) {
        startSession(selectedTaskId);
      }
    }
  };
  
  const handlePauseTimer = () => {
    if (timerStatus === 'running') {
      setTimerStatus('paused');
      setShowPauseDialog(true);
    }
  };

  const handlePauseSubmit = () => {
    if (currentSession && pauseReason.trim()) {
      addDistraction(pauseReason);
      updateCurrentSession({ pauseReason });
      setPauseReason('');
      setShowPauseDialog(false);
    }
  };
  
  const handleResetTimer = () => {
    setTimerStatus('idle');
    setShowPauseDialog(false);
    setPauseReason('');
    
    switch (timerMode) {
      case TimerMode.Pomodoro:
        setTimeRemaining(settings.defaultPomodoroLength * 60);
        break;
      case TimerMode.ShortBreak:
        setTimeRemaining(settings.defaultBreakLength * 60);
        break;
      case TimerMode.LongBreak:
        setTimeRemaining(settings.defaultLongBreakLength * 60);
        break;
    }
    
    if (currentSession && timerMode === TimerMode.Pomodoro) {
      endSession();
    }
  };
  
  const handleSkipTimer = () => {
    setTimerStatus('idle');
    
    if (timerMode === TimerMode.Pomodoro) {
      setTimerMode(TimerMode.ShortBreak);
      
      if (currentSession) {
        endSession();
      }
    } else {
      setTimerMode(TimerMode.Pomodoro);
    }
  };
  
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
  };
  
  const handleAddDistraction = () => {
    if (currentSession && timerStatus === 'running') {
      addDistraction(distractionText);
      setDistractionText('');
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = (): number => {
    let totalTime;
    
    switch (timerMode) {
      case TimerMode.Pomodoro:
        totalTime = settings.defaultPomodoroLength * 60;
        break;
      case TimerMode.ShortBreak:
        totalTime = settings.defaultBreakLength * 60;
        break;
      case TimerMode.LongBreak:
        totalTime = settings.defaultLongBreakLength * 60;
        break;
    }
    
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };
  
  const progress = calculateProgress();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <audio ref={audioRef} preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      {/* Timer Section */}
      <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-6 flex justify-center space-x-2">
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              timerMode === TimerMode.Pomodoro
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => {
              if (timerMode !== TimerMode.Pomodoro) {
                setTimerMode(TimerMode.Pomodoro);
                setTimerStatus('idle');
              }
            }}
          >
            Focus
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              timerMode === TimerMode.ShortBreak
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => {
              if (timerMode !== TimerMode.ShortBreak) {
                setTimerMode(TimerMode.ShortBreak);
                setTimerStatus('idle');
              }
            }}
          >
            Short Break
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              timerMode === TimerMode.LongBreak
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => {
              if (timerMode !== TimerMode.LongBreak) {
                setTimerMode(TimerMode.LongBreak);
                setTimerStatus('idle');
              }
            }}
          >
            Long Break
          </button>
        </div>
        
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            {getTimerModeLabel(timerMode)}
            {timerMode === TimerMode.Pomodoro && completedPomodoros > 0 && (
              <span className="ml-2 rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                Pomodoro #{completedPomodoros}
              </span>
            )}
          </h2>
          
          <div className="relative mx-auto mb-6 h-64 w-64">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="fill-none stroke-gray-200 dark:stroke-gray-700"
                cx="50"
                cy="50"
                r="42"
                strokeWidth="8"
              />
              
              {/* Progress circle */}
              <motion.circle
                className={`fill-none ${
                  timerMode === TimerMode.Pomodoro
                    ? 'stroke-primary-500'
                    : timerMode === TimerMode.ShortBreak
                    ? 'stroke-green-500'
                    : 'stroke-blue-500'
                }`}
                cx="50"
                cy="50"
                r="42"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - (264 * progress) / 100 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Timer text */}
              <text
                x="50"
                y="50"
                dy="0.35em"
                textAnchor="middle"
                className="fill-gray-900 text-3xl font-bold dark:fill-white"
              >
                {formatTime(timeRemaining)}
              </text>
            </svg>
            
            {/* Status indicator */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform rounded-md bg-white px-3 py-1 text-sm font-medium shadow-md dark:bg-gray-700">
              {timerStatus === 'running' && (
                <span className="flex items-center text-green-500">
                  <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                  Running
                </span>
              )}
              {timerStatus === 'paused' && (
                <span className="flex items-center text-yellow-500">
                  <Pause className="mr-1 h-3 w-3" />
                  Paused
                </span>
              )}
              {timerStatus === 'completed' && (
                <span className="flex items-center text-blue-500">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </span>
              )}
              {timerStatus === 'idle' && (
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <Timer className="mr-1 h-3 w-3" />
                  Ready
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            {timerStatus === 'running' ? (
              <button
                type="button"
                className="inline-flex items-center rounded-full bg-gray-200 p-3 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={handlePauseTimer}
              >
                <Pause className="h-6 w-6" />
              </button>
            ) : (
              <button
                type="button"
                className={`inline-flex items-center rounded-full p-3 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  timerMode === TimerMode.Pomodoro
                    ? 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500'
                    : timerMode === TimerMode.ShortBreak
                    ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                    : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
                }`}
                onClick={handleStartTimer}
              >
                <Play className="h-6 w-6" />
              </button>
            )}
            
            <button
              type="button"
              className="inline-flex items-center rounded-full bg-gray-200 p-3 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={handleResetTimer}
            >
              <RotateCcw className="h-6 w-6" />
            </button>
            
            <button
              type="button"
              className="inline-flex items-center rounded-full bg-gray-200 p-3 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={handleSkipTimer}
            >
              <SkipForward className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {timerMode === TimerMode.Pomodoro && (
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/30">
            <h3 className="mb-3 flex items-center font-medium text-gray-900 dark:text-white">
              <PlayCircle className="mr-2 h-5 w-5 text-primary-500" />
              What are you focusing on?
            </h3>
            
            <div className="mb-4 max-h-40 overflow-y-auto">
              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className={`cursor-pointer rounded-md border p-3 transition-colors ${
                        selectedTaskId === task.id
                          ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                          : 'border-gray-200 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600/30'
                      }`}
                      onClick={() => handleTaskSelect(task.id)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {task.category}
                        {task.estimatedMinutes && ` • ${task.estimatedMinutes} min`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <PlayCircle className="mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">No tasks available.</p>
                  <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Create a task to track what you're focusing on.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Distraction Tracker Section */}
      {timerMode === TimerMode.Pomodoro && timerStatus === 'running' && (
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-4 flex items-center font-medium text-gray-900 dark:text-white">
            <Brain className="mr-2 h-5 w-5 text-accent-500" />
            Distraction Tracker
          </h3>
          
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              What distracted you? (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Thought about checking email..."
                className="input flex-1"
                value={distractionText}
                onChange={(e) => setDistractionText(e.target.value)}
              />
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-accent-500 px-4 py-2 text-white hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
                onClick={handleAddDistraction}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </button>
            </div>
          </div>
          
          {currentSession && currentSession.distractions.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Session Distractions:
              </h4>
              <ul className="space-y-2">
                <AnimatePresence>
                  {currentSession.distractions.map((distraction) => (
                    <motion.li
                      key={distraction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center rounded-md bg-gray-50 p-2 text-sm text-gray-700 dark:bg-gray-700/30 dark:text-gray-300"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4 text-accent-500" />
                      <span className="flex-1">
                        {distraction.description || "Distraction recorded"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(distraction.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Pause Dialog */}
      {showPauseDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Why did you pause?</h3>
              <button
                onClick={() => setShowPauseDialog(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <textarea
              className="input mb-4 w-full resize-none"
              rows={3}
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="What interrupted your focus?"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPauseDialog(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePauseSubmit}
                className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimer;