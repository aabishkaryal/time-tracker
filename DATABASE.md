# Time Tracker Database Implementation

This document describes the IndexedDB implementation for the Time Tracker application using Dexie.

## Overview

The database layer provides persistent storage for time tracking data with the following key features:

- **Full TypeScript support** with strict typing
- **Offline-first design** using IndexedDB
- **Efficient querying** with compound indexes
- **Data migration** from localStorage
- **Backup and restore** functionality
- **Automatic maintenance** and cleanup

## Database Schema

### Tables

#### Activities
Stores user activities/projects.

```typescript
interface Activity {
  id?: number;
  name: string;
  createdAt: Date;
  lastUsed: Date;
  isArchived: boolean;
}
```

**Indexes**: `name`, `createdAt`, `lastUsed`

#### Sessions
Stores timer sessions (work/break periods).

```typescript
interface Session {
  id?: number;
  activityId: number;
  activityName: string;
  type: 'work' | 'break';
  duration: number; // in seconds
  startTime: Date;
  endTime?: Date;
  dateKey: string; // YYYY-MM-DD format
  completed: boolean;
  metadata?: {
    notes?: string;
    tags?: string[];
    productivity?: number; // 1-5 scale
    interruptions?: number;
  };
}
```

**Indexes**: `activityId`, `startTime`, `dateKey`, `completed`, `type`, `[activityId+dateKey]`, `[completed+dateKey]`

#### AudioFiles
Stores custom notification sounds.

```typescript
interface AudioFile {
  id?: number;
  name: string;
  data: Blob;
  size: number;
  mimeType: string;
  createdAt: Date;
}
```

**Indexes**: `name`, `size`, `createdAt`

#### DailyStats
Aggregated statistics for each day.

```typescript
interface DailyStats {
  dateKey: string; // Primary key: YYYY-MM-DD
  date: Date;
  totalWorkTime: number; // seconds
  totalBreakTime: number; // seconds
  sessionsCompleted: number;
  activitiesUsed: number;
  productivity: number; // average productivity score
  lastUpdated: Date;
}
```

**Indexes**: `date`, `lastUpdated`

## Usage

### Basic Setup

The database is automatically initialized when the application starts:

```typescript
import { timeTrackerDb } from './lib/indexeddb';

// Database is automatically initialized
// All operations are type-safe
```

### Using the Database Service

The `DatabaseService` provides a high-level API for all database operations:

```typescript
import { databaseService } from './lib/database-service';

// Create an activity
const activity = await databaseService.createActivity({
  name: 'Project Work',
  createdAt: new Date()
});

// Create a session
const session = await databaseService.createSession({
  activityId: activity.id.toString(),
  activityName: activity.name,
  type: 'work',
  duration: 1500000, // 25 minutes in milliseconds
  startTime: new Date(),
  endTime: new Date(),
  completed: true
});

// Get sessions for today
const today = new Date();
const todaySessions = await databaseService.getSessionsForDate(today);
```

### Using React Hooks

The `useDatabase` hook provides easy integration with React components:

```typescript
import { useDatabase, useTodayData } from './hooks/useDatabase';

function MyComponent() {
  const { 
    createActivity, 
    getActiveActivities, 
    isInitialized, 
    error 
  } = useDatabase();
  
  const { sessions, stats, isLoading } = useTodayData();
  
  if (!isInitialized) return <div>Initializing database...</div>;
  if (error) return <div>Database error: {error}</div>;
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Today's Sessions: {sessions.length}</h1>
      <h2>Total Work Time: {stats?.totalWorkTime || 0}s</h2>
    </div>
  );
}
```

## Migration from localStorage

To migrate existing data from localStorage:

```typescript
import { databaseService } from './lib/database-service';

// Assume you have existing data from Zustand persist
const existingData = {
  activities: [...], // your existing activities
  sessions: [...]    // your existing sessions
};

await databaseService.migrateFromLocalStorage(existingData);
```

## Analytics and Reporting

### Productivity Trends

```typescript
// Get 30-day productivity trends
const trends = await databaseService.getProductivityTrends(30);

trends.forEach(day => {
  console.log(`${day.date}: ${day.workTime}s work, productivity: ${day.productivity}`);
});
```

### Top Activities

```typescript
// Get top activities for the last 7 days
const topActivities = await databaseService.getTopActivities(7);

topActivities.forEach(activity => {
  console.log(`${activity.activityName}: ${activity.totalTime}s total`);
});
```

## Backup and Restore

### Export Backup

```typescript
const backup = await databaseService.exportBackup();

// Save to file or upload to cloud
const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// Download or upload logic here
```

### Import Backup

```typescript
// From uploaded file
const fileData = await file.text();
const backupData = JSON.parse(fileData);

await databaseService.importBackup(backupData);
```

## Maintenance

### Automatic Cleanup

The database automatically performs maintenance:

- Deletes incomplete sessions older than 24 hours
- Removes audio files older than 30 days
- Compacts statistics tables

```typescript
// Manual maintenance
const results = await databaseService.performMaintenance();
console.log(`Cleaned up ${results.deletedSessions} sessions and ${results.deletedAudioFiles} audio files`);
```

### Database Statistics

```typescript
const stats = await databaseService.getDatabaseStats();
console.log(`Total records: ${stats.total}`);
console.log(`Activities: ${stats.activities}, Sessions: ${stats.sessions}`);
```

## Performance Considerations

### Indexes

The database uses compound indexes for efficient querying:

- `[activityId+dateKey]` - Fast lookup of sessions by activity and date
- `[completed+dateKey]` - Quick filtering of completed sessions by date range

### Query Optimization

- Use date ranges instead of individual date queries
- Leverage compound indexes for multi-field filters
- Use `limit` parameters for pagination
- Consider using `orderBy` sparingly to avoid full table scans

### Storage Limits

IndexedDB has generous storage limits:
- **Chrome/Firefox**: Up to 50% of available disk space
- **Safari**: Up to 1GB
- **Mobile browsers**: Typically 50-100MB

The application data is expected to be well within these limits.

## Error Handling

All database operations include comprehensive error handling:

```typescript
try {
  const result = await databaseService.createActivity({ name: 'Test' });
  console.log('Activity created:', result);
} catch (error) {
  console.error('Failed to create activity:', error);
  // Handle error appropriately
}
```

The `useDatabase` hook automatically handles errors and provides error state:

```typescript
const { error, clearError } = useDatabase();

if (error) {
  return (
    <div>
      <p>Error: {error}</p>
      <button onClick={clearError}>Retry</button>
    </div>
  );
}
```

## Browser Compatibility

The IndexedDB implementation works in all modern browsers:

- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Full support (iOS 10+)
- **Edge**: Full support

For older browsers, consider using a polyfill or fallback to localStorage.

## Future Enhancements

Potential improvements to consider:

1. **Sync with cloud storage** - Add cloud backup/sync capabilities
2. **Real-time collaboration** - Multi-device synchronization
3. **Advanced analytics** - More detailed productivity insights
4. **Data compression** - Reduce storage footprint for large datasets
5. **Encrypted storage** - Add client-side encryption for sensitive data