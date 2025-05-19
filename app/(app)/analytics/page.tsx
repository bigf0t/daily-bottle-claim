"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBottleCap } from "@/lib/context/bottlecap-context"
import { CalendarDays, Award, TrendingUp, Clock } from "lucide-react"

// Add these imports
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function AnalyticsPage() {
  const { claims, currentStreak } = useBottleCap()

  // Sort claims by date (newest first)
  const sortedClaims = [...claims].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Calculate stats
  const totalClaims = claims.length
  const claimsToday = sortedClaims.filter((claim) => {
    const claimDate = new Date(claim.timestamp)
    const today = new Date()
    return (
      claimDate.getDate() === today.getDate() &&
      claimDate.getMonth() === today.getMonth() &&
      claimDate.getFullYear() === today.getFullYear()
    )
  }).length

  // Calculate claim times distribution
  const claimHours = claims.map((claim) => new Date(claim.timestamp).getHours())
  const morningClaims = claimHours.filter((hour) => hour >= 6 && hour < 12).length
  const afternoonClaims = claimHours.filter((hour) => hour >= 12 && hour < 18).length
  const eveningClaims = claimHours.filter((hour) => hour >= 18 && hour < 22).length
  const nightClaims = claimHours.filter((hour) => hour >= 22 || hour < 6).length

  // Add this function to generate weekly data
  // Add this after the existing stats calculations
  // Generate weekly claim data
  const getWeeklyData = () => {
    const now = new Date()
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Initialize data for the past 7 days
    const weeklyData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      weeklyData.push({
        date: dateString,
        claims: 0,
        day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
      })
    }

    // Count claims for each day
    claims.forEach((claim) => {
      const claimDate = new Date(claim.timestamp)
      if (claimDate >= oneWeekAgo) {
        const dateString = claimDate.toISOString().split("T")[0]
        const dayIndex = weeklyData.findIndex((d) => d.date === dateString)
        if (dayIndex !== -1) {
          weeklyData[dayIndex].claims++
        }
      }
    })

    return weeklyData
  }

  const weeklyData = getWeeklyData()

  // Generate time distribution data
  const timeDistributionData = [
    { time: "Morning", claims: morningClaims },
    { time: "Afternoon", claims: afternoonClaims },
    { time: "Evening", claims: eveningClaims },
    { time: "Night", claims: nightClaims },
  ]

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Your Analytics</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Claim History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Claims Today</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{claimsToday}</div>
                <p className="text-xs text-muted-foreground">out of 1 possible claim</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentStreak} day{currentStreak !== 1 ? "s" : ""}
                </div>
                <p className="text-xs text-muted-foreground">consecutive claims</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClaims}</div>
                <p className="text-xs text-muted-foreground">all-time claims</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Claim Frequency</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalClaims > 0 ? (totalClaims / (currentStreak || 1)).toFixed(1) : "0"}
                </div>
                <p className="text-xs text-muted-foreground">claims per day</p>
              </CardContent>
            </Card>
          </div>

          {/* Add these charts to the overview tab */}
          {/* Replace the existing Card for Claim Time Distribution with this: */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Time Distribution</CardTitle>
              <CardDescription>When you typically claim your bottle caps</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  claims: {
                    label: "Claims",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="claims" fill="var(--color-claims)" name="Claims" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Claim Activity</CardTitle>
              <CardDescription>Your claims over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  claims: {
                    label: "Claims",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="claims" stroke="var(--color-claims)" name="Claims" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Claim History</CardTitle>
              <CardDescription>Your recent bottle cap claims</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedClaims.length > 0 ? (
                <div className="space-y-4">
                  {sortedClaims.slice(0, 10).map((claim) => (
                    <div key={claim.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">
                          {claim.amount} BottleCap{claim.amount !== 1 ? "s" : ""}
                          {claim.bonusAmount ? ` + ${claim.bonusAmount} bonus` : ""}
                        </p>
                        {claim.bonusReason && <p className="text-xs text-green-500">{claim.bonusReason}</p>}
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(claim.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No claims yet.</p>
                  <p className="text-sm">Make your first claim on the dashboard!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
