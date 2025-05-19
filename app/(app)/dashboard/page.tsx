"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottleCap } from "@/components/bottle-cap"
import { CountdownTimer } from "@/components/countdown-timer"
import { useBottleCap } from "@/lib/context/bottlecap-context"
import { useAuth } from "@/lib/context/auth-context"
import { CalendarDays, Award, TrendingUp } from "lucide-react"

// Add these imports
import { StreakCalendar } from "@/components/streak-calendar"
import { NotificationSettings } from "@/components/notification-settings"
import { Shield, Gift } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user } = useAuth()
  const {
    balance,
    currentStreak,
    nextClaimTime,
    canClaim,
    claim,
    claims,
    streakProtectionAvailable,
    useStreakProtection,
    activePromotions,
  } = useBottleCap()

  const router = useRouter()

  // At the beginning of the component, after getting user and bottlecap context
  const isAdmin = user?.isAdmin || false

  const handleClaim = async () => {
    if (canClaim) {
      await claim()
    }
  }

  // Calculate stats
  const totalClaims = claims.length
  const joinedDate = user ? new Date(user.createdAt) : new Date()
  const daysSinceJoined = Math.floor((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24))
  const avgClaimsPerDay = daysSinceJoined > 0 ? (totalClaims / daysSinceJoined).toFixed(1) : totalClaims

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main claim card - hidden for admins */}
        {!isAdmin ? (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Bottle Cap Claim</CardTitle>
              <CardDescription>Claim your bottle cap every 6 hours</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 py-6">
              <div className="relative">
                <BottleCap size="xl" color={canClaim ? "blue" : "silver"} animate={canClaim} />
              </div>

              {canClaim ? (
                <div className="space-y-4 text-center">
                  <h3 className="text-xl font-bold">Your claim is ready!</h3>
                  <Button size="lg" onClick={handleClaim}>
                    Claim Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <h3 className="text-xl font-bold">Next claim available in:</h3>
                  {nextClaimTime && (
                    <CountdownTimer targetDate={nextClaimTime} onComplete={() => window.location.reload()} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Admin Account</CardTitle>
              <CardDescription>This account is for site management only</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 py-6">
              <div className="text-center space-y-4">
                <p>Admin accounts cannot claim bottle caps.</p>
                <p>Use the navigation to access admin features.</p>
                <Button variant="outline" onClick={() => router.push("/admin")}>
                  Go to Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats cards */}
        <div className="flex flex-col gap-6 md:w-80">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BottleCap size="sm" />
                <span className="text-2xl font-bold">{balance}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold">
                  {currentStreak} day{currentStreak !== 1 ? "s" : ""}
                </span>
              </div>
              {currentStreak >= 7 && (
                <p className="text-xs text-green-500">
                  {currentStreak >= 100 ? "100+ day streak: Double rewards!" : "7+ day streak: +50% bonus rewards!"}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClaims}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Claims</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgClaimsPerDay}</div>
            <p className="text-xs text-muted-foreground">claims per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysSinceJoined}</div>
            <p className="text-xs text-muted-foreground">days ago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Code</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{user?.referralCode}</div>
            <p className="text-xs text-muted-foreground">Share with friends</p>
          </CardContent>
        </Card>
      </div>

      {/* Add this section after the main claim card and stats cards section */}
      {/* Add this right before the closing </div> of the container */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Streak</h2>
        <Card>
          <CardHeader>
            <CardTitle>Streak Calendar</CardTitle>
            <CardDescription>Track your daily claims</CardDescription>
          </CardHeader>
          <CardContent>
            <StreakCalendar />

            {streakProtectionAvailable && (
              <div className="mt-6 p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium">Streak Protection Available</h4>
                    <p className="text-sm text-muted-foreground">
                      You have 1 streak protection available. Use it to prevent losing your streak if you miss a day.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={useStreakProtection}>
                      Use Streak Protection
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Get notified when your claim is ready</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Active Promotions</CardTitle>
                <CardDescription>Special bonuses and events</CardDescription>
              </div>
              <Gift className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {activePromotions.length > 0 ? (
                <div className="space-y-4">
                  {activePromotions.map((promo) => {
                    const startDate = new Date(promo.startDate)
                    const endDate = new Date(promo.endDate)
                    const now = new Date()
                    const isActive = startDate <= now && endDate >= now
                    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                    return (
                      <div
                        key={promo.id}
                        className={cn(
                          "p-4 border rounded-lg",
                          isActive ? "bg-green-500/10 border-green-500/20" : "bg-muted/50 border-muted",
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{promo.name}</h4>
                            <p className="text-sm text-muted-foreground">{promo.description}</p>
                            {isActive && (
                              <p className="text-sm text-green-500 mt-1">
                                {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-green-500">
                              +{((promo.multiplier - 1) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active promotions</p>
                  <p className="text-sm">Check back later for special events!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
