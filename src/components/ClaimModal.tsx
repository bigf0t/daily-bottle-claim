
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CountdownTimer } from "@/components/CountdownTimer";
import { BottleCap } from "@/components/BottleCap";
import { useAuth } from "@/contexts/AuthContext";
import { getTimeUntilNextClaim } from "@/utils/authUtils";
import { AuthContextType } from "@/types/auth";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimModal({ isOpen, onClose }: ClaimModalProps) {
  const { user, processClaim, currentClaimAmount = 1 } = useAuth() as AuthContextType;
  const [claimStatus, setClaimStatus] = useState<"waiting" | "success" | "already_claimed">("waiting");
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const [claimImage, setClaimImage] = useState<string>("https://source.unsplash.com/random/1200x800/?drink,beverage");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setClaimStatus("waiting");
      setIsTimerComplete(false);

      // Load the custom claim image if available
      const savedClaimImage = localStorage.getItem("bottlecaps_claim_image");
      if (savedClaimImage) {
        setClaimImage(savedClaimImage);
      }
    }
  }, [isOpen]);

  // Process claim when timer is complete
  const handleTimerComplete = () => {
    setIsTimerComplete(true);
    const result = processClaim();
    setClaimStatus(result);
  };

  // Close dialog when user clicks "Continue" after claim
  const handleContinue = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if timer completed
      if (!open && isTimerComplete) {
        onClose();
      }
    }}>
      <DialogContent
        className="max-w-full w-full h-screen sm:max-w-full sm:h-screen p-0 m-0 rounded-none bg-gradient-to-b from-bottlecap-navy to-black"
      >
        {/* Hide close button with CSS if timer not complete */}
        {!isTimerComplete && (
          <style dangerouslySetInnerHTML={{
            __html: `
              [data-radix-popper-content-wrapper] [role="dialog"] button {
                display: none !important;
              }
            `
          }} />
        )}
        {claimStatus === "waiting" && (
          <div className="flex flex-col items-center justify-center h-full w-full p-4">
            {/* Ad image - now using the custom image */}
            <div className="relative flex-1 w-full max-h-[70vh] flex items-center justify-center mb-8 overflow-hidden">
              <img
                src={claimImage}
                alt="Daily Promotion"
                className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-xs">
                Sponsored
              </div>
            </div>

            <CountdownTimer
              seconds={30}
              onComplete={handleTimerComplete}
              className="mt-auto"
            />
          </div>
        )}

        {claimStatus === "success" && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="animate-bounce-light mb-8">
              <BottleCap size="lg" color="gold" animated />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Success!</h2>
            <p className="text-2xl text-white mb-4">
              {user?.streak > 1
                ? `You've claimed ${currentClaimAmount} BottleCap${currentClaimAmount > 1 ? 's' : ''} and maintained a ${user.streak}-day streak!`
                : `You've claimed ${currentClaimAmount} BottleCap${currentClaimAmount > 1 ? 's' : ''}!`}
            </p>

            {user?.streak >= 100 ? (
              <p className="text-lg text-yellow-300 mb-4">
                <span className="inline-block animate-pulse">★</span> 100+ DAY STREAK BONUS! DOUBLE REWARDS! <span className="inline-block animate-pulse">★</span>
              </p>
            ) : user?.streak >= 90 ? (
              <p className="text-lg text-yellow-200 mb-4">
                Only {100 - user.streak} more days to reach 100-day streak and earn DOUBLE rewards!
              </p>
            ) : null}

            <p className="text-xl text-bottlecap-gold mb-8">
              Total Balance: {user?.totalClaims} BottleCaps
            </p>
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-bottlecap-blue hover:bg-blue-600 text-white rounded-full font-bold text-lg transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {claimStatus === "already_claimed" && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <BottleCap size="lg" color="silver" className="mb-8 opacity-70" />
            <h2 className="text-3xl font-bold text-white mb-4">Already Claimed</h2>
            <p className="text-xl text-gray-300 mb-4">
              You've already claimed your BottleCap.
            </p>
            <p className="text-md text-bottlecap-silver mb-2">
              Next claim available in:
            </p>
            <p className="text-2xl text-bottlecap-gold font-mono mb-8">
              {/* Show time until next claim (6 hours after last claim) */}
              {(() => {
                if (!user?.lastClaim) return "00:00";

                const timeUntilNextMs = getTimeUntilNextClaim(user.lastClaim);
                const hours = Math.floor(timeUntilNextMs / (1000 * 60 * 60));
                const minutes = Math.floor((timeUntilNextMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeUntilNextMs % (1000 * 60)) / 1000);

                return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
              })()}
            </p>
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-bottlecap-blue hover:bg-blue-600 text-white rounded-full font-bold text-lg transition-colors"
            >
              Continue
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
