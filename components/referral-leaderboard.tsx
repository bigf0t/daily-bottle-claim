"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/context/auth-context"

// Sample leaderboard data - in a real app, this would come from the backend
const sampleLeaderboard = [
  { id: "1", username: "bottlecap_king", referrals: 42, avatarUrl: "" },
  { id: "2", username: "cap_collector", referrals: 38, avatarUrl: "" },
  { id: "3", username: "streak_master", referrals: 27, avatarUrl: "" },
  { id: "4", username: "daily_claimer", referrals: 21, avatarUrl: "" },
  { id: "5", username: "bottle_baron", referrals: 19, avatarUrl: "" },
]

export function ReferralLeaderboard() {
  const { user } = useAuth()

  // Find user's position in leaderboard (if any)
  const userPosition = sampleLeaderboard.findIndex((entry) => entry.username === user?.username)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Referrers</CardTitle>
        <CardDescription>Users with the most successful referrals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sampleLeaderboard.map((entry, index) => {
            const isCurrentUser = entry.username === user?.username
            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2 rounded-md ${
                  isCurrentUser ? "bg-primary/10" : index % 2 === 0 ? "bg-muted/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full ${
                      index === 0
                        ? "bg-yellow-500 text-yellow-950"
                        : index === 1
                          ? "bg-gray-300 text-gray-800"
                          : index === 2
                            ? "bg-amber-700 text-amber-100"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.avatarUrl || "/placeholder.svg"} alt={entry.username} />
                    <AvatarFallback>
                      {entry.username
                        .split("_")
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`font-medium ${isCurrentUser ? "text-primary" : ""}`}>{entry.username}</span>
                  {isCurrentUser && <span className="text-xs text-primary ml-2">(You)</span>}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold">{entry.referrals}</span>
                  <span className="text-sm text-muted-foreground">referrals</span>
                </div>
              </div>
            )
          })}

          {userPosition === -1 && (
            <div className="mt-4 p-3 border rounded-md bg-muted/30">
              <p className="text-center text-sm">
                You haven&apos;t made it to the leaderboard yet. Share your referral code to climb the ranks!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
