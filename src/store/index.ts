import { create } from 'zustand';

interface TimerStore {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timeRemaining: 25 * 60 * 1000, // 25 minutes in milliseconds
  isRunning: false,
  isPaused: false,

  startTimer: () => set({ isRunning: true, isPaused: false }),
  
  pauseTimer: () => set({ isRunning: false, isPaused: true }),
  
  resetTimer: () => set({ 
    timeRemaining: 25 * 60 * 1000, 
    isRunning: false, 
    isPaused: false 
  }),
  
  tick: () => {
    const { timeRemaining, isRunning } = get();
    if (isRunning && timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1000 });
    }
    if (timeRemaining <= 1000 && isRunning) {
      set({ isRunning: false, timeRemaining: 0 });
    }
  }
}));