import React, { createContext, useContext, useState, useEffect } from 'react';
import { Howl } from 'howler';

interface Settings {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  notificationSound: boolean;
  notificationSoundType: 'bell' | 'chime' | 'ding';
  defaultPomodoroLength: number;
  defaultBreakLength: number;
  defaultLongBreakLength: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  pomodorosUntilLongBreak: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  playNotificationSound: (type?: 'bell' | 'chime' | 'ding') => void;
}

const defaultSettings: Settings = {
  reduceMotion: false,
  highContrast: false,
  fontSize: 'medium',
  notificationSound: true,
  notificationSoundType: 'bell',
  defaultPomodoroLength: 25,
  defaultBreakLength: 5,
  defaultLongBreakLength: 15,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  pomodorosUntilLongBreak: 4,
};

const sounds = {
  bell: new Howl({
    src: ['https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3'],
    preload: true,
  }),
  chime: new Howl({
    src: ['https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3'],
    preload: true,
  }),
  ding: new Howl({
    src: ['https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3'],
    preload: true,
  }),
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Apply accessibility settings to document
    if (settings.reduceMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
    }
    
    if (settings.highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
    
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prevSettings) => ({ ...prevSettings, ...newSettings }));
  };

  const playNotificationSound = (type: 'bell' | 'chime' | 'ding' = settings.notificationSoundType) => {
    if (settings.notificationSound) {
      sounds[type].play();
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, playNotificationSound }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};