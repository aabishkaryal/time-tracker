import { useEffect } from 'react';
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

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(tick, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, tick]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Timer</h1>
      
      <div className="text-center">
        <div className="text-6xl font-mono mb-8">
          {formatTime(timeRemaining)}
        </div>
        
        <div className="space-x-4">
          {!isRunning ? (
            <button 
              onClick={startTimer}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
            >
              {isPaused ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button 
              onClick={pauseTimer}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg"
            >
              Pause
            </button>
          )}
          
          <button 
            onClick={resetTimer}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}