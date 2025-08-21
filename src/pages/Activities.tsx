import {
  Activity,
  Archive,
  ArchiveRestore,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useTimerStore } from "../store";

export default function Activities() {
  const {
    activities,
    currentActivity,
    selectActivity,
    createActivity,
    deleteActivity,
    archiveActivity,
    unarchiveActivity,
    getArchivedActivities,
    editActivity,
    clearAllActivities,
    getTodaysSessions,
    getTodaysActivityStats,
    loadActivitiesFromIndexedDB,
  } = useTimerStore();

  const todaysSessions = getTodaysSessions();
  const todaysStats = getTodaysActivityStats();
  const totalTimeToday = todaysSessions.reduce(
    (total, session) => total + session.duration,
    0
  );

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newActivityName, setNewActivityName] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [archivedActivities, setArchivedActivities] = useState<
    Array<{ id: string; name: string; createdAt: Date }>
  >([]);
  const [showArchived, setShowArchived] = useState(false);

  const handleCreateActivity = async () => {
    const trimmedName = newActivityName.trim();
    if (trimmedName) {
      const existingActivity = activities.find((a) => a.name === trimmedName);
      if (existingActivity) {
        // If activity already exists, just select it
        selectActivity(existingActivity);
      } else {
        await createActivity(trimmedName);
      }
      setNewActivityName("");
    }
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateActivity();
    }
  };

  const startEditingActivity = (activityId: string, currentName: string) => {
    setEditingActivity(activityId);
    setEditingName(currentName);
  };

  const saveActivityEdit = () => {
    if (editingActivity && editingName.trim()) {
      editActivity(editingActivity, editingName.trim());
    }
    setEditingActivity(null);
    setEditingName("");
  };

  const cancelEdit = () => {
    setEditingActivity(null);
    setEditingName("");
  };

  const handleClearActivities = () => {
    clearAllActivities();
    setShowClearConfirm(false);
  };

  // Load archived activities on component mount and refresh activities
  useEffect(() => {
    const loadData = async () => {
      // Refresh activities from IndexedDB
      await loadActivitiesFromIndexedDB();
      // Load archived activities
      const archived = await getArchivedActivities();
      setArchivedActivities(archived);
    };
    loadData();
  }, [getArchivedActivities, loadActivitiesFromIndexedDB]);

  const handleArchiveActivity = async (activityId: string) => {
    await archiveActivity(activityId);
    // Refresh archived activities list
    const archived = await getArchivedActivities();
    setArchivedActivities(archived);
  };

  const handleUnarchiveActivity = async (activityId: string) => {
    await unarchiveActivity(activityId);
    // Refresh archived activities list
    const archived = await getArchivedActivities();
    setArchivedActivities(archived);
  };

  return (
    <div className="h-full p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Activities
          </h1>
          <p className="text-muted-foreground">
            Manage your activity list for better time tracking
          </p>
        </div>

        <div className="space-y-6">
          {/* Create New Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Activity
              </CardTitle>
              <CardDescription>
                Create a new activity to track your work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="new-activity" className="sr-only">
                    Activity name
                  </Label>
                  <Input
                    id="new-activity"
                    type="text"
                    placeholder="Enter activity name..."
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    onKeyDown={handleCreateKeyDown}
                    className="flex-1"
                  />
                </div>
                <Button
                  onClick={handleCreateActivity}
                  disabled={!newActivityName.trim()}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Your Activities ({activities.length})
              </CardTitle>
              <CardDescription>
                {currentActivity
                  ? `Currently selected: "${currentActivity.name}"`
                  : "No activity currently selected"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.length > 0 ? (
                <>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                          currentActivity?.id === activity.id
                            ? "bg-primary/5 border-primary/20"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        {editingActivity === activity.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveActivityEdit();
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="flex-1"
                              autoFocus
                            />
                            <Button size="sm" onClick={saveActivityEdit}>
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                            >
                              ×
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-medium ${
                                    currentActivity?.id === activity.id
                                      ? "text-primary"
                                      : ""
                                  }`}
                                >
                                  {activity.name}
                                </span>
                                {currentActivity?.id === activity.id && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Created{" "}
                                {new Date(
                                  activity.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {currentActivity?.id !== activity.id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => selectActivity(activity)}
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                >
                                  Select
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  startEditingActivity(
                                    activity.id,
                                    activity.name
                                  )
                                }
                                title="Edit activity name"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleArchiveActivity(activity.id)
                                }
                                className="text-warning hover:text-warning"
                                title="Archive activity"
                              >
                                <Archive className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteActivity(activity.id)}
                                className="text-destructive hover:text-destructive"
                                title="Delete activity permanently"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    {showClearConfirm ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Are you sure you want to delete all activities? This
                          cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleClearActivities}
                          >
                            Yes, delete all
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowClearConfirm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setShowClearConfirm(true)}
                        className="flex items-center gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Activities
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    No activities yet
                  </h3>
                  <p className="text-sm">
                    Create your first activity above to start organizing your
                    work
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Archived Activities */}
          {archivedActivities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setShowArchived(!showArchived)}
                >
                  {showArchived ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                  <Archive className="w-5 h-5" />
                  Archived Activities ({archivedActivities.length})
                </CardTitle>
                <CardDescription>
                  Activities that have been archived and are hidden from the
                  main timer
                </CardDescription>
              </CardHeader>
              {showArchived && (
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {archivedActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-muted-foreground">
                              {activity.name}
                            </span>
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                              Archived
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Created{" "}
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnarchiveActivity(activity.id)}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            title="Restore activity"
                          >
                            <ArchiveRestore className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteActivity(activity.id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Today's Summary
              </CardTitle>
              <CardDescription>
                Your productivity stats for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {formatTime(totalTimeToday)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Time
                    </div>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {todaysSessions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Sessions
                    </div>
                  </div>
                </div>

                {todaysStats.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Top Activities Today
                    </h4>
                    <div className="space-y-2">
                      {todaysStats.map((stat, index) => (
                        <div
                          key={stat.activityName}
                          className="flex items-center justify-between p-2 bg-accent/30 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                              #{index + 1}
                            </span>
                            <span className="font-medium">
                              {stat.activityName}
                            </span>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">
                              {formatTime(stat.totalTime)}
                            </div>
                            <div className="text-muted-foreground">
                              {stat.sessionCount} sessions
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No completed sessions today</p>
                    <p className="text-sm">
                      Start a timer to see your progress!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
