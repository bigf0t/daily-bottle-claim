"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/context/auth-context"
import { useBottleCap } from "@/lib/context/bottlecap-context"
import { Copy, Check, Twitter, Facebook, Linkedin } from "lucide-react"

export function SocialShare() {
  const { user } = useAuth()
  const { balance, currentStreak, claims } = useBottleCap()
  const { toast } = useToast()
  const [isCopied, setIsCopied] = useState(false)

  // Generate share URL with encoded user data
  const shareUrl = `${window.location.origin}/share?u=${encodeURIComponent(
    user?.username || "",
  )}&b=${balance}&s=${currentStreak}&c=${claims.length}`

  // Generate share message
  const shareMessage = `I've collected ${balance} BottleCaps with a ${currentStreak}-day streak on BottleCaps! Join me and start collecting your own digital bottle caps.`

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    })
  }

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
    )
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Share Your Stats</h3>
        <p className="text-sm text-muted-foreground">Let others know about your BottleCaps collection!</p>
      </div>

      <div className="flex">
        <Input value={shareUrl} readOnly className="rounded-r-none" />
        <Button variant="secondary" className="rounded-l-none" onClick={copyShareLink}>
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-col space-y-2">
        <Button onClick={shareOnTwitter} variant="outline" className="justify-start">
          <Twitter className="mr-2 h-4 w-4" />
          Share on Twitter
        </Button>
        <Button onClick={shareOnFacebook} variant="outline" className="justify-start">
          <Facebook className="mr-2 h-4 w-4" />
          Share on Facebook
        </Button>
        <Button onClick={shareOnLinkedIn} variant="outline" className="justify-start">
          <Linkedin className="mr-2 h-4 w-4" />
          Share on LinkedIn
        </Button>
      </div>
    </div>
  )
}
