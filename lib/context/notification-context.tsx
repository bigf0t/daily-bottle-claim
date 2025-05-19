"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { useBottleCap } from "./bottlecap-context"

type NotificationContextType = {
  notificationsEnabled: boolean
  enableNotifications: () => Promise<boolean>
  disableNotifications: () => void
  sendNotification: (title: string, body: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { nextClaimTime } = useBottleCap()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationTimeout, setNotificationTimeout] = useState<NodeJS.Timeout | null>(null)

  // Check if notifications are enabled on mount
  useEffect(() => {
    if (!user) return

    const storedPreference = localStorage.getItem(`bottlecaps-notifications-${user.id}`)
    setNotificationsEnabled(storedPreference === "enabled")
  }, [user])

  // Schedule notification for next claim
  useEffect(() => {
    if (!user || !notificationsEnabled || !nextClaimTime) return

    // Clear any existing timeout
    if (notificationTimeout) {
      clearTimeout(notificationTimeout)
    }

    const now = new Date()
    const timeUntilClaim = nextClaimTime.getTime() - now.getTime()

    if (timeUntilClaim > 0) {
      const timeout = setTimeout(() => {
        sendNotification("BottleCaps Claim Ready!", "Your next bottle cap is ready to claim!")
      }, timeUntilClaim)

      setNotificationTimeout(timeout)
    }

    return () => {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout)
      }
    }
  }, [user, notificationsEnabled, nextClaimTime])

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      console.error("This browser does not support desktop notifications")
      return false
    }

    try {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        setNotificationsEnabled(true)
        if (user) {
          localStorage.setItem(`bottlecaps-notifications-${user.id}`, "enabled")
        }
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return false
    }
  }

  const disableNotifications = () => {
    setNotificationsEnabled(false)
    if (user) {
      localStorage.setItem(`bottlecaps-notifications-${user.id}`, "disabled")
    }
    if (notificationTimeout) {
      clearTimeout(notificationTimeout)
    }
  }

  const sendNotification = (title: string, body: string) => {
    if (!notificationsEnabled || !("Notification" in window)) return

    try {
      new Notification(title, {
        body,
        icon: "/bottlecap-icon.png", // This would be a real icon in production
      })
    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        enableNotifications,
        disableNotifications,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
