import { cn } from '../lib/utils';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  state?: 'idle' | 'running' | 'paused' | 'completed';
  isBreakMode?: boolean;
}

export function CircularProgress({ 
  progress, 
  size = 200, 
  strokeWidth = 8, 
  className,
  children,
  state = 'idle',
  isBreakMode = false
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Determine progress color based on state and mode
  const getProgressColorClass = () => {
    switch (state) {
      case 'running':
        return isBreakMode ? 'text-warning' : 'text-primary';
      case 'paused':
        return 'text-warning';
      case 'completed':
        return isBreakMode ? 'text-warning' : 'text-muted-foreground';
      default:
        return 'text-border';
    }
  };

  return (
    <div className={cn("relative inline-flex", className)} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className={cn('transition-all duration-1000 ease-out', getProgressColorClass())}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}