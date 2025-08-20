export interface Activity {
  id?: number; // Optional for creation, required after save
  name: string;
  createdAt: Date;
  lastUsed: Date;
  isArchived: boolean;
}

export interface Session {
  id?: number; // Optional for creation, required after save
  activityId: number;
  activityName: string;
  type: 'work' | 'break';
  duration: number; // in seconds for database, milliseconds for UI
  startTime: Date;
  endTime?: Date;
  dateKey: string; // YYYY-MM-DD format for efficient querying
  completed: boolean;
  metadata?: {
    notes?: string;
    tags?: string[];
    productivity?: number; // 1-5 scale
    interruptions?: number;
  };
}

export interface AudioFile {
  id?: number;
  name: string;
  data: string; // base64 encoded audio data
  size: number;
  mimeType: string;
  createdAt: Date;
}

export interface DailyStats {
  dateKey: string; // Primary key, YYYY-MM-DD format
  date: Date;
  totalWorkTime: number; // in seconds
  totalBreakTime: number; // in seconds
  sessionsCompleted: number;
  activitiesUsed: number;
  productivity: number; // calculated average productivity
  lastUpdated: Date;
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