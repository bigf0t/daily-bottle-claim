"use client"

import { useBottleCap } from "@/lib/context/bottlecap-context"
import { cn } from "@/lib/utils"

export function StreakCalendar() {
  const { streakCalendar } = useBottleCap()

  // Group days by week for display
  const weeks: Array<typeof streakCalendar> = []
  for (let i = 0; i < streakCalendar.length; i += 7) {
    weeks.push(streakCalendar.slice(i, i + 7))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Streak Calendar</h3>
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const date = new Date(day.date)
              const isToday = new Date().toISOString().split("T")[0] === day.date

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-md text-xs",
                    day.claimed ? "bg-green-500/20 text-green-500" : "bg-muted/50 text-muted-foreground",
                    day.bonusApplied && "ring-2 ring-yellow-500",
                    isToday && "ring-2 ring-primary",
                  )}
                  title={`${date.toLocaleDateString()}: ${
                    day.claimed ? "Claimed" : "Not claimed"
                  }${day.bonusApplied ? " (Bonus applied)" : ""}`}
                >
                  {date.getDate()}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
