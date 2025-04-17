
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClaimModal } from "@/components/ClaimModal";
import { BottleCap } from "@/components/BottleCap";
import { HoneypotButton } from "@/components/HoneypotButton";
import { CalendarDays, Star, Clock, LogOut, Award } from "lucide-react";

export default function Dashboard() {
  const { user, logout, isAuthenticated, isClaimAllowed } = useAuth() as any;
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  // Format date in a readable way
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Check if user is an admin
  const isAdmin = user?.isAdmin;
  
  // If still authenticating or no user, show loading
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center">
            <BottleCap size="sm" className="mr-3" />
            <h1 className="text-2xl font-bold text-bottlecap-navy">BottleCaps</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => navigate("/admin")}
              >
                Admin Panel
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              className="text-gray-600" 
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* User info card */}
          <Card className="col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center">
                  <div className="text-4xl font-bold mr-2">{user.username}</div>
                </div>
                
                <Separator />
                
                <div className="flex items-center text-gray-600">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>Joined: {formatDate(user.createdAt) || "Today"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats card */}
          <Card className="col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
                  <BottleCap size="sm" />
                  <div className="mt-2 text-2xl font-bold">{user.totalClaims}</div>
                  <div className="text-sm text-gray-500">Total Claimed</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg">
                  <Star className="w-10 h-10 text-bottlecap-gold" />
                  <div className="mt-2 text-2xl font-bold">{user.streak}</div>
                  <div className="text-sm text-gray-500">Day Streak</div>
                </div>
                
                <div className="col-span-2 flex flex-col p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-500" />
                    <div className="text-sm text-gray-500">Last Claim:</div>
                  </div>
                  <div className="mt-1 text-lg font-medium">{formatDate(user.lastClaim)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Claim card */}
          <Card className="col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Daily Claim</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {isClaimAllowed ? (
                <>
                  <BottleCap size="lg" animated className="mb-4" />
                  <p className="text-center mb-4">
                    Your daily BottleCap is ready to claim!
                  </p>
                  <Button 
                    size="lg"
                    className="w-full bg-bottlecap-blue hover:bg-blue-600"
                    onClick={() => setIsClaimModalOpen(true)}
                  >
                    Claim Now
                  </Button>
                </>
              ) : (
                <>
                  <BottleCap size="md" color="silver" className="mb-4 opacity-60" />
                  <div className="text-center mb-4">
                    <p className="text-gray-500 mb-2">
                      You've already claimed today.
                    </p>
                    <p className="text-sm text-bottlecap-blue">
                      Come back tomorrow for your next BottleCap!
                    </p>
                  </div>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    Already Claimed
                  </Button>
                </>
              )}
              
              {user.streak >= 7 && (
                <div className="mt-6 flex items-center text-bottlecap-gold bg-amber-50 p-3 rounded-lg w-full">
                  <Award className="w-8 h-8 mr-3" />
                  <div>
                    <p className="font-semibold">Consistent Claimer!</p>
                    <p className="text-sm">You've maintained a {user.streak}-day streak.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Claim modal */}
      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
      />
      
      {/* Honeypot for bot detection */}
      <HoneypotButton />
    </div>
  );
}
