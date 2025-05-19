"use client"

import { useEffect, useState } from "react"

type CountdownTimerProps = {
  targetDate: Date
  onComplete?: () => void
  className?: string
}

export function CountdownTimer({ targetDate, onComplete, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        if (onComplete) onComplete()
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  return (
    <div className={className}>
      <div className="flex items-center justify-center space-x-2 font-mono">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, "0")}</span>
          <span className="text-xs text-muted-foreground">hours</span>
        </div>
        <span className="text-2xl">:</span>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, "0")}</span>
          <span className="text-xs text-muted-foreground">mins</span>
        </div>
        <span className="text-2xl">:</span>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, "0")}</span>
          <span className="text-xs text-muted-foreground">secs</span>
        </div>
      </div>
    </div>
  )
}
