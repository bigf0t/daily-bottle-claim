"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { useToast } from "@/components/ui/use-toast"

type Claim = {
  id: string
  userId: string
  amount: number
  timestamp: string
  bonusAmount?: number
  bonusReason?: string
}

// Add these new types at the top of the file
type Promotion = {
  id: string
  name: string
  multiplier: number
  startDate: string
  endDate: string
  description: string
}

type StreakCalendarDay = {
  date: string
  claimed: boolean
  bonusApplied?: boolean
}

type BottleCapContextType = {
  balance: number
  claims: Claim[]
  currentStreak: number
  nextClaimTime: Date | null
  canClaim: boolean
  claim: () => Promise<boolean>
  isClaimModalOpen: boolean
  closeClaimModal: () => void
  claimCooldownMs: number
  // Add these new properties to the BottleCapContextType
  streakCalendar: StreakCalendarDay[]
  activePromotions: Promotion[]
  isPromotionActive: boolean
  currentPromotionMultiplier: number
  streakProtectionAvailable: boolean
  useStreakProtection: () => Promise<boolean>
}

const BottleCapContext = createContext<BottleCapContextType | undefined>(undefined)

// Default cooldown is 6 hours
const DEFAULT_COOLDOWN_MS = 6 * 60 * 60 * 1000

