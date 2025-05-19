"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BottleCap } from "@/components/bottle-cap"
import { useAuth } from "@/lib/context/auth-context"
import { useBottleCap } from "@/lib/context/bottlecap-context"
import { User, Settings, LogOut, BarChart2, Shield } from "lucide-react"

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const { balance } = useBottleCap()
  const pathname = usePathname()

  if (!isAuthenticated) return null

  const isAdmin = user?.isAdmin

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BottleCap size="sm" />
            <span className="font-bold text-xl">BottleCaps</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className={pathname === "/dashboard" ? "font-medium" : "text-muted-foreground"}>
            Dashboard
          </Link>
          <Link href="/profile" className={pathname === "/profile" ? "font-medium" : "text-muted-foreground"}>
            Profile
          </Link>
          <Link href="/analytics" className={pathname === "/analytics" ? "font-medium" : "text-muted-foreground"}>
            Analytics
          </Link>
          {isAdmin && (
            <Link href="/admin" className={pathname.startsWith("/admin") ? "font-medium" : "text-muted-foreground"}>
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
            <BottleCap size="sm" />
            <span className="font-medium">{balance}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.username}</span>
                  <span className="text-xs text-muted-foreground">Balance: {balance} BottleCaps</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
