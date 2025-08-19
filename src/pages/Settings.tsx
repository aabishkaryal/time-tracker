import {
  Activity,
  Bell,
  Check,
  Clock,
  Edit3,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Settings as SettingsIcon,
  Sun,
  TestTube,
  Trash2,
  Volume2,
  VolumeX,
  Square,
} from "lucide-react";
import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Switch } from "../components/ui/switch";
import {
  getNotificationPermission,
  requestNotificationPermission,
  stopNotificationSound,
} from "../lib/notifications";
import { useTimerStore } from "../store";
import { toast } from "sonner";

export default function Settings() {
  const {
    settings,
    activities,
    sessions,
    updateSettings,
    resetSettings,
    testNotification,
    deleteActivity,
    editActivity,
    clearAllActivities,
    clearAllSessions,
  } = useTimerStore();

  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearActivitiesConfirm, setShowClearActivitiesConfirm] =
    useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    getNotificationPermission()
  );

  const handleSettingChange = (key: keyof typeof settings, value: unknown) => {
    updateSettings({ [key]: value });
  };

  const handleWorkTimeChange = (value: string) => {
    const minutes = parseInt(value);
    if (!isNaN(minutes) && minutes >= 1 && minutes <= 120) {
      handleSettingChange("defaultWorkTime", minutes);
    }
  };

  const handleBreakTimeChange = (value: string) => {
    const minutes = parseInt(value);
    if (!isNaN(minutes) && minutes >= 1 && minutes <= 60) {
      handleSettingChange("defaultBreakTime", minutes);
    }
  };

  const handleTestNotification = async () => {
    if (
      settings.notificationType === "browser" &&
      notificationPermission !== "granted"
    ) {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      if (permission !== "granted") {
        alert(
          "Browser notifications are not allowed. Please enable them in your browser settings."
        );
        return;
      }
    }
    testNotification();
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

  const handleResetSettings = () => {
    resetSettings();
    setShowResetConfirm(false);
  };

  const handleClearActivities = () => {
    clearAllActivities();
    setShowClearActivitiesConfirm(false);
  };

  const handleCustomAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast.error("Please select a valid audio file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const audioDataUrl = e.target?.result as string;
      updateSettings({
        customAudioFile: audioDataUrl,
        customAudioName: file.name,
      });
      toast.success(`Custom audio "${file.name}" uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAudio = () => {
    updateSettings({
      customAudioFile: null,
      customAudioName: null,
      soundType: "bell", // Reset to default
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <SettingsIcon className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your time tracking experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Timer Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timer Settings
              </CardTitle>
              <CardDescription>
                Configure default timer durations and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="work-time">Default Work Time (minutes)</Label>
                  <Input
                    id="work-time"
                    type="number"
                    min="1"
                    max="120"
                    value={settings.defaultWorkTime}
                    onChange={(e) => handleWorkTimeChange(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Between 1 and 120 minutes
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break-time">
                    Default Break Time (minutes)
                  </Label>
                  <Input
                    id="break-time"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.defaultBreakTime}
                    onChange={(e) => handleBreakTimeChange(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Between 1 and 60 minutes
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-start-break"
                  checked={settings.autoStartBreak}
                  onCheckedChange={(checked) =>
                    handleSettingChange("autoStartBreak", checked)
                  }
                />
                <Label htmlFor="auto-start-break" className="cursor-pointer">
                  Automatically start break timer after work session
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified when timers complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Notification Type</Label>
                <RadioGroup
                  value={settings.notificationType}
                  onValueChange={(value: "sound" | "browser" | "none") =>
                    handleSettingChange("notificationType", value)
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sound" id="sound" />
                    <Label
                      htmlFor="sound"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      Sound (Audio chime)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="browser" id="browser" />
                    <Label
                      htmlFor="browser"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Monitor className="w-4 h-4" />
                      Browser Notification
                      {notificationPermission === "denied" && (
                        <span className="text-xs text-destructive">
                          (Blocked)
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label
                      htmlFor="none"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <VolumeX className="w-4 h-4" />
                      None (Silent)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Sound Type Selection - Only show when sound notification is selected */}
              {settings.notificationType === "sound" && (
                <div className="space-y-3 p-3 bg-accent/50 rounded-md">
                  <Label>Sound Type</Label>
                  <RadioGroup
                    value={settings.soundType}
                    onValueChange={(value: "bell" | "chime" | "gentle" | "digital" | "custom") =>
                      handleSettingChange("soundType", value)
                    }
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bell" id="bell" />
                      <Label htmlFor="bell" className="cursor-pointer">
                        🔔 Bell (Default)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="chime" id="chime" />
                      <Label htmlFor="chime" className="cursor-pointer">
                        🎵 Chime
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gentle" id="gentle" />
                      <Label htmlFor="gentle" className="cursor-pointer">
                        🌸 Gentle
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="digital" id="digital" />
                      <Label htmlFor="digital" className="cursor-pointer">
                        💾 Digital Beep
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="cursor-pointer">
                        📁 Custom Audio File
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Custom Audio File Upload */}
                  {settings.soundType === "custom" && (
                    <div className="mt-3 p-3 bg-background/50 border rounded-md space-y-3">
                      <Label>Upload Audio File</Label>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={handleCustomAudioUpload}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                          Supported formats: MP3, WAV, OGG, M4A (max 2MB)
                        </p>
                        {settings.customAudioName && (
                          <div className="flex items-center justify-between p-2 bg-accent/30 rounded text-sm">
                            <span>📄 {settings.customAudioName}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleRemoveCustomAudio}
                              className="h-6 px-2 text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Test Notification
                </Button>
                
                {settings.notificationType === "sound" && (
                  <Button
                    onClick={stopNotificationSound}
                    variant="outline"
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <Square className="w-4 h-4" />
                    Stop Sound
                  </Button>
                )}
              </div>

              {settings.notificationType === "browser" &&
                notificationPermission !== "granted" && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">
                      Browser notifications are not enabled. Click "Test
                      Notification" to enable them.
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Theme</Label>
                <RadioGroup
                  value={settings.theme}
                  onValueChange={(value: "light" | "dark" | "system") =>
                    handleSettingChange("theme", value)
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label
                      htmlFor="light"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label
                      htmlFor="dark"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label
                      htmlFor="system"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Monitor className="w-4 h-4" />
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Activity Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity Management
              </CardTitle>
              <CardDescription>
                Manage your saved activities and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <Label>Saved Activities ({activities.length})</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-2 border rounded-md"
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
                              <span className="flex-1">{activity.name}</span>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    startEditingActivity(
                                      activity.id,
                                      activity.name
                                    )
                                  }
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteActivity(activity.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    {showClearActivitiesConfirm ? (
                      <div className="space-y-2">
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
                            onClick={() => setShowClearActivitiesConfirm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setShowClearActivitiesConfirm(true)}
                        className="flex items-center gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Activities
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No activities saved yet</p>
                  <p className="text-sm">
                    Activities will appear here as you create them
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Session History (Debug)
              </CardTitle>
              <CardDescription>
                Completed timer sessions ({sessions.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.length > 0 ? (
                <>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sessions.slice(-10).reverse().map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 border rounded-md text-sm"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {session.activityName} 
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              session.type === 'work' 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-warning/10 text-warning'
                            }`}>
                              {session.type}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            {Math.floor(session.duration / 60000)}min • {' '}
                            {new Date(session.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      onClick={() => clearAllSessions()}
                      className="flex items-center gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All Sessions
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No completed sessions yet</p>
                  <p className="text-sm">
                    Sessions will appear here as you complete timers
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reset Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <RotateCcw className="w-5 h-5" />
                Reset Settings
              </CardTitle>
              <CardDescription>
                Reset all settings to their default values
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showResetConfirm ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to reset all settings to defaults?
                    This will not affect your saved activities.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleResetSettings}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Yes, reset settings
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowResetConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
