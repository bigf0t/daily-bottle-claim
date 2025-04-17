
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  className?: string;
}

export function CountdownTimer({
  seconds,
  onComplete,
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Determine if we're in the danger zone (less than 10 seconds remaining)
  const isDanger = timeLeft < 10;
  
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsCompleted(true);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  // Format seconds as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div 
        className={cn(
          "text-6xl font-bold tabular-nums", 
          isDanger ? "text-bottlecap-red animate-urgent-pulse" : "text-white"
        )}
      >
        {formatTime(timeLeft)}
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            isDanger ? "bg-bottlecap-red" : "bg-bottlecap-blue"
          )}
          style={{ width: `${(timeLeft / seconds) * 100}%` }}
        />
      </div>
      
      <p className={cn(
        "text-sm font-medium transition-colors",
        isDanger ? "text-bottlecap-red" : "text-white"
      )}>
        {isDanger 
          ? "Almost there..." 
          : "Please wait while we prepare your reward"}
      </p>
    </div>
  );
}
