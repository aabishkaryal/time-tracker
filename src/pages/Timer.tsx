import { Pause, Play, RotateCcw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { playNotificationSound } from "../lib/notifications";
import { useTimerStore } from "../store";

export default function Timer() {
  const {
    timeRemaining,
    totalTime,
    isRunning,
    isPaused,
    currentActivity,
    activities,
    startTimer,
    pauseTimer,
    resetTimer,
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

  const getStrokeColor = (state: string) => {
    switch (state) {
      case "running":
        return "#10b981"; // green-500
      case "paused":
        return "#f59e0b"; // yellow-500
      case "completed":
        return "#8b5cf6"; // purple-500
      default:
        return "#9ca3af"; // gray-400
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(tick, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // Track previous time remaining to detect completion
  const prevTimeRemainingRef = useRef<number>(timeRemaining);


  // Detect timer completion and play notification
  useEffect(() => {
    // Timer just completed (went from >0 to 0)
    if (prevTimeRemainingRef.current > 0 && timeRemaining === 0) {
      playNotificationSound();
    }

    prevTimeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  const { minutes, seconds } = formatTime(timeRemaining);
  const progress = getProgress();
  const timerState = getTimerState();

  const stateText = {
    idle: "Ready to start",
    running: "Timer running",
    paused: "Timer paused",
    completed: "Session completed!",
  };

  const isEditable = !isRunning && !isPaused && timeRemaining > 0;

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
          {isEditingActivity ? (
            <input
              type="text"
              value={editingActivityName}
              onChange={(e) => setEditingActivityName(e.target.value)}
              onBlur={handleActivitySave}
              onKeyDown={handleActivityKeyDown}
              className="text-2xl sm:text-3xl font-bold bg-transparent border-none outline-none text-center text-gray-800 placeholder-gray-400 w-full mb-4"
              placeholder="Enter activity name..."
              autoFocus
            />
          ) : (
            <h1
              onClick={handleActivityClick}
              className={`text-2xl sm:text-3xl font-bold text-gray-800 mb-4 ${
                isEditable
                  ? "cursor-pointer hover:text-blue-600 transition-colors"
                  : "cursor-default"
              }`}
              title={isEditable ? "Click to edit activity name" : ""}
            >
              {currentActivity?.name || "Unnamed Activity"}
            </h1>
          )}

          <p
            className={`text-lg sm:text-xl font-medium transition-colors duration-300 ${
              timerState === "running"
                ? "text-green-600"
                : timerState === "paused"
                ? "text-orange-600"
                : timerState === "completed"
                ? "text-purple-600"
                : "text-gray-500"
            }`}
          >
            {stateText[timerState]}
          </p>
        </div>

        {/* Timer Circle */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="relative">
            {/* Background Circle */}
            <svg
              className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 transform -rotate-90"
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={getStrokeColor(timerState)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Timer Display */}
            <div className="absolute inset-0 flex items-center justify-center">
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
                      className="w-16 sm:w-20 text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-gray-900 bg-transparent border-none outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={handleMinutesClick}
                      className={`text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-gray-900 ${
                        isEditable
                          ? "cursor-pointer hover:text-blue-600 transition-colors"
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
                    } text-gray-600`}
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
                      className="w-16 sm:w-20 text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-gray-900 bg-transparent border-none outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={handleSecondsClick}
                      className={`text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-gray-900 ${
                        isEditable
                          ? "cursor-pointer hover:text-blue-600 transition-colors"
                          : "cursor-default"
                      }`}
                      title={isEditable ? "Click to edit seconds" : ""}
                    >
                      {seconds}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {/* Primary Action Button */}
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="group relative flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 min-w-[140px]"
            >
              <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>{isPaused ? "Resume" : "Start"}</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="group relative flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-300 min-w-[140px]"
            >
              <Pause className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Pause</span>
            </button>
          )}

          {/* Secondary Actions */}
          <div className="flex space-x-4">
            <button
              onClick={resetTimer}
              className="group relative flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-medium border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Timer completion message */}
        {timeRemaining === 0 && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
            <p className="text-green-800 font-bold text-xl">
              🎉 Session Complete!
            </p>
            {currentActivity?.name && (
              <p className="text-green-700 text-base mt-1">
                Great work on "{currentActivity.name}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
