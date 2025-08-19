import { useEffect } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useTimerStore } from '../store';

export default function Timer() {
  const { 
    timeRemaining, 
    isRunning, 
    isPaused, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    tick 
  } = useTimerStore();

  const formatTime = (milliseconds: number): { minutes: string; seconds: string } => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };
  };

  const getProgress = (): number => {
    const totalTime = 25 * 60 * 1000; // 25 minutes in milliseconds
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const getTimerState = () => {
    if (timeRemaining === 0) return 'completed';
    if (isRunning) return 'running';
    if (isPaused) return 'paused';
    return 'idle';
  };

  const getStrokeColor = (state: string) => {
    switch (state) {
      case 'running': return '#10b981'; // green-500
      case 'paused': return '#f59e0b'; // yellow-500
      case 'completed': return '#8b5cf6'; // purple-500
      default: return '#9ca3af'; // gray-400
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(tick, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const { minutes, seconds } = formatTime(timeRemaining);
  const progress = getProgress();
  const timerState = getTimerState();

  const stateText = {
    idle: 'Ready to start',
    running: 'Timer running',
    paused: 'Timer paused',
    completed: 'Session completed!'
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Focus Session
          </h1>
          <p className={`text-lg sm:text-xl font-medium transition-colors duration-300 ${
            timerState === 'running' ? 'text-green-600' :
            timerState === 'paused' ? 'text-orange-600' :
            timerState === 'completed' ? 'text-purple-600' :
            'text-gray-500'
          }`}>
            {stateText[timerState]}
          </p>
        </div>

        {/* Timer Circle */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="relative">
            {/* Background Circle */}
            <svg className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 transform -rotate-90" viewBox="0 0 200 200">
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
                  <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-gray-900">
                    {minutes}
                  </span>
                  <span className={`text-3xl sm:text-4xl md:text-5xl font-mono font-bold transition-opacity duration-500 ${
                    isRunning ? 'opacity-50' : 'opacity-100'
                  } text-gray-600`}>
                    :
                  </span>
                  <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-gray-900">
                    {seconds}
                  </span>
                </div>
                <div className="text-sm sm:text-base text-gray-500 font-medium">
                  {Math.round(progress)}% complete
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
              <span>{isPaused ? 'Resume' : 'Start'}</span>
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
            
            {timeRemaining > 0 && (
              <button 
                onClick={() => {
                  pauseTimer();
                  resetTimer();
                }}
                className="group relative flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-medium border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
                title="Stop Timer"
              >
                <Square className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Timer completion message */}
        {timeRemaining === 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-xl text-center animate-pulse">
            <h3 className="text-xl font-bold text-purple-800 mb-2">🎉 Session Complete!</h3>
            <p className="text-purple-600">Great job! Take a break before starting your next session.</p>
          </div>
        )}
      </div>
    </div>
  );
}