
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// This component is invisible to users but might be found by bots
// It logs any interactions to LocalStorage
export function HoneypotButton() {
  const [clicked, setClicked] = useState(false);
  
  const logBotInteraction = () => {
    setClicked(true);
    
    // Log the bot interaction
    const botLogs = JSON.parse(localStorage.getItem("bottlecaps_botlogs") || "[]");
    const botInteraction = {
      timestamp: new Date().toISOString(),
      ip: "127.0.0.1", // Placeholder - would be real IP in production
      userAgent: navigator.userAgent,
      action: "clicked_honeypot"
    };
    
    botLogs.push(botInteraction);
    localStorage.setItem("bottlecaps_botlogs", JSON.stringify(botLogs));
  };
  
  // If detected, redirect to admin panel or log
  useEffect(() => {
    if (clicked) {
      console.log("Bot detected through honeypot");
    }
  }, [clicked]);
  
  return (
    <Button
      onClick={logBotInteraction}
      style={{
        position: "fixed",
        opacity: 0,
        pointerEvents: "none", // This makes it invisible to real users
        cursor: "default",
        zIndex: -1,
        // Make it clickable by bots that don't respect visual styling
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      }}
      data-testid="claim-now" // Appealing attribute for bots
      aria-label="Get Free Tokens Now"
      className="honeypot-button"
    >
      Claim Free Tokens
    </Button>
  );
}
