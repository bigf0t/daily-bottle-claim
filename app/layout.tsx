import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/context/auth-context"
import { BottleCapProvider } from "@/lib/context/bottlecap-context"
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from "@/lib/context/notification-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BottleCaps - Daily Claim Platform",
  description: "Claim your digital bottle caps every 6 hours and build your collection!",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <BottleCapProvider>
              <NotificationProvider>
                {children}
                <Toaster />
              </NotificationProvider>
            </BottleCapProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
