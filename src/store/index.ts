import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Activity {
  id: string;
  name: string;
  createdAt: Date;
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
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setCustomTime: (minutes: number) => void;
  setCustomTimeMs: (milliseconds: number) => void;
  tick: () => void;
  
  // Activity actions
  createActivity: (name: string) => void;
  selectActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
}

const DEFAULT_TIME = 25 * 60 * 1000; // 25 minutes in milliseconds

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      // Timer state
      timeRemaining: DEFAULT_TIME,
      totalTime: DEFAULT_TIME,
      isRunning: false,
      isPaused: false,
      
      // Activity state
      currentActivity: null,
      activities: [],

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
        const { timeRemaining, isRunning } = get();
        if (isRunning && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1000 });
        }
        if (timeRemaining <= 1000 && isRunning) {
          set({ isRunning: false, timeRemaining: 0 });
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
      
      selectActivity: (activity: Activity) => {
        set({ currentActivity: activity });
      },
      
      deleteActivity: (id: string) => {
        set(state => ({
          activities: state.activities.filter(a => a.id !== id),
          currentActivity: state.currentActivity?.id === id ? null : state.currentActivity
        }));
      },
    }),
    {
      name: 'timer-storage',
      partialize: (state) => ({ 
        activities: state.activities,
        currentActivity: state.currentActivity,
        totalTime: state.totalTime
      }),
    }
  )
);