import { cn } from "@/lib/utils"

type BottleCapProps = {
  size?: "sm" | "md" | "lg" | "xl"
  color?: "blue" | "silver" | "gold"
  animate?: boolean
  className?: string
}

export function BottleCap({ size = "md", color = "blue", animate = false, className }: BottleCapProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  }

  const colorClasses = {
    blue: "bg-bottlecap-blue text-white",
    silver: "bg-bottlecap-silver text-gray-800",
    gold: "bg-bottlecap-gold text-gray-800",
  }

  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center shadow-lg",
        sizeClasses[size],
        colorClasses[color],
        animate && "animate-bottle-cap-bounce",
        className,
      )}
    >
      {/* Outer ridges */}
      <div className="absolute inset-0 rounded-full border-4 border-opacity-20 border-black"></div>

      {/* Inner circle */}
      <div
        className={cn(
          "absolute rounded-full bg-opacity-10 bg-white flex items-center justify-center",
          size === "sm" ? "w-4 h-4" : "",
          size === "md" ? "w-8 h-8" : "",
          size === "lg" ? "w-12 h-12" : "",
          size === "xl" ? "w-16 h-16" : "",
        )}
      >
        {/* Currency symbol */}
        <span
          className={cn(
            "font-bold",
            size === "sm" ? "text-xs" : "",
            size === "md" ? "text-base" : "",
            size === "lg" ? "text-xl" : "",
            size === "xl" ? "text-2xl" : "",
          )}
        >
          BC
        </span>
      </div>
    </div>
  )
}
