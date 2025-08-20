import Dexie, { type EntityTable } from "dexie";
import type { Activity, AudioFile, DailyStats, Session } from "../types";

// Database class extending Dexie
export class TimeTrackerDatabase extends Dexie {
  // Table definitions with proper typing
  activities!: EntityTable<Activity, "id">;
  sessions!: EntityTable<Session, "id">;
  audioFiles!: EntityTable<AudioFile, "id">;
  dailyStats!: EntityTable<DailyStats, "dateKey">;

  constructor() {
    super("TimeTrackerDB");

    this.version(1).stores({
      // Activities table with indexes
      activities: "++id, name, createdAt, lastUsed, isArchived",

      // Sessions table with compound indexes for efficient querying
      sessions:
        "++id, activityId, startTime, dateKey, completed, type, [activityId+dateKey], [completed+dateKey]",

      // Audio files table
      audioFiles: "++id, name, size, createdAt",

      // Daily stats table with dateKey as primary key
      dailyStats: "dateKey, date, lastUpdated",
    });

    // Hook for data transformation and validation
    this.activities.hook("creating", function (primKey, obj, trans) {
      void primKey;
      void trans; // Acknowledge unused parameters
      obj.createdAt = obj.createdAt || new Date();
      obj.lastUsed = obj.lastUsed || new Date();
      obj.isArchived = obj.isArchived ?? false;
    });

    this.sessions.hook("creating", function (primKey, obj, trans) {
      void primKey;
      void trans; // Acknowledge unused parameters
      obj.startTime = obj.startTime || new Date();
      obj.completed = obj.completed ?? false;

      // Generate dateKey if not provided
      if (!obj.dateKey && obj.startTime) {
        obj.dateKey = formatDateKey(obj.startTime);
      }
    });

    this.audioFiles.hook("creating", function (primKey, obj, trans) {
      void primKey;
      void trans; // Acknowledge unused parameters
      obj.createdAt = obj.createdAt || new Date();
    });

    this.dailyStats.hook("creating", function (primKey, obj, trans) {
      void primKey;
      void trans; // Acknowledge unused parameters
      (obj as DailyStats & { lastUpdated: Date }).lastUpdated = new Date();
      obj.date = obj.date || new Date(obj.dateKey);
    });

    this.dailyStats.hook(
      "updating",
      function (modifications, primKey, obj, trans) {
        void primKey;
        void obj;
        void trans; // Acknowledge unused parameters
        (
          modifications as Partial<DailyStats> & { lastUpdated: Date }
        ).lastUpdated = new Date();
      }
    );
  }

  // Database utility methods
  async initializeDatabase(): Promise<void> {
    try {
      await this.open();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw new Error("Database initialization failed");
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await this.transaction(
        "rw",
        this.activities,
        this.sessions,
        this.audioFiles,
        this.dailyStats,
        async () => {
          await Promise.all([
            this.activities.clear(),
            this.sessions.clear(),
            this.audioFiles.clear(),
            this.dailyStats.clear(),
          ]);
        }
      );
      console.log("All data cleared successfully");
    } catch (error) {
      console.error("Failed to clear data:", error);
      throw new Error("Data clearing failed");
    }
  }

  async exportData(): Promise<{
    activities: Activity[];
    sessions: Session[];
    audioFiles: AudioFile[];
    dailyStats: DailyStats[];
  }> {
    try {
      const [activities, sessions, audioFiles, dailyStats] = await Promise.all([
        this.activities.toArray(),
        this.sessions.toArray(),
        this.audioFiles.toArray(),
        this.dailyStats.toArray(),
      ]);

      return {
        activities,
        sessions,
        audioFiles,
        dailyStats,
      };
    } catch (error) {
      console.error("Failed to export data:", error);
      throw new Error("Data export failed");
    }
  }

  async importData(data: {
    activities?: Activity[];
    sessions?: Session[];
    audioFiles?: AudioFile[];
    dailyStats?: DailyStats[];
  }): Promise<void> {
    try {
      await this.transaction(
        "rw",
        this.activities,
        this.sessions,
        this.audioFiles,
        this.dailyStats,
        async () => {
          if (data.activities) {
            await this.activities.bulkAdd(data.activities);
          }
          if (data.sessions) {
            await this.sessions.bulkAdd(data.sessions);
          }
          if (data.audioFiles) {
            await this.audioFiles.bulkAdd(data.audioFiles);
          }
          if (data.dailyStats) {
            await this.dailyStats.bulkAdd(data.dailyStats);
          }
        }
      );
      console.log("Data imported successfully");
    } catch (error) {
      console.error("Failed to import data:", error);
      throw new Error("Data import failed");
    }
  }

