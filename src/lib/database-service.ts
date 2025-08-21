import type { Activity, DailyStats, Session } from "../types";
import { formatDateKey, timeTrackerDb } from "./indexeddb";

// Store-specific interfaces for Zustand compatibility
interface StoreActivity {
  id: string;
  name: string;
  createdAt: Date;
}

interface StoreSession {
  id: string;
  activityId: string | null;
  activityName: string;
  type: "work" | "break";
  duration: number; // in milliseconds
  startTime: Date;
  endTime: Date;
  completed: boolean;
}

// Database service class to handle all database operations
export class DatabaseService {
  private static instance: DatabaseService;
  private initialized = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await timeTrackerDb.initializeDatabase();
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize database service:", error);
      throw error;
    }
  }

  // Activity operations
  async createActivity(
    storeActivity: Omit<StoreActivity, "id">
  ): Promise<Activity> {
    await this.ensureInitialized();

    const dbActivity: Omit<Activity, "id"> = {
      name: storeActivity.name,
      createdAt: storeActivity.createdAt,
      lastUsed: storeActivity.createdAt,
      isArchived: false,
    };

    const id = await timeTrackerDb.activities.add(dbActivity);
    return { ...dbActivity, id: id as number };
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<void> {
    await this.ensureInitialized();
    await timeTrackerDb.activities.update(id, updates);
  }

  async deleteActivity(id: number): Promise<void> {
    await this.ensureInitialized();
    await timeTrackerDb.activities.update(id, { isArchived: true });
  }

  async getActiveActivities(): Promise<Activity[]> {
    await this.ensureInitialized();
    return timeTrackerDb.getActiveActivities();
  }

  async getAllActivities(): Promise<Activity[]> {
    await this.ensureInitialized();
    return timeTrackerDb.activities.toArray();
  }

  async getArchivedActivities(): Promise<Activity[]> {
    await this.ensureInitialized();
    // Get all activities and filter manually to handle boolean isArchived fields
    const allActivities = await timeTrackerDb.activities.toArray();
    return allActivities.filter(activity => activity.isArchived === true);
  }

  async updateActivityUsage(id: number): Promise<void> {
    await this.ensureInitialized();
    await timeTrackerDb.updateActivityUsage(id);
  }

  // Session operations
  async createSession(
    storeSession: Omit<StoreSession, "id">
  ): Promise<Session> {
    await this.ensureInitialized();

    const dbSession: Omit<Session, "id"> = {
      activityId: storeSession.activityId
        ? parseInt(storeSession.activityId)
        : 0,
      activityName: storeSession.activityName,
      type: storeSession.type,
      duration: Math.floor(storeSession.duration / 1000), // Convert to seconds
      startTime: storeSession.startTime,
      endTime: storeSession.endTime,
      dateKey: formatDateKey(storeSession.startTime),
      completed: storeSession.completed,
      metadata: {
        notes: "",
        tags: [],
        productivity: 3, // Default neutral productivity
        interruptions: 0,
      },
    };

    const id = await timeTrackerDb.sessions.add(dbSession);
    return { ...dbSession, id: id as number };
  }

  async getSessionsForDate(date: Date): Promise<Session[]> {
    await this.ensureInitialized();
    const dateKey = formatDateKey(date);
    return timeTrackerDb.getSessionsForDate(dateKey);
  }

  async getSessionsForActivity(
    activityId: number,
    limit?: number
  ): Promise<Session[]> {
    await this.ensureInitialized();
    return timeTrackerDb.getSessionsForActivity(activityId, limit);
  }

  async getCompletedSessionsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<Session[]> {
    await this.ensureInitialized();
    return timeTrackerDb.getCompletedSessionsInRange(startDate, endDate);
  }

  // Daily stats operations
  async updateDailyStats(
    date: Date,
    updates: Partial<Omit<DailyStats, "dateKey" | "date">>
  ): Promise<void> {
    await this.ensureInitialized();
    const dateKey = formatDateKey(date);
    await timeTrackerDb.updateDailyStats(dateKey, updates);
  }

  async getDailyStatsForRange(
    startDate: Date,
    endDate: Date
  ): Promise<DailyStats[]> {
    await this.ensureInitialized();
    return timeTrackerDb.getDailyStatsForRange(startDate, endDate);
  }

  async calculateAndUpdateDailyStats(date: Date): Promise<DailyStats> {
    await this.ensureInitialized();

    const sessions = await this.getSessionsForDate(date);
    const completedSessions = sessions.filter((s) => s.completed);

    const workSessions = completedSessions.filter((s) => s.type === "work");
    const breakSessions = completedSessions.filter((s) => s.type === "break");

    const totalWorkTime = workSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalBreakTime = breakSessions.reduce(
      (sum, s) => sum + s.duration,
      0
    );

    const uniqueActivities = new Set(workSessions.map((s) => s.activityId));
    const activitiesUsed = uniqueActivities.size;

    // Calculate average productivity
    const productivityScores = workSessions
      .map((s) => s.metadata?.productivity || 3)
      .filter((p) => p > 0);
    const avgProductivity =
      productivityScores.length > 0
        ? productivityScores.reduce((sum, p) => sum + p, 0) /
          productivityScores.length
        : 0;

    const stats: Partial<Omit<DailyStats, "dateKey" | "date">> = {
      totalWorkTime,
      totalBreakTime,
      sessionsCompleted: completedSessions.length,
      activitiesUsed,
      productivity: Math.round(avgProductivity * 100) / 100, // Round to 2 decimal places
    };

    await this.updateDailyStats(date, stats);

    // Return the updated stats
    const dateKey = formatDateKey(date);
    const updatedStats = await timeTrackerDb.dailyStats.get(dateKey);
    return updatedStats!;
  }

  // Audio file operations
  async saveAudioFile(name: string, audioDataUrl: string): Promise<number> {
    await this.ensureInitialized();

    const audioFile = {
      name,
      data: audioDataUrl,
      size: audioDataUrl.length,
      mimeType: audioDataUrl.split(";")[0].split(":")[1] || "audio/mpeg",
      createdAt: new Date(),
    };

    const id = await timeTrackerDb.audioFiles.add(audioFile);
    return id as number;
  }

  async getAudioFile(
    id: number
  ): Promise<{ name: string; data: string } | null> {
    await this.ensureInitialized();

    const audioFile = await timeTrackerDb.audioFiles.get(id);
    if (!audioFile) return null;

    return {
      name: audioFile.name,
      data: audioFile.data,
    };
  }

  async deleteAudioFile(id: number): Promise<void> {
    await this.ensureInitialized();
    await timeTrackerDb.audioFiles.delete(id);
  }

  async listAudioFiles(): Promise<
    Array<{ id: number; name: string; size: number; createdAt: Date }>
  > {
    await this.ensureInitialized();

    const files = await timeTrackerDb.audioFiles.toArray();
    return files.map((f) => ({
      id: f.id!,
      name: f.name,
      size: f.size,
      createdAt: f.createdAt,
    }));
  }

  // Backup and restore
  async exportBackup(): Promise<{
    version: string;
    exportDate: string;
    activities: Activity[];
    sessions: Session[];
    dailyStats: DailyStats[];
  }> {
    await this.ensureInitialized();

    const data = await timeTrackerDb.exportData();

    return {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      activities: data.activities,
      sessions: data.sessions,
      dailyStats: data.dailyStats,
    };
  }

  async importBackup(backupData: {
    activities: Activity[];
    sessions: Session[];
    dailyStats: DailyStats[];
  }): Promise<void> {
    await this.ensureInitialized();

    try {
      await timeTrackerDb.importData(backupData);
    } catch (error) {
      console.error("Failed to import backup:", error);
      throw error;
    }
  }

  // Maintenance operations
  async performMaintenance(): Promise<{
    deletedSessions: number;
    deletedAudioFiles: number;
    compactedStats: number;
  }> {
    await this.ensureInitialized();
    return timeTrackerDb.performMaintenance();
  }

  async getDatabaseStats(): Promise<{
    activities: number;
    sessions: number;
    audioFiles: number;
    dailyStats: number;
    total: number;
  }> {
    await this.ensureInitialized();
    return timeTrackerDb.getDatabaseSize();
  }

  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    await timeTrackerDb.clearAllData();
  }

  // Helper methods
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Bulk operations for migration
  async bulkAddActivities(activities: Omit<Activity, "id">[]): Promise<void> {
    await this.ensureInitialized();
    await timeTrackerDb.activities.bulkAdd(activities);
  }

  async bulkAddSessions(sessions: Omit<Session, "id">[]): Promise<void> {
    await this.ensureInitialized();
    await timeTrackerDb.sessions.bulkAdd(sessions);
  }

  async getAllSessions(): Promise<Session[]> {
    await this.ensureInitialized();
    return timeTrackerDb.sessions.toArray();
  }

  async saveDailyStats(stats: DailyStats): Promise<void> {
    await this.ensureInitialized();
    await timeTrackerDb.dailyStats.put(stats);
  }

  // Analytics and reporting
  async getProductivityTrends(days: number = 30): Promise<
    Array<{
      date: string;
      workTime: number;
      breakTime: number;
      productivity: number;
      sessionsCompleted: number;
    }>
  > {
    await this.ensureInitialized();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const stats = await this.getDailyStatsForRange(startDate, endDate);

    return stats.map((stat) => ({
      date: stat.dateKey,
      workTime: stat.totalWorkTime,
      breakTime: stat.totalBreakTime,
      productivity: stat.productivity,
      sessionsCompleted: stat.sessionsCompleted,
    }));
  }

  async getTopActivities(days: number = 7): Promise<
    Array<{
      activityName: string;
      totalTime: number;
      sessionCount: number;
      avgSessionTime: number;
    }>
  > {
    await this.ensureInitialized();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const sessions = await this.getCompletedSessionsInRange(startDate, endDate);
    const workSessions = sessions.filter((s) => s.type === "work");

    const activityStats = new Map<
      string,
      { totalTime: number; sessionCount: number }
    >();

    workSessions.forEach((session) => {
      const name = session.activityName;
      if (activityStats.has(name)) {
        const stats = activityStats.get(name)!;
        stats.totalTime += session.duration;
        stats.sessionCount += 1;
      } else {
        activityStats.set(name, {
          totalTime: session.duration,
          sessionCount: 1,
        });
      }
    });

    return Array.from(activityStats.entries())
      .map(([activityName, stats]) => ({
        activityName,
        totalTime: stats.totalTime,
        sessionCount: stats.sessionCount,
        avgSessionTime: Math.round(stats.totalTime / stats.sessionCount),
      }))
      .sort((a, b) => b.totalTime - a.totalTime);
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
