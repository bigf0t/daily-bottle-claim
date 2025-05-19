"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useNotification } from "@/lib/context/notification-context"
import { useToast } from "@/components/ui/use-toast"
import { Bell, BellOff } from "lucide-react"

export function NotificationSettings() {
  const { notificationsEnabled, enableNotifications, disableNotifications } = useNotification()
  const { toast } = useToast()
  const [isRequesting, setIsRequesting] = useState(false)

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      setIsRequesting(true)
      const success = await enableNotifications()
      setIsRequesting(false)

      if (success) {
        toast({
          title: "Notifications enabled",
          description: "You will now receive notifications when your claim is ready.",
        })
      } else {
        toast({
          title: "Permission denied",
          description: "Please allow notifications in your browser settings.",
          variant: "destructive",
        })
      }
    } else {
      disableNotifications()
      toast({
        title: "Notifications disabled",
        description: "You will no longer receive notifications.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="notifications">Claim Notifications</Label>
          <p className="text-sm text-muted-foreground">Receive notifications when your next claim is available</p>
        </div>
        <Switch
          id="notifications"
          checked={notificationsEnabled}
          onCheckedChange={handleToggle}
          disabled={isRequesting}
        />
      </div>

      {!notificationsEnabled && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => handleToggle(true)}
          disabled={isRequesting}
        >
          <Bell className="mr-2 h-4 w-4" />
          {isRequesting ? "Requesting permission..." : "Enable notifications"}
        </Button>
      )}

      {notificationsEnabled && (
        <Button variant="outline" size="sm" className="w-full" onClick={() => handleToggle(false)}>
          <BellOff className="mr-2 h-4 w-4" />
          Disable notifications
        </Button>
      )}
    </div>
  )
}
