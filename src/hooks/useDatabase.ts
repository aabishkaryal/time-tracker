import { useCallback, useEffect, useState } from "react";
import { databaseService } from "../lib/database-service";
import type { Activity, DailyStats, Session } from "../types";

// Hook for database operations
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database on mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await databaseService.initialize();
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize database"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // Generic error handler
  const handleAsyncOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      errorMessage: string
    ): Promise<T | null> => {
      try {
        setError(null);
        return await operation();
      } catch (err) {
        console.error(errorMessage, err);
        setError(err instanceof Error ? err.message : errorMessage);
        return null;
      }
    },
    []
  );

  // Activity operations
  const createActivity = useCallback(
    async (name: string, createdAt: Date = new Date()) => {
      return handleAsyncOperation(
        () => databaseService.createActivity({ name, createdAt }),
        "Failed to create activity"
      );
    },
    [handleAsyncOperation]
  );

  const getActiveActivities = useCallback(async () => {
    return handleAsyncOperation(
      () => databaseService.getActiveActivities(),
      "Failed to fetch activities"
    );
  }, [handleAsyncOperation]);

  const updateActivity = useCallback(
    async (id: number, updates: Partial<Activity>) => {
      return handleAsyncOperation(
        () => databaseService.updateActivity(id, updates),
        "Failed to update activity"
      );
    },
    [handleAsyncOperation]
  );

  const deleteActivity = useCallback(
    async (id: number) => {
      return handleAsyncOperation(
        () => databaseService.deleteActivity(id),
        "Failed to delete activity"
      );
    },
    [handleAsyncOperation]
  );

  // Session operations
  const createSession = useCallback(
    async (sessionData: {
      activityId: string | null;
      activityName: string;
      type: "work" | "break";
      duration: number; // in milliseconds
      startTime: Date;
      endTime: Date;
      completed: boolean;
    }) => {
      return handleAsyncOperation(
        () => databaseService.createSession(sessionData),
        "Failed to create session"
      );
    },
    [handleAsyncOperation]
  );

  const getSessionsForDate = useCallback(
    async (date: Date) => {
      return handleAsyncOperation(
        () => databaseService.getSessionsForDate(date),
        "Failed to fetch sessions for date"
      );
    },
    [handleAsyncOperation]
  );

  const getSessionsForActivity = useCallback(
    async (activityId: number, limit?: number) => {
      return handleAsyncOperation(
        () => databaseService.getSessionsForActivity(activityId, limit),
        "Failed to fetch sessions for activity"
      );
    },
    [handleAsyncOperation]
  );

  // Daily stats operations
  const getDailyStats = useCallback(
    async (startDate: Date, endDate: Date) => {
      return handleAsyncOperation(
        () => databaseService.getDailyStatsForRange(startDate, endDate),
        "Failed to fetch daily stats"
      );
    },
    [handleAsyncOperation]
  );

  const updateDailyStats = useCallback(
    async (date: Date) => {
      return handleAsyncOperation(
        () => databaseService.calculateAndUpdateDailyStats(date),
        "Failed to update daily stats"
      );
    },
    [handleAsyncOperation]
  );

  // Analytics operations
  const getProductivityTrends = useCallback(
    async (days: number = 30) => {
      return handleAsyncOperation(
        () => databaseService.getProductivityTrends(days),
        "Failed to fetch productivity trends"
      );
    },
    [handleAsyncOperation]
  );

  const getTopActivities = useCallback(
    async (days: number = 7) => {
      return handleAsyncOperation(
        () => databaseService.getTopActivities(days),
        "Failed to fetch top activities"
      );
    },
    [handleAsyncOperation]
  );

  // Audio file operations
  const saveAudioFile = useCallback(
    async (name: string, audioBlob: Blob) => {
      return handleAsyncOperation(async () => {
        // Convert Blob to data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });
        return databaseService.saveAudioFile(name, dataUrl);
      }, "Failed to save audio file");
    },
    [handleAsyncOperation]
  );

  const getAudioFile = useCallback(
    async (id: number) => {
      return handleAsyncOperation(
        () => databaseService.getAudioFile(id),
        "Failed to fetch audio file"
      );
    },
    [handleAsyncOperation]
  );

  const listAudioFiles = useCallback(async () => {
    return handleAsyncOperation(
      () => databaseService.listAudioFiles(),
      "Failed to list audio files"
    );
  }, [handleAsyncOperation]);

  // Backup and maintenance operations
  const exportBackup = useCallback(async () => {
    return handleAsyncOperation(
      () => databaseService.exportBackup(),
      "Failed to export backup"
    );
  }, [handleAsyncOperation]);

  const importBackup = useCallback(
    async (backupData: {
      activities: Activity[];
      sessions: Session[];
      dailyStats: DailyStats[];
    }) => {
      return handleAsyncOperation(
        () => databaseService.importBackup(backupData),
        "Failed to import backup"
      );
    },
    [handleAsyncOperation]
  );

  const performMaintenance = useCallback(async () => {
    return handleAsyncOperation(
      () => databaseService.performMaintenance(),
      "Failed to perform maintenance"
    );
  }, [handleAsyncOperation]);

  const getDatabaseStats = useCallback(async () => {
    return handleAsyncOperation(
      () => databaseService.getDatabaseStats(),
      "Failed to get database stats"
    );
  }, [handleAsyncOperation]);

  const clearAllData = useCallback(async () => {
    return handleAsyncOperation(
      () => databaseService.clearAllData(),
      "Failed to clear all data"
    );
  }, [handleAsyncOperation]);

  return {
    // State
    isInitialized,
    isLoading,
    error,

    // Activity operations
    createActivity,
    getActiveActivities,
    updateActivity,
    deleteActivity,

    // Session operations
    createSession,
    getSessionsForDate,
    getSessionsForActivity,

    // Daily stats operations
    getDailyStats,
    updateDailyStats,

    // Analytics operations
    getProductivityTrends,
    getTopActivities,

    // Audio file operations
    saveAudioFile,
    getAudioFile,
    listAudioFiles,

    // Backup and maintenance
    exportBackup,
    importBackup,
    performMaintenance,
    getDatabaseStats,
    clearAllData,

    // Utility
    clearError: () => setError(null),
  };
}

// Hook for specific database queries with real-time updates
export function useDatabaseQuery<T>(
  queryFn: () => Promise<T | null>,
  dependencies: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      console.error("Query failed:", err);
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsLoading(false);
    }
  }, [queryFn]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Hook for today's data
export function useTodayData() {
  const { getSessionsForDate, getDailyStats } = useDatabase();

  const today = new Date();

  const {
    data: sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions,
  } = useDatabaseQuery(() => getSessionsForDate(today), [today]);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDatabaseQuery(() => getDailyStats(today, today), [today]);

  const refetchAll = useCallback(() => {
    refetchSessions();
    refetchStats();
  }, [refetchSessions, refetchStats]);

  return {
    sessions: sessions || [],
    stats: stats?.[0] || null,
    isLoading: sessionsLoading || statsLoading,
    error: sessionsError || statsError,
    refetch: refetchAll,
  };
}