export function BottleCapProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [balance, setBalance] = useState(0)
  const [claims, setClaims] = useState<Claim[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [nextClaimTime, setNextClaimTime] = useState<Date | null>(null)
  const [canClaim, setCanClaim] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [claimCooldownMs] = useState(DEFAULT_COOLDOWN_MS)
  // Add these new state variables inside the BottleCapProvider
  const [streakCalendar, setStreakCalendar] = useState<StreakCalendarDay[]>([])
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([])
  const [streakProtectionAvailable, setStreakProtectionAvailable] = useState(false)

  // Load user data from localStorage
  useEffect(() => {
    if (!user) return

    const storedClaims = localStorage.getItem(`bottlecaps-claims-${user.id}`)
    const storedBalance = localStorage.getItem(`bottlecaps-balance-${user.id}`)
    const storedStreak = localStorage.getItem(`bottlecaps-streak-${user.id}`)

    if (storedClaims) {
      setClaims(JSON.parse(storedClaims))
    }

    if (storedBalance) {
      setBalance(Number.parseInt(storedBalance))
    }

    if (storedStreak) {
      setCurrentStreak(Number.parseInt(storedStreak))
    }
  }, [user])

  // Calculate next claim time and whether user can claim
  useEffect(() => {
    if (!user || claims.length === 0) {
      setCanClaim(true)
      setNextClaimTime(null)
      return
    }

    // Sort claims by timestamp (newest first)
    const sortedClaims = [...claims].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const lastClaimTime = new Date(sortedClaims[0].timestamp).getTime()
    const now = Date.now()
    const nextTime = new Date(lastClaimTime + claimCooldownMs)

    setNextClaimTime(nextTime)
    setCanClaim(now >= nextTime.getTime())

    // Set up interval to check claim status every second
    const interval = setInterval(() => {
      const currentTime = Date.now()
      if (currentTime >= nextTime.getTime()) {
        setCanClaim(true)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [user, claims, claimCooldownMs])

  // Calculate streak
  useEffect(() => {
    if (!user || claims.length === 0) return

    // Sort claims by timestamp (oldest first)
    const sortedClaims = [...claims].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    let streak = 1
    let maxStreak = 1

    for (let i = 1; i < sortedClaims.length; i++) {
      const prevDate = new Date(sortedClaims[i - 1].timestamp)
      const currDate = new Date(sortedClaims[i].timestamp)

      // Check if claims are within 24 hours but on different calendar days
      const prevDay = new Date(prevDate).setHours(0, 0, 0, 0)
      const currDay = new Date(currDate).setHours(0, 0, 0, 0)
      const dayDiff = (currDay - prevDay) / (24 * 60 * 60 * 1000)

      if (dayDiff === 1) {
        streak++
        maxStreak = Math.max(maxStreak, streak)
      } else if (dayDiff > 1) {
        streak = 1
      }
    }

    setCurrentStreak(maxStreak)
    localStorage.setItem(`bottlecaps-streak-${user.id}`, maxStreak.toString())
  }, [user, claims])

  // Add this computed property inside the BottleCapProvider
  const isPromotionActive = activePromotions.some(
    (promo) => new Date(promo.startDate) <= new Date() && new Date(promo.endDate) >= new Date(),
  )

  const currentPromotionMultiplier = isPromotionActive
    ? activePromotions
        .filter((promo) => new Date(promo.startDate) <= new Date() && new Date(promo.endDate) >= new Date())
        .reduce((max, promo) => Math.max(max, promo.multiplier), 1)
    : 1

  // Add this function inside the BottleCapProvider
  const useStreakProtection = async () => {
    if (!user || !streakProtectionAvailable) return false

    try {
      setStreakProtectionAvailable(false)
      localStorage.setItem(`bottlecaps-streak-protection-${user.id}`, "false")

      // In a real app, this would call an API to use streak protection
      toast({
        title: "Streak Protection Used",
        description: "Your streak has been protected for today.",
      })

      return true
    } catch (error) {
      console.error("Streak protection error:", error)
      return false
    }
  }

  // Add this effect to calculate streak calendar
  useEffect(() => {
    if (!user || claims.length === 0) return

    const calendar: StreakCalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const dateString = date.toISOString().split("T")[0]
      const claimsOnDate = claims.filter((claim) => {
        const claimDate = new Date(claim.timestamp)
        return claimDate.toISOString().split("T")[0] === dateString
      })

      calendar.push({
        date: dateString,
        claimed: claimsOnDate.length > 0,
        bonusApplied: claimsOnDate.some((claim) => claim.bonusAmount !== undefined),
      })
    }

    setStreakCalendar(calendar)
  }, [user, claims])

  // Add this effect to load streak protection status
  useEffect(() => {
    if (!user) return

    const storedProtection = localStorage.getItem(`bottlecaps-streak-protection-${user.id}`)
    setStreakProtectionAvailable(storedProtection === "true")

    // For demo purposes, give users streak protection if they don't have it
    if (storedProtection === null) {
      setStreakProtectionAvailable(true)
      localStorage.setItem(`bottlecaps-streak-protection-${user.id}`, "true")
    }
  }, [user])

  // Add this effect to load active promotions
  useEffect(() => {
    // For demo purposes, create a sample promotion
    const samplePromotion: Promotion = {
      id: "promo-1",
      name: "Welcome Bonus",
      multiplier: 1.5,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      description: "50% bonus on all claims for new users!",
    }

    setActivePromotions([samplePromotion])
    localStorage.setItem("bottlecaps-promotions", JSON.stringify([samplePromotion]))
  }, [])

  // Modify the beginning of the claim function to check for admin status
  const claim = async () => {
    if (!user || !canClaim) return false

    // Prevent admins from claiming
    if (user.isAdmin) {
      toast({
        title: "Admin accounts cannot claim",
        description: "Admin accounts are for site management only and cannot claim bottle caps.",
        variant: "destructive",
      })
      return false
    }

    try {
      // Calculate bonus based on streak
      let bonusAmount = 0
      let bonusReason = ""

      if (currentStreak >= 100) {
        bonusAmount = 1 // Double rewards for 100+ day streak
        bonusReason = "100+ day streak"
      } else if (currentStreak >= 7) {
        bonusAmount = 0.5 // 50% bonus for 7+ day streak
        bonusReason = "7+ day streak"
      }

      const baseAmount = 1
      const totalAmount = baseAmount + bonusAmount

      // Create new claim
      const newClaim: Claim = {
        id: `claim-${Date.now()}`,
        userId: user.id,
        amount: baseAmount,
        timestamp: new Date().toISOString(),
        bonusAmount: bonusAmount > 0 ? bonusAmount : undefined,
        bonusReason: bonusAmount > 0 ? bonusReason : undefined,
      }

      // Update claims
      const updatedClaims = [newClaim, ...claims]
      setClaims(updatedClaims)
      localStorage.setItem(`bottlecaps-claims-${user.id}`, JSON.stringify(updatedClaims))

      // Update balance
      const newBalance = balance + totalAmount
      setBalance(newBalance)
      localStorage.setItem(`bottlecaps-balance-${user.id}`, newBalance.toString())

      // Open claim modal
      setIsClaimModalOpen(true)

      return true
    } catch (error) {
      console.error("Claim error:", error)
      toast({
        title: "Claim failed",
        description: "There was an error processing your claim. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const closeClaimModal = () => {
    setIsClaimModalOpen(false)
  }

  // Update the return value to include the new properties
  return (
    <BottleCapContext.Provider
      value={{
        balance,
        claims,
        currentStreak,
        nextClaimTime,
        canClaim,
        claim,
        isClaimModalOpen,
        closeClaimModal,
        claimCooldownMs,
        streakCalendar,
        activePromotions,
        isPromotionActive,
        currentPromotionMultiplier,
        streakProtectionAvailable,
        useStreakProtection,
      }}
    >
      {children}
    </BottleCapContext.Provider>
  )
}

export function useBottleCap() {
  const context = useContext(BottleCapContext)
  if (context === undefined) {
    throw new Error("useBottleCap must be used within a BottleCapProvider")
  }
  return context
}
