export interface Activity {
  id: string;
  name: string;
  totalTime: number;
  sessions: TimerSession[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimerSession {
  id: string;
  activityId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
}

export interface AppSettings {
  defaultWorkTime: number;
  defaultBreakTime: number;
  notificationType: 'browser' | 'sound' | 'none';
  autoStartBreak: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface TimerState {
  currentActivity: Activity | null;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;
  isBreak: boolean;
  customWorkTime?: number;
  customBreakTime?: number;
}