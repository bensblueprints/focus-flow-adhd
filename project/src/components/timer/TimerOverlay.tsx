import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Pause, Play, X } from 'lucide-react';
import useFocusStore from '../../hooks/useFocusStore';
import { formatTime } from '../../utils/time';

interface TimerOverlayProps {
  timeRemaining: number;
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const TimerOverlay: React.FC<TimerOverlayProps> = ({
  timeRemaining,
  isRunning,
  onPause,
  onResume,
  onStop,
}) => {
  const navigate = useNavigate();
  const currentSession = useFocusStore(state => state.currentSession);

  if (!currentSession) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
        <button
          onClick={() => navigate('/focus')}
          className="flex items-center gap-2 rounded-md bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/30"
        >
          <Timer className="h-4 w-4" />
          {formatTime(timeRemaining)}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={isRunning ? onPause : onResume}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          <button
            onClick={onStop}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerOverlay;