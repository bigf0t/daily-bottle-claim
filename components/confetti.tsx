"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type ConfettiProps = {
  active: boolean
  count?: number
  className?: string
}

export function Confetti({ active, count = 50, className }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; color: string; size: number; left: number; delay: number }>>(
    [],
  )

  useEffect(() => {
    if (active) {
      const colors = ["#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff"]
      const newPieces = Array.from({ length: count }).map((_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        left: Math.random() * 100,
        delay: Math.random() * 3,
      }))
      setPieces(newPieces)
    } else {
      setPieces([])
    }
  }, [active, count])

  if (!active) return null

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
