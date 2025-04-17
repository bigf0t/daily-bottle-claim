
import { cn } from "@/lib/utils";

interface BottleCapProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "gold" | "silver";
  className?: string;
  animated?: boolean;
}

export function BottleCap({
  size = "md",
  color = "blue",
  className,
  animated = false,
}: BottleCapProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const colorClasses = {
    blue: "bg-bottlecap-blue border-bottlecap-navy text-white",
    gold: "bg-bottlecap-gold border-amber-800 text-white",
    silver: "bg-bottlecap-silver border-gray-500 text-gray-800",
  };

  return (
    <div
      className={cn(
        "relative rounded-full border-4 flex items-center justify-center shadow-md",
        sizeClasses[size],
        colorClasses[color],
        animated && "animate-bounce-light",
        className
      )}
    >
      {/* Inner ridges of the bottle cap */}
      <div className="absolute inset-0 rounded-full border-dashed border-4 border-opacity-20 border-white"></div>
      
      {/* Center circle */}
      <div className="w-3/5 h-3/5 rounded-full bg-opacity-20 bg-white flex items-center justify-center">
        <span className="text-center font-bold">
          {size === "sm" ? "$" : size === "md" ? "$B" : "$BOTTLE"}
        </span>
      </div>
    </div>
  );
}
