"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationSettings } from "@/components/notification-settings"
import { useToast } from "@/components/ui/use-toast"
import { Shield, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [autoClaimEnabled, setAutoClaimEnabled] = useState(false)
  const [streakReminderEnabled, setStreakReminderEnabled] = useState(true)

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    })
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationSettings />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="streakReminder">Streak Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a reminder if you haven&apos;t claimed today and your streak is at risk
                    </p>
                  </div>
                  <Switch
                    id="streakReminder"
                    checked={streakReminderEnabled}
                    onCheckedChange={setStreakReminderEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoClaim">Auto-Claim Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically claim when you open a notification (requires browser permission)
                    </p>
                  </div>
                  <Switch id="autoClaim" checked={autoClaimEnabled} onCheckedChange={setAutoClaimEnabled} />
                </div>
              </div>

              <Button onClick={handleSave}>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how BottleCaps looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setTheme("system")}
                  >
                    System
                  </Button>
                </div>
              </div>

              <Button onClick={handleSave}>Save Appearance Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="changePassword">Password</Label>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Shield className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Two-Factor Authentication</Label>
                <div className="p-4 border rounded-md bg-muted/30">
                  <p className="text-center text-sm">
                    Two-factor authentication is coming soon to enhance your account security.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Account Activity</Label>
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Last login</p>
                      <p className="text-sm text-muted-foreground">Today, 12:34 PM</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
