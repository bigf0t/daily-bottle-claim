"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { ArrowLeft, Shield, Ban, Award, RotateCcw, Edit, Trash } from "lucide-react"

// Mock user data - in a real app, this would come from an API
const mockUser = {
  id: "user-1",
  username: "testuser",
  email: "test@example.com",
  walletAddress: "0x1234567890abcdef",
  isAdmin: false,
  referralCode: "TESTUSER123",
  createdAt: "2023-01-01T00:00:00.000Z",
  balance: 42,
  currentStreak: 7,
  totalClaims: 56,
  lastClaimTimestamp: "2023-06-01T12:34:56.000Z",
  referrals: 3,
  isBanned: false,
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [userData, setUserData] = useState(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(mockUser)

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user?.isAdmin) {
    return null
  }

  const handleSave = () => {
    setUserData(editedUser)
    setIsEditing(false)
    toast({
      title: "User updated",
      description: "User information has been updated successfully.",
    })
  }

  const handleBanUser = () => {
    setUserData({ ...userData, isBanned: !userData.isBanned })
    toast({
      title: userData.isBanned ? "User unbanned" : "User banned",
      description: userData.isBanned
        ? "User has been unbanned and can now access the platform."
        : "User has been banned from the platform.",
    })
  }

  const handleResetStreak = () => {
    setUserData({ ...userData, currentStreak: 0 })
    toast({
      title: "Streak reset",
      description: "User's streak has been reset to 0.",
    })
  }

  const handleGrantAdmin = () => {
    setUserData({ ...userData, isAdmin: !userData.isAdmin })
    toast({
      title: userData.isAdmin ? "Admin privileges revoked" : "Admin privileges granted",
      description: userData.isAdmin
        ? "User no longer has admin privileges."
        : "User has been granted admin privileges.",
    })
  }

  const handleGrantBonus = () => {
    setUserData({ ...userData, balance: userData.balance + 10 })
    toast({
      title: "Bonus granted",
      description: "10 BottleCaps have been added to the user's balance.",
    })
  }

  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.push("/admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">User Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="claims">Claims</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>View and edit user details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={isEditing ? editedUser.username : userData.username}
                      onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={isEditing ? editedUser.email : userData.email}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Ethereum Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      value={isEditing ? editedUser.walletAddress : userData.walletAddress}
                      onChange={(e) => setEditedUser({ ...editedUser, walletAddress: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralCode">Referral Code</Label>
                    <Input
                      id="referralCode"
                      value={isEditing ? editedUser.referralCode : userData.referralCode}
                      onChange={(e) => setEditedUser({ ...editedUser, referralCode: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="createdAt">Registration Date</Label>
                    <Input id="createdAt" value={new Date(userData.createdAt).toLocaleString()} disabled />
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
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="claims" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Claim Statistics</CardTitle>
                  <CardDescription>User's claim history and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Balance</Label>
                      <div className="p-3 bg-muted/50 rounded-md font-bold text-xl">{userData.balance}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Current Streak</Label>
                      <div className="p-3 bg-muted/50 rounded-md font-bold text-xl">{userData.currentStreak} days</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Claims</Label>
                      <div className="p-3 bg-muted/50 rounded-md font-bold text-xl">{userData.totalClaims}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Last Claim</Label>
                      <div className="p-3 bg-muted/50 rounded-md text-sm">
                        {new Date(userData.lastClaimTimestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label>Claim History</Label>
                    <div className="border rounded-md p-4 text-center text-muted-foreground">
                      <p>Detailed claim history would be displayed here.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Referral Information</CardTitle>
                  <CardDescription>User's referral performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Total Referrals</Label>
                    <div className="p-3 bg-muted/50 rounded-md font-bold text-xl">{userData.referrals}</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Referred Users</Label>
                    <div className="border rounded-md p-4 text-center text-muted-foreground">
                      <p>No referred users found.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Status</CardTitle>
              <CardDescription>Current account status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-md ${
                    userData.isBanned ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                  }`}
                >
                  <p className="font-medium">{userData.isBanned ? "Banned" : "Active"}</p>
                  <p className="text-sm">
                    {userData.isBanned
                      ? "This user is banned and cannot access the platform."
                      : "This user has normal access to the platform."}
                  </p>
                </div>

                <div className="p-3 rounded-md bg-muted/50">
                  <p className="font-medium">Role</p>
                  <p className="text-sm">{userData.isAdmin ? "Administrator" : "Regular User"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Administrative Actions</CardTitle>
              <CardDescription>Manage this user's account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant={userData.isBanned ? "outline" : "destructive"}
                className="w-full justify-start"
                onClick={handleBanUser}
              >
                <Ban className="mr-2 h-4 w-4" />
                {userData.isBanned ? "Unban User" : "Ban User"}
              </Button>

              <Button variant="outline" className="w-full justify-start" onClick={handleResetStreak}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Streak
              </Button>

              <Button variant="outline" className="w-full justify-start" onClick={handleGrantAdmin}>
                <Shield className="mr-2 h-4 w-4" />
                {userData.isAdmin ? "Revoke Admin" : "Grant Admin"}
              </Button>

              <Button variant="outline" className="w-full justify-start" onClick={handleGrantBonus}>
                <Award className="mr-2 h-4 w-4" />
                Grant Bonus (+10)
              </Button>

              <Button variant="destructive" className="w-full justify-start">
                <Trash className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
