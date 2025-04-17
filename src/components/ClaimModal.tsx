
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CountdownTimer } from "@/components/CountdownTimer";
import { BottleCap } from "@/components/BottleCap";
import { useAuth } from "@/contexts/AuthContext";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimModal({ isOpen, onClose }: ClaimModalProps) {
  const { user, processClaim } = useAuth() as any;
  const [claimStatus, setClaimStatus] = useState<"waiting" | "success" | "already_claimed">("waiting");
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setClaimStatus("waiting");
      setIsTimerComplete(false);
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
            {/* Placeholder ad image */}
            <div className="relative flex-1 w-full max-h-[70vh] flex items-center justify-center mb-8 overflow-hidden">
              <img 
                src="https://source.unsplash.com/random/1200x800/?drink,beverage" 
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
            <p className="text-2xl text-white mb-8">
              {user?.streak > 1 
                ? `You've claimed 1 BottleCap and maintained a ${user.streak}-day streak!` 
                : "You've claimed 1 BottleCap!"}
            </p>
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
            <h2 className="text-3xl font-bold text-white mb-4">Already Claimed Today</h2>
            <p className="text-xl text-gray-300 mb-8">
              You've already claimed your daily BottleCap. Come back tomorrow!
            </p>
            <p className="text-md text-bottlecap-silver mb-2">
              Next claim available in:
            </p>
            <p className="text-2xl text-bottlecap-gold font-mono mb-8">
              {/* Show time until midnight UTC */}
              {(() => {
                const now = new Date();
                const tomorrow = new Date();
                tomorrow.setUTCHours(24, 0, 0, 0);
                const diff = tomorrow.getTime() - now.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
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
