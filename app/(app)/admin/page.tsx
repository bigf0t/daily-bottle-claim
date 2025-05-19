"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/context/auth-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, Settings, Clock, Users, Ban, LogOut } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  // Add this near the top of the component, after the router declaration
  const [activeTab, setActiveTab] = useState("overview")

  // Add this effect to handle URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const tab = searchParams.get("tab")
    if (tab && ["overview", "users", "claims", "media", "blacklist", "promotions", "settings"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user?.isAdmin) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="claims">Claim Logs</TabsTrigger>
          <TabsTrigger value="media">Claim Media</TabsTrigger>
          <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">across all users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">running promotions</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start" onClick={() => router.push("/admin?tab=users")}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push("/admin?tab=media")}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Claim Media
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push("/admin?tab=settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Configure Claim Settings
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => router.push("/admin?tab=claims")}>
                <Clock className="mr-2 h-4 w-4" />
                View Claim Logs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input placeholder="Search users..." className="max-w-sm" />
                  <Button variant="secondary">Search</Button>
                </div>

                <div className="border rounded-md">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                    <div>Username</div>
                    <div>Joined</div>
                    <div>Claims</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 p-4 border-b">
                    <div>testuser</div>
                    <div>Jan 1, 2023</div>
                    <div>56</div>
                    <div>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500">Active</span>
                    </div>
                    <div>
                      <Link href="/admin/users/user-1">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 p-4 border-b">
                    <div>admin</div>
                    <div>Jan 1, 2023</div>
                    <div>0</div>
                    <div>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">Admin</span>
                    </div>
                    <div>
                      <Link href="/admin/users/admin-1">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Claim Logs</CardTitle>
              <CardDescription>Monitor claim activity across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input placeholder="Search claims..." className="max-w-sm" />
                  <Button variant="secondary">Search</Button>
                </div>

                <div className="border rounded-md">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                    <div>Username</div>
                    <div>Timestamp</div>
                    <div>Amount</div>
                    <div>Bonus</div>
                    <div>IP Address</div>
                  </div>
                  <div className="p-4 text-center text-muted-foreground">No claim logs found.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Claim Media Management</CardTitle>
              <CardDescription>Upload and manage media shown during claims</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p>Drag and drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, GIF, and MP4 files</p>
                <Button variant="secondary" className="mt-4">
                  Upload Media
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Media Library</h3>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Media</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="gif">GIFs</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-8 border rounded-md text-muted-foreground">No media found</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Media Configuration</h3>

                <div className="space-y-2">
                  <Label htmlFor="activeMedia">Active Media for Regular Claims</Label>
                  <Select defaultValue="default">
                    <SelectTrigger id="activeMedia">
                      <SelectValue placeholder="Select media" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streakMedia">Media for Milestone Streaks</Label>
                  <Select defaultValue="default">
                    <SelectTrigger id="streakMedia">
                      <SelectValue placeholder="Select media" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayDuration">Display Duration (seconds)</Label>
                  <Input id="displayDuration" type="number" min="1" defaultValue="5" />
                  <p className="text-xs text-muted-foreground">
                    For images and GIFs only. Videos play their full length.
                  </p>
                </div>

                <Button>Save Media Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blacklist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blacklist Management</CardTitle>
              <CardDescription>Block suspicious accounts and manage access restrictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input placeholder="Username or IP address" className="max-w-sm" />
                <Select defaultValue="username">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Block type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="ip">IP Address</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive">
                  <Ban className="mr-2 h-4 w-4" />
                  Block
                </Button>
              </div>

              <div className="border rounded-md">
                <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                  <div>Type</div>
                  <div>Value</div>
                  <div>Added By</div>
                  <div>Date Added</div>
                  <div>Actions</div>
                </div>
                <div className="p-4 text-center text-muted-foreground">No blacklisted items found.</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Promotional Campaign Management</CardTitle>
              <CardDescription>Create and manage time-limited promotional events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-lg font-medium">Create New Promotion</h3>

                <div className="space-y-2">
                  <Label htmlFor="promoName">Promotion Name</Label>
                  <Input id="promoName" placeholder="e.g., Weekend Bonus" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promoDescription">Description</Label>
                  <Textarea id="promoDescription" placeholder="Describe the promotion" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Pick a date</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Pick a date</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="multiplier">Bonus Multiplier</Label>
                  <div className="flex items-center gap-2">
                    <Input id="multiplier" type="number" min="1" step="0.1" defaultValue="1.5" />
                    <span className="text-muted-foreground">(1.5 = 50% bonus)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Users</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="allUsers" />
                      <label
                        htmlFor="allUsers"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        All users
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="newUsers" />
                      <label
                        htmlFor="newUsers"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        New users (joined in last 7 days)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="streakUsers" />
                      <label
                        htmlFor="streakUsers"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Users with 7+ day streak
                      </label>
                    </div>
                  </div>
                </div>

                <Button className="w-full">Create Promotion</Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Active Promotions</h3>
                <div className="border rounded-md">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                    <div>Name</div>
                    <div>Multiplier</div>
                    <div>Start Date</div>
                    <div>End Date</div>
                    <div>Actions</div>
                  </div>
                  <div className="p-4 text-center text-muted-foreground">No active promotions found.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Claim Settings</CardTitle>
              <CardDescription>Configure claim parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseAmount">Base Claim Amount</Label>
                <Input id="baseAmount" type="number" defaultValue="1" min="0" step="0.1" />
                <p className="text-xs text-muted-foreground">The base amount of bottle caps users receive per claim</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooldown">Claim Cooldown (hours)</Label>
                <Input id="cooldown" type="number" defaultValue="6" min="1" />
                <p className="text-xs text-muted-foreground">The time users must wait between claims (in hours)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="streakBonus">Streak Bonus Multiplier</Label>
                <Input id="streakBonus" type="number" defaultValue="0.5" min="0" step="0.1" />
                <p className="text-xs text-muted-foreground">Bonus multiplier for users with 7+ day streaks</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralBonus">Referral Bonus Amount</Label>
                <Input id="referralBonus" type="number" defaultValue="0.5" min="0" step="0.1" />
                <p className="text-xs text-muted-foreground">Amount of bottle caps users receive for each referral</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="streakProtection">Streak Protection Frequency</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="streakProtection">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="monthly">Monthly (1 per month)</SelectItem>
                    <SelectItem value="weekly">Weekly (1 per week)</SelectItem>
                    <SelectItem value="promotional">Promotional Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">How often users receive streak protection items</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekendMultiplier">Weekend Bonus Multiplier</Label>
                <Input id="weekendMultiplier" type="number" defaultValue="1" min="1" step="0.1" />
                <p className="text-xs text-muted-foreground">
                  Bonus multiplier for claims made on weekends (1 = no bonus)
                </p>
              </div>

              <Button className="mt-4">Save Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rateLimit">Rate Limiting (requests per minute)</Label>
                <Input id="rateLimit" type="number" defaultValue="10" min="1" />
                <p className="text-xs text-muted-foreground">Maximum number of claim attempts per minute</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="enableHoneypot" defaultChecked />
                  <label
                    htmlFor="enableHoneypot"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Enable bot detection (honeypot)
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adds invisible form fields to detect automated submissions
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="ipLogging" defaultChecked />
                  <label
                    htmlFor="ipLogging"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Enable IP logging for security
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="adminApproval" defaultChecked />
                  <label
                    htmlFor="adminApproval"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Require admin approval for password resets
                  </label>
                </div>
              </div>

              <Button className="mt-4">Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
