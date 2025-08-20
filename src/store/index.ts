import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  playNotificationSound,
  requestNotificationPermission,
  showBrowserNotification,
} from "../lib/notifications";
import { databaseService } from "../lib/database-service";

// Store-level activity interface (uses string IDs for UI compatibility)
interface Activity {
  id: string;
  name: string;
  createdAt: Date;
}

interface Settings {
  defaultWorkTime: number; // in minutes
  defaultBreakTime: number; // in minutes
  notificationType: "sound" | "browser" | "none";
  soundType: "bell" | "chime" | "gentle" | "digital" | "custom";
  customAudioFile: string | null; // base64 data URL for custom audio
  customAudioName: string | null; // user-friendly name for custom audio
  theme: "light" | "dark" | "system";
  autoStartBreak: boolean;
}

interface Session {
  id: string;
  activityId: string | null;
  activityName: string;
  type: "work" | "break";
  duration: number; // in milliseconds
  startTime: Date;
  endTime: Date;
  completed: boolean;
}

interface TimerStore {
  // Timer state - using persistent approach
  startTime: number | null; // When timer actually started (timestamp)
  totalDuration: number; // Total time for this session (ms)
  isRunning: boolean;
  isPaused: boolean;
  pausedTime: number; // How much time was spent paused (ms)
  currentSessionType: "work" | "break";

  // Activity state
  currentActivity: Activity | null;
  activities: Activity[];

  // Session state
  sessions: Session[];

  // Settings state
  settings: Settings;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setCustomTime: (minutes: number) => void;
  setCustomTimeMs: (milliseconds: number) => void;
  
  // Computed properties
  getTimeRemaining: () => number;
  
  // Timer completion
  checkTimerCompletion: () => Promise<boolean>;

  // Activity actions
  createActivity: (name: string) => Promise<void>;
  selectActivity: (activity: Activity | null) => void;
  deleteActivity: (id: string) => void;
  archiveActivity: (id: string) => Promise<void>;
  unarchiveActivity: (id: string) => Promise<void>;
  clearAllActivities: () => void;
  editActivity: (id: string, name: string) => void;
  getArchivedActivities: () => Promise<Activity[]>;

  // Settings actions
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  testNotification: () => void;
  applyTheme: () => void;

  // IndexedDB loading actions
  loadActivitiesFromIndexedDB: () => Promise<void>;
  loadSessionsFromIndexedDB: () => Promise<void>;

  // Session actions
  getSessions: () => Session[];
  getSessionsForActivity: (activityId: string) => Session[];
  getTodaysSessions: () => Session[];
  getTodaysActivityStats: () => { activityName: string; totalTime: number; sessionCount: number }[];
  clearAllSessions: () => void;
  setSessionType: (type: "work" | "break") => void;
}

const DEFAULT_WORK_TIME = 25; // 25 minutes
const DEFAULT_BREAK_TIME = 5; // 5 minutes

const DEFAULT_SETTINGS: Settings = {
  defaultWorkTime: DEFAULT_WORK_TIME,
  defaultBreakTime: DEFAULT_BREAK_TIME,
  notificationType: "sound",
  soundType: "bell",
  customAudioFile: null,
  customAudioName: null,
  theme: "system",
  autoStartBreak: false,
};

// Notification functions are imported from ../lib/notifications

// Theme management
let systemThemeListener: MediaQueryList | null = null;

