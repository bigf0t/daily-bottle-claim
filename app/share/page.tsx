"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottleCap } from "@/components/bottle-cap"
import { Award, TrendingUp } from "lucide-react"

export default function SharePage() {
  const searchParams = useSearchParams()
  const [userData, setUserData] = useState({
    username: "",
    balance: 0,
    streak: 0,
    claims: 0,
  })

  useEffect(() => {
    const username = searchParams.get("u") || ""
    const balance = Number.parseInt(searchParams.get("b") || "0", 10)
    const streak = Number.parseInt(searchParams.get("s") || "0", 10)
    const claims = Number.parseInt(searchParams.get("c") || "0", 10)

    setUserData({
      username,
      balance,
      streak,
      claims,
    })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-radial from-background to-muted/50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <BottleCap size="lg" animate />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">BottleCaps Achievement</CardTitle>
            <CardDescription className="text-center">
              Check out {userData.username}&apos;s BottleCaps collection!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <BottleCap size="xl" color={userData.streak >= 100 ? "gold" : userData.streak >= 7 ? "silver" : "blue"} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                <BottleCap size="sm" />
                <span className="mt-1 text-xl font-bold">{userData.balance}</span>
                <span className="text-xs text-muted-foreground">Balance</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="mt-1 text-xl font-bold">{userData.streak}</span>
                <span className="text-xs text-muted-foreground">Day Streak</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="mt-1 text-xl font-bold">{userData.claims}</span>
                <span className="text-xs text-muted-foreground">Total Claims</span>
              </div>
            </div>

            {userData.streak >= 7 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                <p className="text-sm">
                  {userData.username} has a {userData.streak}-day streak!
                  {userData.streak >= 100 ? " That's legendary!" : " Impressive!"}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="mb-4 text-center text-sm">
              Join BottleCaps and start collecting your own digital bottle caps!
            </p>
            <Link href="/register" className="w-full">
              <Button className="w-full">Create Your Account</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
