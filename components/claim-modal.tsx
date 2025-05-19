"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BottleCap } from "@/components/bottle-cap"
import { Confetti } from "@/components/confetti"
import { useBottleCap } from "@/lib/context/bottlecap-context"
import { useAuth } from "@/lib/context/auth-context"

export function ClaimModal() {
  const { user } = useAuth()
  const { isClaimModalOpen, closeClaimModal, balance, currentStreak, isPromotionActive, currentPromotionMultiplier } =
    useBottleCap()
  const [progress, setProgress] = useState(0)
  const [showContinue, setShowContinue] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Sample claim media - in a real app, this would come from the admin configuration
  const claimMedia = "/placeholder.svg?height=400&width=400"
  const isVideo = false // This would be determined by the media type in a real app

  useEffect(() => {
    if (isClaimModalOpen) {
      setProgress(0)
      setShowContinue(false)
      setShowConfetti(false)
      setMediaLoaded(false)

      // For videos, we'd handle the progress differently
      if (isVideo && videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play().catch((err) => console.error("Video playback error:", err))
      } else {
        // For images, simulate progress
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval)
              setShowContinue(true)
              setShowConfetti(true)
              return 100
            }
            return prev + 1
          })
        }, 50) // 5 seconds total duration

        return () => clearInterval(interval)
      }
    }
  }, [isClaimModalOpen, isVideo])

  // Handle video progress
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(percentage)

      if (percentage >= 99) {
        setShowContinue(true)
        setShowConfetti(true)
      }
    }
  }

  // Handle media load
  const handleMediaLoad = () => {
    setMediaLoaded(true)
  }

  // Determine bonus text based on streak and promotions
  const getBonusText = () => {
    const bonusTexts = []

    if (currentStreak >= 100) {
      bonusTexts.push("100+ day streak bonus: +1 BottleCap!")
    } else if (currentStreak >= 7) {
      bonusTexts.push("7+ day streak bonus: +0.5 BottleCap!")
    }

    if (isPromotionActive) {
      bonusTexts.push(`Active promotion: ${(currentPromotionMultiplier - 1) * 100}% bonus!`)
    }

    return bonusTexts
  }

  const bonusTexts = getBonusText()

  // Calculate total claim amount
  const baseAmount = 1
  let bonusAmount = 0

  if (currentStreak >= 100) {
    bonusAmount += 1
  } else if (currentStreak >= 7) {
    bonusAmount += 0.5
  }

  // Apply promotion multiplier to the total
  const totalBeforePromotion = baseAmount + bonusAmount
  const promotionBonus = isPromotionActive ? totalBeforePromotion * (currentPromotionMultiplier - 1) : 0
  const totalAmount = totalBeforePromotion + promotionBonus

  return (
    <>
      <Confetti active={showConfetti} />
      <Dialog open={isClaimModalOpen} onOpenChange={() => showContinue && closeClaimModal()}>
        <DialogContent className="sm:max-w-md" showClose={false}>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <BottleCap size="lg" color="blue" animate={true} />

            <h2 className="text-2xl font-bold text-center">Claim Successful!</h2>

            <div className="w-full">
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={claimMedia}
                  className="w-full h-auto rounded-lg"
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedData={handleMediaLoad}
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={claimMedia || "/placeholder.svg"}
                  alt="Claim reward"
                  className="w-full h-auto rounded-lg"
                  onLoad={handleMediaLoad}
                />
              )}
            </div>

            <Progress value={progress} className="w-full" />

            <div className="text-center space-y-2">
              <p className="text-lg">
                You claimed <span className="font-bold">{baseAmount} BottleCap</span>!
              </p>

              {bonusTexts.map((text, index) => (
                <p key={index} className="text-green-400">
                  {text}
                </p>
              ))}

              {promotionBonus > 0 && (
                <p className="text-amber-400">Promotion bonus: +{promotionBonus.toFixed(1)} BottleCaps!</p>
              )}

              <p className="text-sm text-muted-foreground">
                Current streak: {currentStreak} day{currentStreak !== 1 ? "s" : ""}
              </p>
              <p className="font-bold">Total balance: {balance} BottleCaps</p>
            </div>

            {showContinue && (
              <Button onClick={closeClaimModal} className="w-full">
                Continue
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
