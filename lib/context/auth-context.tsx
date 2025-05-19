"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  username: string
  email?: string
  walletAddress?: string
  profilePicture?: string
  isAdmin: boolean
  referralCode: string
  createdAt: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; isAdmin: boolean }>
  register: (username: string, password: string, email?: string, referralCode?: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("bottlecaps-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Modify the login function to return the user's role
  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, check if username is "admin" and password is "123"
      if (username === "admin" && password === "123") {
        const adminUser: User = {
          id: "admin-1",
          username: "admin",
          isAdmin: true,
          referralCode: "ADMIN123",
          createdAt: new Date().toISOString(),
        }
        setUser(adminUser)
        localStorage.setItem("bottlecaps-user", JSON.stringify(adminUser))
        return { success: true, isAdmin: true }
      }

      // For demo purposes, accept any username/password combination
      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        isAdmin: false,
        referralCode: `${username.toUpperCase()}${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
      }
      setUser(newUser)
      localStorage.setItem("bottlecaps-user", JSON.stringify(newUser))
      return { success: true, isAdmin: false }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, isAdmin: false }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, password: string, email?: string, referralCode?: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, create a new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        email,
        isAdmin: false,
        referralCode: `${username.toUpperCase()}${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
      }

      // Store users in localStorage for demo
      const users = JSON.parse(localStorage.getItem("bottlecaps-users") || "[]")

      // Check if username already exists
      if (users.some((u: User) => u.username === username)) {
        return false
      }

      users.push({
        ...newUser,
        password, // In a real app, this would be hashed
      })
      localStorage.setItem("bottlecaps-users", JSON.stringify(users))

      // Auto login after registration
      setUser(newUser)
      localStorage.setItem("bottlecaps-user", JSON.stringify(newUser))
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("bottlecaps-user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
