"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Check, Share2 } from "lucide-react"
import { SocialShare } from "@/components/social-share"
import { ReferralLeaderboard } from "@/components/referral-leaderboard"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress || "")
  const [isCopied, setIsCopied] = useState(false)

  const handleSave = () => {
    // In a real app, this would call an API to update the user profile
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
    setIsEditing(false)
  }

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast({
        title: "Referral code copied",
        description: "Your referral code has been copied to clipboard.",
      })
    }
  }

  const shareProfile = () => {
    // In a real app, this would open a share dialog
    toast({
      title: "Share feature",
      description: "This would open a share dialog in a real app.",
    })
  }

  return (
    <div className="container py-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View and update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-muted-foreground">You can change your username once every 30 days.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Add your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet">Ethereum Wallet Address</Label>
                <Input
                  id="wallet"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Add your Ethereum wallet address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joined">Member Since</Label>
                <Input
                  id="joined"
                  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                  disabled
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>Share your referral code with friends and earn bonus rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="referralCode">Your Referral Code</Label>
                <div className="flex">
                  <Input
                    id="referralCode"
                    value={user?.referralCode || ""}
                    readOnly
                    className="rounded-r-none font-mono"
                  />
                  <Button variant="secondary" className="rounded-l-none" onClick={copyReferralCode}>
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Referral Benefits</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You get 0.5 BottleCaps for each friend who signs up</li>
                  <li>Your friend gets 1 BottleCap as a welcome bonus</li>
                  <li>Earn additional bonuses when your referrals reach milestones</li>
                </ul>
              </div>

              <Button onClick={shareProfile} className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share Your Profile
              </Button>
            </CardContent>
          </Card>

          <ReferralLeaderboard />

          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
              <CardDescription>Track the status of your referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven&apos;t referred anyone yet.</p>
                <p className="text-sm">Share your referral code to start earning bonuses!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Progress</CardTitle>
              <CardDescription>Share your BottleCaps achievements with friends and social media</CardDescription>
            </CardHeader>
            <CardContent>
              <SocialShare />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
