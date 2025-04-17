
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend && trendValue && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend === "up" && "text-green-500",
                    trend === "down" && "text-red-500",
                    trend === "neutral" && "text-gray-500"
                  )}
                >
                  {trend === "up" && "↑"}
                  {trend === "down" && "↓"}
                  {trendValue}
                </span>
              )}
            </div>
          </div>
          <div
            className={cn(
              "rounded-full p-2",
              "bg-bottlecap-blue bg-opacity-10 text-bottlecap-blue"
            )}
          >
            {icon}
          </div>
        </div>
      </div>
      <div className="bg-muted px-6 py-3">
        <div className="text-xs text-muted-foreground">
          Updated in real-time
        </div>
      </div>
    </Card>
  );
}
