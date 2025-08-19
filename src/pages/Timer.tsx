import { Coffee, Pause, Play, RotateCcw, Square } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { CircularProgress } from "../components/CircularProgress";
import { useTimerStore } from "../store";

export default function Timer() {
  const {
    timeRemaining,
    totalTime,
    isRunning,
    isPaused,
    currentActivity,
    activities,
    settings,
    startTimer,
    pauseTimer,
    stopTimer,
    setCustomTimeMs,
    createActivity,
    selectActivity,
    tick,
  } = useTimerStore();

  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [editingActivityName, setEditingActivityName] = useState("");
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [isEditingSeconds, setIsEditingSeconds] = useState(false);
  const [editingMinutes, setEditingMinutes] = useState("");
  const [editingSeconds, setEditingSeconds] = useState("");

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

  const getProgress = (): number => {
    if (totalTime === 0) return 0;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const getTimerState = () => {
    if (timeRemaining === 0) return "completed";
    if (isRunning) return "running";
    if (isPaused) return "paused";
    return "idle";
  };

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, tick]);

  // Track previous time remaining to detect completion
  const prevTimeRemainingRef = useRef<number>(timeRemaining);
  const [isBreakMode, setIsBreakMode] = useState(false);

  // Detect timer completion
  useEffect(() => {
    // Timer just completed (went from >0 to 0)
    if (prevTimeRemainingRef.current > 0 && timeRemaining === 0) {
      // Handle auto-start break if enabled
      if (!isBreakMode && settings.autoStartBreak) {
        setTimeout(() => {
          const breakTime = settings.defaultBreakTime * 60 * 1000;
          setCustomTimeMs(breakTime);
          setIsBreakMode(true);
          startTimer();
        }, 1000); // Small delay to show completion message
      } else if (isBreakMode) {
        // Break completed, switch back to work mode
        setIsBreakMode(false);
        const workTime = settings.defaultWorkTime * 60 * 1000;
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
    startTimer,
  ]);

  const { minutes, seconds } = formatTime(timeRemaining);
  const progress = getProgress();
  const timerState = getTimerState();

  const stateText = {
    idle: isBreakMode ? "Break time - ready to start" : "Ready to start",
    running: isBreakMode ? "Break time running" : "Timer running",
    paused: isBreakMode ? "Break paused" : "Timer paused",
    completed: isBreakMode ? "Break completed!" : "Session completed!",
  };

  const isEditable = !isRunning && !isPaused && timeRemaining > 0;

  // Reset to default work time from settings
  const resetToDefault = () => {
    const defaultTimeMs = settings.defaultWorkTime * 60 * 1000;
    setCustomTimeMs(defaultTimeMs);
  };

  const handleActivityClick = () => {
    if (!isEditable) return;
    setIsEditingActivity(true);
    setEditingActivityName(currentActivity?.name || "");
  };

  const handleActivitySave = () => {
    const trimmedName = editingActivityName.trim();

    if (trimmedName) {
      if (currentActivity && trimmedName === currentActivity.name) {
        // No change, just exit edit mode
        setIsEditingActivity(false);
        return;
      }
      // Check if activity exists
      const existingActivity = activities.find((a) => a.name === trimmedName);
      if (existingActivity) {
        selectActivity(existingActivity);
      } else {
        createActivity(trimmedName);
      }
    } else {
      // If cleared, remove current activity (will show "Unnamed Activity")
      selectActivity(null);
    }
    setIsEditingActivity(false);
  };

  const handleActivityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleActivitySave();
    } else if (e.key === "Escape") {
      setIsEditingActivity(false);
    }
  };

  const handleMinutesClick = () => {
    if (!isEditable) return;
    setIsEditingMinutes(true);
    setEditingMinutes(Math.floor(totalTime / 60000).toString());
  };

  const handleSecondsClick = () => {
    if (!isEditable) return;
    setIsEditingSeconds(true);
    setEditingSeconds(
      Math.floor((totalTime % 60000) / 1000)
        .toString()
        .padStart(2, "0")
    );
  };

  const handleMinutesSave = () => {
    const mins = parseInt(editingMinutes) || 0;
    const currentSeconds = Math.floor((totalTime % 60000) / 1000);
    if (mins >= 0 && mins <= 120) {
      const newTimeMs = (mins * 60 + currentSeconds) * 1000;
      if (newTimeMs > 0) {
        setCustomTimeMs(newTimeMs);
        setIsBreakMode(false); // Reset break mode when manually setting time
      }
    }
    setIsEditingMinutes(false);
  };

  const handleSecondsSave = () => {
    const secs = parseInt(editingSeconds) || 0;
    const currentMinutes = Math.floor(totalTime / 60000);

    // Ensure seconds are within valid range
    if (secs >= 0 && secs <= 59) {
      const newTimeMs = (currentMinutes * 60 + secs) * 1000;
      if (newTimeMs > 0) {
        setCustomTimeMs(newTimeMs);
        setIsBreakMode(false); // Reset break mode when manually setting time
      }
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Activity Name - Inline Editable */}
        <div className="text-center mb-8">
          {isBreakMode && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coffee className="w-5 h-5 text-warning" />
              <span className="text-warning font-medium">Break Time</span>
            </div>
          )}

          {!isBreakMode &&
            (isEditingActivity ? (
              <input
                type="text"
                value={editingActivityName}
                onChange={(e) => setEditingActivityName(e.target.value)}
                onBlur={handleActivitySave}
                onKeyDown={handleActivityKeyDown}
                className="text-2xl sm:text-3xl font-bold bg-transparent border-none outline-none text-center text-foreground placeholder-muted-foreground w-full mb-4"
                placeholder="Enter activity name..."
                autoFocus
              />
            ) : (
              <h1
                onClick={handleActivityClick}
                className={`text-2xl sm:text-3xl font-bold text-foreground mb-4 ${
                  isEditable
                    ? "cursor-pointer hover:text-primary transition-colors"
                    : "cursor-default"
                }`}
                title={isEditable ? "Click to edit activity name" : ""}
              >
                {currentActivity?.name || "Unnamed Activity"}
              </h1>
            ))}

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
            state={timerState as 'idle' | 'running' | 'paused' | 'completed'}
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
          {/* Primary Action Button - Start/Pause */}
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="group relative flex items-center justify-center space-x-3 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 min-w-[140px]"
            >
              <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
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
              onClick={stopTimer}
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
        {timeRemaining === 0 && (
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