  // Activity-specific methods
  async getActiveActivities(): Promise<Activity[]> {
    return this.activities
      .where("isArchived")
      .equals(0) // Use 0 for false in IndexedDB
      .reverse()
      .sortBy("lastUsed");
  }

  async updateActivityUsage(activityId: number): Promise<void> {
    await this.activities.update(activityId, { lastUsed: new Date() });
  }

  // Session-specific methods
  async getSessionsForDate(dateKey: string): Promise<Session[]> {
    return this.sessions.where("dateKey").equals(dateKey).toArray();
  }

  async getSessionsForActivity(
    activityId: number,
    limit?: number
  ): Promise<Session[]> {
    const sessions = await this.sessions
      .where("activityId")
      .equals(activityId)
      .reverse()
      .sortBy("startTime");

    if (limit) {
      return sessions.slice(0, limit);
    }

    return sessions;
  }

  async getCompletedSessionsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<Session[]> {
    const startKey = formatDateKey(startDate);
    const endKey = formatDateKey(endDate);

    return this.sessions
      .where("[completed+dateKey]")
      .between([true, startKey], [true, endKey], true, true)
      .toArray();
  }

  // Daily stats methods
  async getDailyStatsForRange(
    startDate: Date,
    endDate: Date
  ): Promise<DailyStats[]> {
    const startKey = formatDateKey(startDate);
    const endKey = formatDateKey(endDate);

    return this.dailyStats
      .where("dateKey")
      .between(startKey, endKey, true, true)
      .toArray();
  }

  async updateDailyStats(
    dateKey: string,
    stats: Partial<Omit<DailyStats, "dateKey">>
  ): Promise<void> {
    const existingStats = await this.dailyStats.get(dateKey);

    if (existingStats) {
      await this.dailyStats.update(dateKey, stats);
    } else {
      await this.dailyStats.add({
        dateKey,
        date: new Date(dateKey),
        totalWorkTime: 0,
        totalBreakTime: 0,
        sessionsCompleted: 0,
        activitiesUsed: 0,
        productivity: 0,
        lastUpdated: new Date(),
        ...stats,
      });
    }
  }

  // Audio file methods
  async getAudioFilesByName(name: string): Promise<AudioFile[]> {
    return this.audioFiles.where("name").startsWithIgnoreCase(name).toArray();
  }

  async deleteOldAudioFiles(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldFiles = await this.audioFiles
      .where("createdAt")
      .below(cutoffDate)
      .toArray();

    await this.audioFiles.where("createdAt").below(cutoffDate).delete();

    return oldFiles.length;
  }

  // Health check and maintenance
  async getDatabaseSize(): Promise<{
    activities: number;
    sessions: number;
    audioFiles: number;
    dailyStats: number;
    total: number;
  }> {
    const [activitiesCount, sessionsCount, audioFilesCount, dailyStatsCount] =
      await Promise.all([
        this.activities.count(),
        this.sessions.count(),
        this.audioFiles.count(),
        this.dailyStats.count(),
      ]);

    return {
      activities: activitiesCount,
      sessions: sessionsCount,
      audioFiles: audioFilesCount,
      dailyStats: dailyStatsCount,
      total:
        activitiesCount + sessionsCount + audioFilesCount + dailyStatsCount,
    };
  }

  async performMaintenance(): Promise<{
    deletedSessions: number;
    deletedAudioFiles: number;
    compactedStats: number;
  }> {
    const results = {
      deletedSessions: 0,
      deletedAudioFiles: 0,
      compactedStats: 0,
    };

    try {
      // Delete incomplete sessions older than 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const incompleteSessions = await this.sessions
        .where("completed")
        .equals(0) // Use 0 for false in IndexedDB
        .and((session) => session.startTime < oneDayAgo)
        .toArray();

      if (incompleteSessions.length > 0) {
        await this.sessions.bulkDelete(incompleteSessions.map((s) => s.id!));
        results.deletedSessions = incompleteSessions.length;
      }

      // Delete audio files older than 30 days
      results.deletedAudioFiles = await this.deleteOldAudioFiles(30);

      console.log("Database maintenance completed:", results);
      return results;
    } catch (error) {
      console.error("Database maintenance failed:", error);
      throw new Error("Database maintenance failed");
    }
  }
}

// Utility functions
export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function parseFromDateKey(dateKey: string): Date {
  return new Date(dateKey + "T00:00:00.000Z");
}

// Create and export the database instance
export const timeTrackerDb = new TimeTrackerDatabase();

// Initialize the database
timeTrackerDb.initializeDatabase().catch((error) => {
  console.error("Failed to initialize TimeTracker database:", error);
});

// Types are already exported above with interfaces

// Default export for convenience
export default timeTrackerDb;
