import {
  AlertTriangle,
  Bell,
  Clock,
  Database,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Settings as SettingsIcon,
  Square,
  Sun,
  TestTube,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { databaseService } from "../lib/database-service";
import {
  getNotificationPermission,
  requestNotificationPermission,
  stopNotificationSound,
} from "../lib/notifications";
import { useTimerStore } from "../store";

export default function Settings() {
  const {
    settings,
    sessions,
    updateSettings,
    resetSettings,
    testNotification,
    clearAllSessions,
    clearAllActivities,
  } = useTimerStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    getNotificationPermission()
  );

  // Local state for time inputs to allow temporary invalid states while typing
  const [workTimeInput, setWorkTimeInput] = useState(
    settings.defaultWorkTime.toString()
  );
  const [breakTimeInput, setBreakTimeInput] = useState(
    settings.defaultBreakTime.toString()
  );

  // Sync local state when settings change (e.g., from reset)
  useEffect(() => {
    setWorkTimeInput(settings.defaultWorkTime.toString());
    setBreakTimeInput(settings.defaultBreakTime.toString());
  }, [settings.defaultWorkTime, settings.defaultBreakTime]);

  const handleSettingChange = (key: keyof typeof settings, value: unknown) => {
    updateSettings({ [key]: value });
  };

  const handleWorkTimeChange = (value: string) => {
    // Always update local input state to allow typing
    setWorkTimeInput(value);
  };

  const handleWorkTimeBlur = () => {
    const minutes = parseInt(workTimeInput);
    if (!isNaN(minutes) && minutes >= 1 && minutes <= 120) {
      handleSettingChange("defaultWorkTime", minutes);
    } else {
      // Reset to current setting if invalid
      setWorkTimeInput(settings.defaultWorkTime.toString());
    }
  };

  const handleBreakTimeChange = (value: string) => {
    // Always update local input state to allow typing
    setBreakTimeInput(value);
  };

  const handleBreakTimeBlur = () => {
    const minutes = parseInt(breakTimeInput);
    if (!isNaN(minutes) && minutes >= 1 && minutes <= 60) {
      handleSettingChange("defaultBreakTime", minutes);
    } else {
      // Reset to current setting if invalid
      setBreakTimeInput(settings.defaultBreakTime.toString());
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

  const handleResetSettings = () => {
    resetSettings();
    setShowResetConfirm(false);
  };

  const handleCustomAudioUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("audio/")) {
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

  const handleClearAllData = async () => {
    try {
      // Clear IndexedDB
      await databaseService.clearAllData();

      // Clear Zustand store data
      clearAllActivities();
      clearAllSessions();

      // Clear localStorage (Zustand persist will handle this when store is cleared)
      localStorage.removeItem("timer-storage");

      // Reset settings to defaults but keep current theme
      const currentTheme = settings.theme;
      resetSettings();
      updateSettings({ theme: currentTheme });

      toast.success("All data cleared successfully!");
      setShowClearDataConfirm(false);

      // Reload the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Failed to clear all data:", error);
      toast.error("Failed to clear data. Please try again.");
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-8">
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
                    value={workTimeInput}
                    onChange={(e) => handleWorkTimeChange(e.target.value)}
                    onBlur={handleWorkTimeBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleWorkTimeBlur();
                        e.currentTarget.blur();
                      }
                    }}
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
                    value={breakTimeInput}
                    onChange={(e) => handleBreakTimeChange(e.target.value)}
                    onBlur={handleBreakTimeBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleBreakTimeBlur();
                        e.currentTarget.blur();
                      }
                    }}
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
                    onValueChange={(
                      value: "bell" | "chime" | "gentle" | "digital" | "custom"
                    ) => handleSettingChange("soundType", value)}
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
                    {sessions
                      .slice(-10)
                      .reverse()
                      .map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 border rounded-md text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {session.activityName}
                              <span
                                className={`ml-2 px-2 py-1 rounded text-xs ${
                                  session.type === "work"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-warning/10 text-warning"
                                }`}
                              >
                                {session.type}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              {Math.floor(session.duration / 60000)}min •{" "}
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

          {/* Clear All Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Database className="w-5 h-5" />
                Clear All Data
              </CardTitle>
              <CardDescription>
                Permanently delete all activities, sessions, and custom
                settings. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showClearDataConfirm ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-destructive">
                        Warning: This action cannot be undone
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This will permanently delete:
                      </p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>All activities and their history</li>
                        <li>All completed timer sessions</li>
                        <li>Custom notification sounds</li>
                        <li>All settings (except theme preference)</li>
                        <li>All data from browser storage</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleClearAllData}
                      className="flex items-center gap-2"
                    >
                      <Database className="w-4 h-4" />
                      Yes, delete everything
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowClearDataConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowClearDataConfirm(true)}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <Database className="w-4 h-4" />
                  Clear All Data
                </Button>
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