const applyThemeToDocument = (theme: "light" | "dark" | "system") => {
  const root = document.documentElement;

  // Remove any existing system theme listener
  if (systemThemeListener) {
    systemThemeListener.removeEventListener("change", handleSystemThemeChange);
    systemThemeListener = null;
  }

  if (theme === "system") {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemPrefersDark = mediaQuery.matches;
    root.classList.toggle("dark", systemPrefersDark);

    // Add listener for system theme changes
    systemThemeListener = mediaQuery;
    systemThemeListener.addEventListener("change", handleSystemThemeChange);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
};

const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  document.documentElement.classList.toggle("dark", e.matches);
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      // Timer state
      startTime: null,
      totalDuration: DEFAULT_WORK_TIME * 60 * 1000,
      isRunning: false,
      isPaused: false,
      pausedTime: 0,
      currentSessionType: "work",

      // Activity state
      currentActivity: null,
      activities: [],

      // Session state
      sessions: [],

      // Settings state
      settings: DEFAULT_SETTINGS,

      startTimer: () => {
        const { isPaused, pausedTime } = get();
        set({
          isRunning: true,
          isPaused: false,
          startTime: isPaused ? Date.now() - pausedTime : Date.now(),
          pausedTime: 0,
        });
      },

      pauseTimer: () => {
        const { startTime } = get();
        set({
          isRunning: false,
          isPaused: true,
          pausedTime: startTime ? Date.now() - startTime : 0,
        });
      },

      resetTimer: () => {
        set({
          startTime: null,
          isRunning: false,
          isPaused: false,
          pausedTime: 0,
        });
      },

      stopTimer: () => {
        set({
          startTime: null,
          isRunning: false,
          isPaused: false,
          pausedTime: 0,
        });
      },

      setCustomTime: (minutes: number) => {
        const timeInMs = minutes * 60 * 1000;
        set({
          totalDuration: timeInMs,
          startTime: null,
          isRunning: false,
          isPaused: false,
          pausedTime: 0,
        });
      },

      setCustomTimeMs: (milliseconds: number) => {
        set({
          totalDuration: milliseconds,
          startTime: null,
          isRunning: false,
          isPaused: false,
          pausedTime: 0,
        });
      },

      getTimeRemaining: () => {
        const { startTime, totalDuration, isPaused, pausedTime } = get();
        if (!startTime) return totalDuration;
        if (isPaused) return totalDuration - pausedTime;
        const elapsed = Date.now() - startTime;
        return Math.max(0, totalDuration - elapsed);
      },

      checkTimerCompletion: async () => {
        const { 
          isRunning, 
          startTime,
          settings, 
          currentActivity, 
          totalDuration, 
          currentSessionType,
          sessions 
        } = get();
        
        const timeRemaining = get().getTimeRemaining();
        
        if (isRunning && timeRemaining === 0 && startTime) {
          // Record completed session
          const endTime = new Date();
          const session: Session = {
            id: crypto.randomUUID(),
            activityId: currentActivity?.id || null,
            activityName: currentActivity?.name || "Unnamed Activity",
            type: currentSessionType,
            duration: totalDuration,
            startTime: new Date(startTime),
            endTime: endTime,
            completed: true
          };
          
          set({ 
            isRunning: false, 
            startTime: null,
            pausedTime: 0,
            sessions: [...sessions, session]
          });

          // Save to IndexedDB (fire-and-forget pattern)
          if (currentActivity) {
            databaseService.createSession({
              activityId: currentActivity.id,
              activityName: currentActivity.name,
              type: currentSessionType,
              duration: totalDuration,
              startTime: new Date(startTime),
              endTime: endTime,
              completed: true
            }).then(async () => {
              // Update activity usage
              await databaseService.updateActivityUsage(parseInt(currentActivity.id));
              
              // Update daily stats
              await databaseService.calculateAndUpdateDailyStats(new Date());
            }).catch(error => {
              console.error('Failed to save session to IndexedDB:', error);
            });
          }

          // Trigger notification based on settings
          const { notificationType, soundType, customAudioFile } = settings;
          if (notificationType === "sound") {
            playNotificationSound(soundType, customAudioFile);
          } else if (notificationType === "browser") {
            showBrowserNotification(
              "Timer Complete!",
              "Your timer session has finished."
            );
          }
          
          return true; // Timer completed
        }
        
        return false; // Timer not completed
      },

      // Activity actions
      createActivity: async (name: string) => {
        try {
          const dbActivity = await databaseService.createActivity({
            name: name.trim(),
            createdAt: new Date(),
          });
          
          const newActivity: Activity = {
            id: dbActivity.id!.toString(),
            name: dbActivity.name,
            createdAt: dbActivity.createdAt,
          };
          
          set((state) => ({
            activities: [...state.activities, newActivity],
            currentActivity: newActivity,
          }));
        } catch (error) {
          console.error('Failed to create activity in IndexedDB:', error);
          // Fallback to localStorage-only creation if IndexedDB fails
          const newActivity: Activity = {
            id: crypto.randomUUID(),
            name: name.trim(),
            createdAt: new Date(),
          };
          set((state) => ({
            activities: [...state.activities, newActivity],
            currentActivity: newActivity,
          }));
        }
      },

      selectActivity: (activity: Activity | null) => {
        set({ currentActivity: activity });
      },

      deleteActivity: (id: string) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
          currentActivity:
            state.currentActivity?.id === id ? null : state.currentActivity,
        }));
      },

      archiveActivity: async (id: string) => {
        try {
          await databaseService.updateActivity(parseInt(id), { isArchived: true });
          set((state) => ({
            activities: state.activities.filter((a) => a.id !== id),
            currentActivity:
              state.currentActivity?.id === id ? null : state.currentActivity,
          }));
        } catch (error) {
          console.error('Failed to archive activity:', error);
        }
      },

      unarchiveActivity: async (id: string) => {
        try {
          await databaseService.updateActivity(parseInt(id), { isArchived: false });
          // Reload activities to show the unarchived activity
          await get().loadActivitiesFromIndexedDB();
        } catch (error) {
          console.error('Failed to unarchive activity:', error);
        }
      },

      getArchivedActivities: async () => {
        try {
          const allActivities = await databaseService.getAllActivities();
          return allActivities
            .filter(activity => activity.isArchived)
            .map(activity => ({
              id: activity.id!.toString(),
              name: activity.name,
              createdAt: activity.createdAt,
            }));
        } catch (error) {
          console.error('Failed to get archived activities:', error);
          return [];
        }
      },

      clearAllActivities: () => {
        set({ activities: [], currentActivity: null });
      },

      editActivity: (id: string, name: string) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id ? { ...a, name: name.trim() } : a
          ),
          currentActivity:
            state.currentActivity?.id === id
              ? { ...state.currentActivity, name: name.trim() }
              : state.currentActivity,
        }));
      },

      // Settings actions
      updateSettings: (newSettings: Partial<Settings>) => {
        set((state) => {
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
          case "sound":
            playNotificationSound(settings.soundType, settings.customAudioFile);
            break;
          case "browser":
            if (Notification.permission === "granted") {
              showBrowserNotification(
                "Timer Test",
                "This is a test notification!"
              );
            } else {
              const permission = await requestNotificationPermission();
              if (permission === "granted") {
                showBrowserNotification(
                  "Timer Test",
                  "This is a test notification!"
                );
              }
            }
            break;
          case "none":
            // Visual feedback could be added here in the future
            break;
        }
      },
      applyTheme: () => {
        const { settings } = get();
        applyThemeToDocument(settings.theme);
      },

      // Session actions
      getSessions: () => {
        const { sessions } = get();
        return sessions;
      },

      getSessionsForActivity: (activityId: string) => {
        const { sessions } = get();
        return sessions.filter(session => session.activityId === activityId);
      },

      clearAllSessions: () => {
        set({ sessions: [] });
      },

      setSessionType: (type: "work" | "break") => {
        set({ currentSessionType: type });
      },

      getTodaysSessions: () => {
        const { sessions } = get();
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        
        return sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= todayStart && sessionDate < todayEnd && session.completed;
        });
      },

      getTodaysActivityStats: () => {
        const todaysSessions = get().getTodaysSessions();
        
        // Group by activity and calculate totals
        const activityStats = new Map<string, { totalTime: number; sessionCount: number }>();
        
        todaysSessions.forEach(session => {
          // Skip unnamed activities
          if (!session.activityName || session.activityName === "Unnamed Activity") {
            return;
          }
          
          if (activityStats.has(session.activityName)) {
            const stats = activityStats.get(session.activityName)!;
            stats.totalTime += session.duration;
            stats.sessionCount += 1;
          } else {
            activityStats.set(session.activityName, {
              totalTime: session.duration,
              sessionCount: 1
            });
          }
        });
        
        // Convert to array and sort by total time
        return Array.from(activityStats.entries())
          .map(([activityName, stats]) => ({
            activityName,
            totalTime: stats.totalTime,
            sessionCount: stats.sessionCount
          }))
          .sort((a, b) => b.totalTime - a.totalTime)
          .slice(0, 3); // Top 3
      },

      // IndexedDB loading actions
      loadActivitiesFromIndexedDB: async () => {
        try {
          const dbActivities = await databaseService.getActiveActivities();
          const activities: Activity[] = dbActivities.map(activity => ({
            id: activity.id!.toString(),
            name: activity.name,
            createdAt: activity.createdAt,
          }));
          
          set({ activities });
        } catch (error) {
          console.error('Failed to load activities from IndexedDB:', error);
        }
      },

      loadSessionsFromIndexedDB: async () => {
        try {
          // Load recent sessions (last 30 days)
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - 30);
          
          const dbSessions = await databaseService.getCompletedSessionsInRange(startDate, endDate);
          const sessions: Session[] = dbSessions
            .filter(session => session && session.id) // Filter out invalid sessions
            .map(session => ({
              id: session.id!.toString(),
              activityId: session.activityId?.toString() || null,
              activityName: session.activityName || "Unknown Activity",
              type: session.type || "work",
              duration: (session.duration || 0) * 1000, // Convert from seconds to milliseconds
              startTime: session.startTime || new Date(),
              endTime: session.endTime || session.startTime || new Date(),
              completed: Boolean(session.completed),
            }));
          
          set({ sessions });
        } catch (error) {
          console.error('Failed to load sessions from IndexedDB:', error);
          // Don't fail completely, just set empty sessions
          set({ sessions: [] });
        }
      },
    }),
    {
      name: "timer-storage",
      partialize: (state) => ({
        // Keep timer state and settings in localStorage for fast access
        currentActivity: state.currentActivity,
        settings: state.settings,
        // Timer persistence state
        startTime: state.startTime,
        totalDuration: state.totalDuration,
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        pausedTime: state.pausedTime,
        currentSessionType: state.currentSessionType,
        // Large data stays in IndexedDB
        activities: [],
        sessions: []
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Store rehydration failed:', error);
          return;
        }

        // Apply theme when store is rehydrated
        if (state?.settings?.theme) {
          applyThemeToDocument(state.settings.theme);
        }
        
        // Load activities and sessions from IndexedDB
        setTimeout(() => {
          loadDataFromIndexedDB();
        }, 100);
      },
    }
  )
);

/**
 * Load data from IndexedDB into the store
 */
const loadDataFromIndexedDB = async (): Promise<void> => {
  try {
    const store = useTimerStore.getState();
    await Promise.all([
      store.loadActivitiesFromIndexedDB(),
      store.loadSessionsFromIndexedDB()
    ]);
  } catch (error) {
    console.error('Failed to load data from IndexedDB:', error);
  }
};

// Export database utilities for debugging and testing
export const databaseUtils = {
  loadDataFromIndexedDB,
  getDatabaseStats: () => databaseService.getDatabaseStats(),
  clearAllData: () => databaseService.clearAllData()
};
