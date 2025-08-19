import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  playNotificationSound, 
  showBrowserNotification, 
  requestNotificationPermission 
} from '../lib/notifications';

interface Activity {
  id: string;
  name: string;
  createdAt: Date;
}

interface Settings {
  defaultWorkTime: number; // in minutes
  defaultBreakTime: number; // in minutes
  notificationType: 'sound' | 'browser' | 'none';
  theme: 'light' | 'dark' | 'system';
  autoStartBreak: boolean;
}

interface TimerStore {
  // Timer state
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  isPaused: boolean;
  
  // Activity state
  currentActivity: Activity | null;
  activities: Activity[];
  
  // Settings state
  settings: Settings;
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setCustomTime: (minutes: number) => void;
  setCustomTimeMs: (milliseconds: number) => void;
  tick: () => void;
  
  // Activity actions
  createActivity: (name: string) => void;
  selectActivity: (activity: Activity | null) => void;
  deleteActivity: (id: string) => void;
  clearAllActivities: () => void;
  editActivity: (id: string, name: string) => void;
  
  // Settings actions
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  testNotification: () => void;
  applyTheme: () => void;
}

const DEFAULT_WORK_TIME = 25; // 25 minutes
const DEFAULT_BREAK_TIME = 5; // 5 minutes

const DEFAULT_SETTINGS: Settings = {
  defaultWorkTime: DEFAULT_WORK_TIME,
  defaultBreakTime: DEFAULT_BREAK_TIME,
  notificationType: 'sound',
  theme: 'system',
  autoStartBreak: false,
};

// Notification functions are imported from ../lib/notifications

// Theme management
let systemThemeListener: MediaQueryList | null = null;

const applyThemeToDocument = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;
  
  // Remove any existing system theme listener
  if (systemThemeListener) {
    systemThemeListener.removeEventListener('change', handleSystemThemeChange);
    systemThemeListener = null;
  }
  
  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemPrefersDark = mediaQuery.matches;
    root.classList.toggle('dark', systemPrefersDark);
    
    // Add listener for system theme changes
    systemThemeListener = mediaQuery;
    systemThemeListener.addEventListener('change', handleSystemThemeChange);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
};

const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  document.documentElement.classList.toggle('dark', e.matches);
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      // Timer state
      timeRemaining: DEFAULT_WORK_TIME * 60 * 1000,
      totalTime: DEFAULT_WORK_TIME * 60 * 1000,
      isRunning: false,
      isPaused: false,
      
      // Activity state
      currentActivity: null,
      activities: [],
      
      // Settings state
      settings: DEFAULT_SETTINGS,

      startTimer: () => set({ isRunning: true, isPaused: false }),
      
      pauseTimer: () => set({ isRunning: false, isPaused: true }),
      
      resetTimer: () => {
        const { totalTime } = get();
        set({ 
          timeRemaining: totalTime, 
          isRunning: false, 
          isPaused: false 
        });
      },
      
      stopTimer: () => {
        set({ 
          isRunning: false, 
          isPaused: false 
        });
      },
      
      setCustomTime: (minutes: number) => {
        const timeInMs = minutes * 60 * 1000;
        set({ 
          timeRemaining: timeInMs, 
          totalTime: timeInMs,
          isRunning: false, 
          isPaused: false 
        });
      },

      setCustomTimeMs: (milliseconds: number) => {
        set({ 
          timeRemaining: milliseconds, 
          totalTime: milliseconds,
          isRunning: false, 
          isPaused: false 
        });
      },
      
      tick: () => {
        const { timeRemaining, isRunning, settings } = get();
        if (isRunning && timeRemaining > 1000) {
          set({ timeRemaining: timeRemaining - 1000 });
        } else if (isRunning && timeRemaining <= 1000) {
          set({ isRunning: false, timeRemaining: 0 });
          
          // Trigger notification based on settings
          const { notificationType } = settings;
          if (notificationType === 'sound') {
            playNotificationSound();
          } else if (notificationType === 'browser') {
            showBrowserNotification('Timer Complete!', 'Your timer session has finished.');
          }
        }
      },
      
      // Activity actions
      createActivity: (name: string) => {
        const newActivity: Activity = {
          id: crypto.randomUUID(),
          name: name.trim(),
          createdAt: new Date(),
        };
        set(state => ({ 
          activities: [...state.activities, newActivity],
          currentActivity: newActivity
        }));
      },
      
      selectActivity: (activity: Activity | null) => {
        set({ currentActivity: activity });
      },
      
      deleteActivity: (id: string) => {
        set(state => ({
          activities: state.activities.filter(a => a.id !== id),
          currentActivity: state.currentActivity?.id === id ? null : state.currentActivity
        }));
      },
      
      clearAllActivities: () => {
        set({ activities: [], currentActivity: null });
      },
      
      editActivity: (id: string, name: string) => {
        set(state => ({
          activities: state.activities.map(a => 
            a.id === id ? { ...a, name: name.trim() } : a
          ),
          currentActivity: state.currentActivity?.id === id 
            ? { ...state.currentActivity, name: name.trim() }
            : state.currentActivity
        }));
      },
      
      // Settings actions
      updateSettings: (newSettings: Partial<Settings>) => {
        set(state => {
          const updatedSettings = { ...state.settings, ...newSettings };
          
          // Apply theme immediately if it changed
          if (newSettings.theme && newSettings.theme !== state.settings.theme) {
            applyThemeToDocument(newSettings.theme);
          }
          
          return { settings: updatedSettings };
        });
      },
      
      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
        applyThemeToDocument(DEFAULT_SETTINGS.theme);
      },
      
      testNotification: async () => {
        const { settings } = get();
        
        switch (settings.notificationType) {
          case 'sound':
            playNotificationSound();
            break;
          case 'browser':
            if (Notification.permission === 'granted') {
              showBrowserNotification('Timer Test', 'This is a test notification!');
            } else {
              const permission = await requestNotificationPermission();
              if (permission === 'granted') {
                showBrowserNotification('Timer Test', 'This is a test notification!');
              }
            }
            break;
          case 'none':
            // Visual feedback could be added here in the future
            break;
        }
      },
      
      applyTheme: () => {
        const { settings } = get();
        applyThemeToDocument(settings.theme);
      },
    }),
    {
      name: 'timer-storage',
      partialize: (state) => ({ 
        activities: state.activities,
        currentActivity: state.currentActivity,
        totalTime: state.totalTime,
        settings: state.settings
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme when store is rehydrated
        if (state?.settings?.theme) {
          applyThemeToDocument(state.settings.theme);
        }
      },
    }
  )
);