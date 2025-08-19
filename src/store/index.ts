import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  playNotificationSound,
  requestNotificationPermission,
  showBrowserNotification,
} from "../lib/notifications";

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
  // Timer state
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  isPaused: boolean;
  sessionStartTime: Date | null;
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
      timeRemaining: DEFAULT_WORK_TIME * 60 * 1000,
      totalTime: DEFAULT_WORK_TIME * 60 * 1000,
      isRunning: false,
      isPaused: false,
      sessionStartTime: null,
      currentSessionType: "work",

      // Activity state
      currentActivity: null,
      activities: [],

      // Session state
      sessions: [],

      // Settings state
      settings: DEFAULT_SETTINGS,

      startTimer: () => {
        const { isPaused, sessionStartTime } = get();
        set({ 
          isRunning: true, 
          isPaused: false,
          // Only set start time if not resuming from pause
          sessionStartTime: isPaused ? sessionStartTime : new Date()
        });
      },

      pauseTimer: () => set({ isRunning: false, isPaused: true }),

      resetTimer: () => {
        const { totalTime } = get();
        set({
          timeRemaining: totalTime,
          isRunning: false,
          isPaused: false,
        });
      },

      stopTimer: () => {
        set({
          isRunning: false,
          isPaused: false,
          sessionStartTime: null,
        });
      },

      setCustomTime: (minutes: number) => {
        const timeInMs = minutes * 60 * 1000;
        set({
          timeRemaining: timeInMs,
          totalTime: timeInMs,
          isRunning: false,
          isPaused: false,
          sessionStartTime: null,
        });
      },

      setCustomTimeMs: (milliseconds: number) => {
        set({
          timeRemaining: milliseconds,
          totalTime: milliseconds,
          isRunning: false,
          isPaused: false,
          sessionStartTime: null,
        });
      },

      tick: () => {
        const { 
          timeRemaining, 
          isRunning, 
          settings, 
          sessionStartTime, 
          currentActivity, 
          totalTime, 
          currentSessionType,
          sessions 
        } = get();
        
        if (isRunning && timeRemaining > 1000) {
          set({ timeRemaining: timeRemaining - 1000 });
        } else if (isRunning && timeRemaining <= 1000) {
          // Record completed session
          if (sessionStartTime) {
            const endTime = new Date();
            const session: Session = {
              id: crypto.randomUUID(),
              activityId: currentActivity?.id || null,
              activityName: currentActivity?.name || "Unnamed Activity",
              type: currentSessionType,
              duration: totalTime,
              startTime: sessionStartTime,
              endTime: endTime,
              completed: true
            };
            
            set({ 
              isRunning: false, 
              timeRemaining: 0,
              sessionStartTime: null,
              sessions: [...sessions, session]
            });
          } else {
            set({ isRunning: false, timeRemaining: 0, sessionStartTime: null });
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
        }
      },

      // Activity actions
      createActivity: (name: string) => {
        const newActivity: Activity = {
          id: crypto.randomUUID(),
          name: name.trim(),
          createdAt: new Date(),
        };
        set((state) => ({
          activities: [...state.activities, newActivity],
          currentActivity: newActivity,
        }));
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
        const { sessions } = get();
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
    }),
    {
      name: "timer-storage",
      partialize: (state) => ({
        activities: state.activities,
        currentActivity: state.currentActivity,
        totalTime: state.totalTime,
        settings: state.settings,
        sessions: state.sessions,
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
