import { Coffee, Pause, Play, RotateCcw, Square } from "lucide-react";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CircularProgress } from "../components/CircularProgress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { stopNotificationSound } from "../lib/notifications";
import { useTimerStore } from "../store";

export default function Timer() {
  const {
    totalDuration,
    isRunning,
    isPaused,
    currentActivity,
    activities,
    settings,
    currentSessionType,
    justCompleted,
    getTimeRemaining,
    checkTimerCompletion,
    startTimer,
    pauseTimer,
    resetTimer,
    setCustomTimeMs,
    setSessionType,
    selectActivity,
    createActivity,
  } = useTimerStore();

  const timeRemaining = getTimeRemaining();

  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [isEditingSeconds, setIsEditingSeconds] = useState(false);
  const [editingMinutes, setEditingMinutes] = useState("");
  const [editingSeconds, setEditingSeconds] = useState("");
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");

  const formatTime = (
    milliseconds: number
  ): { minutes: string; seconds: string } => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return {
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  };

  const getTimerState = () => {
    if (timeRemaining === 0 && hasBeenStarted) return "completed";
    if (isRunning) return "running";
    if (isPaused) return "paused";
    return "idle";
  };

  // Timer update and completion check effect
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setUpdateTick] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    let animationId: number;

    const updateTimer = () => {
      if (isRunning) {
        // Force re-render by incrementing tick
        setUpdateTick();
        // Check for timer completion
        checkTimerCompletion().catch((error) => {
          console.error("Timer completion check failed:", error);
        });
        // Schedule next frame
        animationId = requestAnimationFrame(updateTimer);
      }
    };

    if (isRunning) {
      animationId = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isRunning, checkTimerCompletion]);

  // Track previous time remaining to detect completion
  const prevTimeRemainingRef = useRef<number>(timeRemaining);
  const isBreakMode = currentSessionType === "break";

  // Track if timer was actually started (not just set to 0:00)
  const [hasBeenStarted, setHasBeenStarted] = useState(false);

  // Set hasBeenStarted when timer starts running
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      setHasBeenStarted(true);
    }
  }, [isRunning, isPaused, timeRemaining]);

  // Reset hasBeenStarted when time is manually changed (but not during auto-transitions)
  const [isAutoTransition, setIsAutoTransition] = useState(false);
  useEffect(() => {
    if (!isAutoTransition) {
      // Reset when totalDuration changes (manual time setting)
      setHasBeenStarted(false);
    }
    setIsAutoTransition(false); // Reset the flag
  }, [totalDuration, isAutoTransition]);

  // Ensure timer starts properly by tracking actual start state
  useEffect(() => {
    if (isRunning && timeRemaining < totalDuration) {
      setHasBeenStarted(true);
    }
  }, [isRunning, timeRemaining, totalDuration]);

  // Detect timer completion
  useEffect(() => {
    // Timer just completed (went from >0 to 0)
    if (prevTimeRemainingRef.current > 0 && timeRemaining === 0) {
      // Handle auto-start break if enabled
      if (!isBreakMode && settings.autoStartBreak) {
        setTimeout(() => {
          const breakTime = settings.defaultBreakTime * 60 * 1000;
          setIsAutoTransition(true); // Mark as auto-transition
          setCustomTimeMs(breakTime);
          setSessionType("break");
          startTimer();
        }, 1000); // Small delay to show completion message
      } else if (isBreakMode) {
        // Break completed, switch back to work mode
        setSessionType("work");
        const workTime = settings.defaultWorkTime * 60 * 1000;
        setIsAutoTransition(true); // Mark as auto-transition
        setCustomTimeMs(workTime);
      }
    }

    prevTimeRemainingRef.current = timeRemaining;
  }, [
    timeRemaining,
    isBreakMode,
    settings.autoStartBreak,
    settings.defaultBreakTime,
    settings.defaultWorkTime,
    setCustomTimeMs,
    setSessionType,
    startTimer,
  ]);

  const { minutes, seconds } = formatTime(timeRemaining);

  // Make progress calculation reactive to updateTick
  const progress = useMemo(() => {
    if (totalDuration === 0) return 0;
    const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;
    return progress;
  }, [timeRemaining, totalDuration]);

  const timerState = getTimerState();

  const stateText = {
    idle: isBreakMode ? "Break time - ready to start" : "Ready to start",
    running: isBreakMode ? "Break time running" : "Timer running",
    paused: isBreakMode ? "Break paused" : "Timer paused",
    completed: isBreakMode ? "Break completed!" : "Session completed!",
  };

  const isEditable = !isRunning && !isPaused;

  // Reset to default time for current mode from settings
  const resetToDefault = () => {
    stopNotificationSound(); // Stop any playing sound
    const defaultTimeMs = isBreakMode
      ? settings.defaultBreakTime * 60 * 1000
      : settings.defaultWorkTime * 60 * 1000;
    const currentMode = currentSessionType; // Capture current mode
    setCustomTimeMs(defaultTimeMs);
    // Restore the session type to preserve current mode
    setTimeout(() => {
      setSessionType(currentMode);
    }, 0);
    setHasBeenStarted(false); // Reset the started state
  };

  const handleStopTimer = () => {
    stopNotificationSound(); // Stop any playing sound
    resetTimer(); // Reset timer to current totalTime
    setHasBeenStarted(false); // Reset the started state
  };

  const handleActivityChange = (activityId: string) => {
    if (activityId === "create-new") {
      setIsCreatingActivity(true);
      return;
    }

    if (activityId === "unnamed") {
      selectActivity(null);
      // Reset to default time when switching to unnamed
      const defaultTimeMs = settings.defaultWorkTime * 60 * 1000;
      setCustomTimeMs(defaultTimeMs);
      setSessionType("work");
    } else {
      const activity = activities.find((a) => a.id === activityId);
      if (activity) {
        selectActivity(activity);
        // Reset to default time when switching activities
        const defaultTimeMs = settings.defaultWorkTime * 60 * 1000;
        setCustomTimeMs(defaultTimeMs);
        setSessionType("work");
      }
    }
    setHasBeenStarted(false);
  };

  const handleCreateActivity = async () => {
    const trimmedName = newActivityName.trim();
    if (trimmedName) {
      const existingActivity = activities.find((a) => a.name === trimmedName);
      if (existingActivity) {
        selectActivity(existingActivity);
      } else {
        await createActivity(trimmedName);
      }
      // Reset to default time when creating/selecting new activity
      const defaultTimeMs = settings.defaultWorkTime * 60 * 1000;
      setCustomTimeMs(defaultTimeMs);
      setSessionType("work");
      setHasBeenStarted(false);
    }
    setIsCreatingActivity(false);
    setNewActivityName("");
  };

  const handleCancelCreate = () => {
    setIsCreatingActivity(false);
    setNewActivityName("");
  };

  const handleMinutesClick = () => {
    if (!isEditable) return;
    setIsEditingMinutes(true);
    setEditingMinutes(Math.floor(totalDuration / 60000).toString());
  };

  const handleSecondsClick = () => {
    if (!isEditable) return;
    setIsEditingSeconds(true);
    setEditingSeconds(
      Math.floor((totalDuration % 60000) / 1000)
        .toString()
        .padStart(2, "0")
    );
  };

  const handleMinutesSave = () => {
    const mins = parseInt(editingMinutes) || 0;
    const currentSeconds = Math.floor((totalDuration % 60000) / 1000);
    if (mins >= 0 && mins <= 120) {
      const newTimeMs = (mins * 60 + currentSeconds) * 1000;
      const currentMode = currentSessionType; // Capture current mode before making changes
      // Allow setting to 0, even though it can't be started
      setCustomTimeMs(newTimeMs);
      // Restore the session type after setting custom time
      setTimeout(() => {
        setSessionType(currentMode);
      }, 0);
      setHasBeenStarted(false); // Reset started state when manually editing
    }
    setIsEditingMinutes(false);
  };

  const handleSecondsSave = () => {
    const secs = parseInt(editingSeconds) || 0;
    const currentMinutes = Math.floor(totalDuration / 60000);

    // Ensure seconds are within valid range
    if (secs >= 0 && secs <= 59) {
      const newTimeMs = (currentMinutes * 60 + secs) * 1000;
      const currentMode = currentSessionType; // Capture current mode before making changes
      // Allow setting to 0, even though it can't be started
      setCustomTimeMs(newTimeMs);
      // Restore the session type after setting custom time
      setTimeout(() => {
        setSessionType(currentMode);
      }, 0);
      setHasBeenStarted(false); // Reset started state when manually editing
    }
    setIsEditingSeconds(false);
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleMinutesSave();
    } else if (e.key === "Escape") {
      setIsEditingMinutes(false);
    }
  };

  const handleSecondsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSecondsSave();
    } else if (e.key === "Escape") {
      setIsEditingSeconds(false);
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Activity Name - Inline Editable */}
        <div className="text-center mb-8">
          {isBreakMode && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coffee className="w-5 h-5 text-warning" />
              <span className="text-warning font-medium">Break Time</span>
            </div>
          )}

          {!isBreakMode && (
            <div className="mb-4">
              {isCreatingActivity ? (
                <div className="max-w-md mx-auto space-y-3">
                  <input
                    type="text"
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateActivity();
                      if (e.key === "Escape") handleCancelCreate();
                    }}
                    placeholder="Enter activity name..."
                    className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-2 border-primary/30 rounded-lg px-4 py-2 text-center text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-colors"
                    autoFocus
                  />
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={handleCreateActivity}
                      disabled={!newActivityName.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Create
                    </button>
                    <button
                      onClick={handleCancelCreate}
                      className="px-4 py-2 bg-muted text-muted-foreground rounded-md font-medium hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <Select
                  value={currentActivity?.id || "unnamed"}
                  onValueChange={handleActivityChange}
                  disabled={!isEditable}
                >
                  <SelectTrigger className="w-full max-w-md mx-auto text-2xl sm:text-3xl font-bold h-auto py-2 border-none bg-transparent hover:bg-accent/50 transition-colors text-center justify-center">
                    <SelectValue placeholder="Select activity">
                      <span className="text-2xl sm:text-3xl font-bold text-foreground">
                        {currentActivity?.name || "Unnamed Activity"}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unnamed">
                      <span className="text-muted-foreground">
                        Unnamed Activity
                      </span>
                    </SelectItem>
                    {activities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        {activity.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="create-new">
                      <span className="text-primary font-medium">
                        + Create New Activity
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <p
            className={`text-lg sm:text-xl font-medium transition-colors duration-300 ${
              timerState === "running"
                ? isBreakMode
                  ? "text-warning"
                  : "text-primary"
                : timerState === "paused"
                ? "text-warning"
                : timerState === "completed"
                ? isBreakMode
                  ? "text-warning"
                  : "text-muted-foreground"
                : "text-muted-foreground"
            }`}
          >
            {stateText[timerState]}
          </p>
        </div>

        {/* Timer Circle */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <CircularProgress
            progress={progress}
            size={320}
            strokeWidth={8}
            state={timerState as "idle" | "running" | "paused" | "completed"}
            isBreakMode={isBreakMode}
          >
            {/* Timer Display */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {isEditingMinutes ? (
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={editingMinutes}
                    onChange={(e) =>
                      setEditingMinutes(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    onBlur={handleMinutesSave}
                    onKeyDown={handleMinutesKeyDown}
                    className="w-16 sm:w-20 text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-foreground bg-transparent border-none outline-none text-center"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={handleMinutesClick}
                    className={`text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-foreground ${
                      isEditable
                        ? "cursor-pointer hover:text-primary transition-colors"
                        : "cursor-default"
                    }`}
                    title={isEditable ? "Click to edit minutes" : ""}
                  >
                    {minutes}
                  </span>
                )}

                <span
                  className={`text-3xl sm:text-4xl md:text-5xl font-mono font-bold transition-opacity duration-500 ${
                    isRunning ? "opacity-50" : "opacity-100"
                  } text-muted-foreground`}
                >
                  :
                </span>

                {isEditingSeconds ? (
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={editingSeconds}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9]/g, "");

                      // If 3+ characters, take the last 2
                      if (value.length > 2) {
                        value = value.slice(-2);
                      }

                      // Check if valid (empty or <= 59)
                      if (value === "" || parseInt(value) <= 59) {
                        setEditingSeconds(value);
                      }
                    }}
                    onBlur={handleSecondsSave}
                    onKeyDown={handleSecondsKeyDown}
                    className="w-16 sm:w-20 text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-foreground bg-transparent border-none outline-none text-center"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={handleSecondsClick}
                    className={`text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-foreground ${
                      isEditable
                        ? "cursor-pointer hover:text-primary transition-colors"
                        : "cursor-default"
                    }`}
                    title={isEditable ? "Click to edit seconds" : ""}
                  >
                    {seconds}
                  </span>
                )}
              </div>
            </div>
          </CircularProgress>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {/* Break Mode Toggle Button */}
          <button
            onClick={() => {
              if (isBreakMode) {
                setSessionType("work");
                const workTime = settings.defaultWorkTime * 60 * 1000;
                setCustomTimeMs(workTime);
              } else {
                setSessionType("break");
                const breakTime = settings.defaultBreakTime * 60 * 1000;
                setCustomTimeMs(breakTime);
              }
              setHasBeenStarted(false);
            }}
            disabled={isRunning}
            className={`group relative flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-ring/20 ${
              isRunning
                ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                : justCompleted && !isBreakMode
                ? "bg-gradient-to-r from-warning to-warning/80 text-warning-foreground shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-warning/20 hover:border-warning/40 animate-pulse"
                : isBreakMode
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
                : "bg-card hover:bg-accent text-card-foreground border-2 border-border hover:border-accent-foreground/20"
            }`}
            title={isBreakMode ? "Switch to work mode" : "Switch to break mode"}
          >
            <Coffee
              className={`w-4 h-4 transition-transform ${
                justCompleted && !isBreakMode
                  ? "group-hover:scale-125 group-hover:rotate-12"
                  : ""
              }`}
            />
            <span className="text-sm">{isBreakMode ? "Work" : "Break"}</span>
            {justCompleted && !isBreakMode && (
              <div className="w-2 h-2 bg-warning-foreground/60 rounded-full animate-ping"></div>
            )}
          </button>

          {/* Primary Action Button - Start/Pause */}
          {!isRunning ? (
            <button
              onClick={startTimer}
              disabled={timeRemaining === 0}
              className={`group relative flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 focus:outline-none min-w-[140px] ${
                timeRemaining === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-primary text-primary-foreground hover:shadow-xl transform hover:scale-105 focus:ring-4 focus:ring-primary/30"
              }`}
              title={
                timeRemaining === 0
                  ? "Set timer to a value greater than 00:00 to start"
                  : undefined
              }
            >
              <Play
                className={`w-5 h-5 transition-transform ${
                  timeRemaining === 0 ? "" : "group-hover:scale-110"
                }`}
              />
              <span>{isPaused ? "Resume" : "Start"}</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="group relative flex items-center justify-center space-x-3 bg-warning text-warning-foreground px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-warning/30 min-w-[140px]"
            >
              <Pause className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Pause</span>
            </button>
          )}

          {/* Secondary Actions */}
          <div className="flex space-x-4">
            {/* Stop Button - Reset to current custom time */}
            <button
              onClick={handleStopTimer}
              className="group relative flex items-center justify-center space-x-2 bg-card hover:bg-accent text-card-foreground px-6 py-4 rounded-xl font-medium border-2 border-border hover:border-accent-foreground/20 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-ring/20"
              title="Stop and reset to current time"
            >
              <Square className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Stop</span>
            </button>

            {/* Reset Button - Reset to default time */}
            <button
              onClick={resetToDefault}
              className="group relative flex items-center justify-center space-x-2 bg-card hover:bg-accent text-card-foreground px-6 py-4 rounded-xl font-medium border-2 border-border hover:border-accent-foreground/20 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-ring/20"
              title="Reset to default time"
            >
              <RotateCcw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Timer completion message */}
        {justCompleted && hasBeenStarted && (
          <div className="mt-6 p-4 bg-primary/10 border-2 border-primary/20 rounded-lg text-center">
            <p className="text-primary font-bold text-xl">
              {isBreakMode ? "☕ Break Complete!" : "🎉 Session Complete!"}
            </p>
            {!isBreakMode && currentActivity?.name && (
              <p className="text-primary/90 text-base mt-1">
                Great work on "{currentActivity.name}"
              </p>
            )}
            {isBreakMode && (
              <p className="text-primary/90 text-base mt-1">
                Time to get back to work!
              </p>
            )}

            {!isBreakMode && settings.autoStartBreak && (
              <p className="text-primary/80 text-sm mt-2">
                Break timer ({settings.defaultBreakTime}m) will start
                automatically...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
