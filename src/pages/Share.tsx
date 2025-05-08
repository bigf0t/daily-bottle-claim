import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottleCap } from "@/components/BottleCap";
import { Award, Calendar, Home, TrendingUp, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SharedStats {
  username: string;
  totalClaims: number;
  streak: number;
  joinedDate: string;
  avgClaimsPerDay?: number;
  profilePicture?: string;
}

export default function Share() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sharedStats, setSharedStats] = useState<SharedStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) {
      setError("No shared data found");
      return;
    }

    try {
      const decodedData = JSON.parse(decodeURIComponent(data));
      setSharedStats(decodedData);
    } catch (err) {
      console.error("Error parsing shared data:", err);
      setError("Invalid shared data");
    }
  }, [searchParams]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">{error}</p>
            <Button onClick={() => navigate("/")} className="mt-2">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sharedStats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
        <p>Loading shared data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex flex-col items-center">
            <Avatar className="h-20 w-20 mb-3">
              {sharedStats.profilePicture ? (
                <AvatarImage src={sharedStats.profilePicture} alt={sharedStats.username} />
              ) : (
                <AvatarFallback className="bg-bottlecap-blue/10">
                  <User className="h-10 w-10 text-bottlecap-blue/50" />
                </AvatarFallback>
              )}
            </Avatar>
            <BottleCap size="md" />
          </div>
          <CardTitle>BottleCaps Stats</CardTitle>
          <CardDescription>
            Check out {sharedStats.username}'s bottle cap collection!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <BottleCap size="sm" className="mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Claims</p>
                  <p className="text-2xl font-bold">{sharedStats.totalClaims}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center">
                <Award className="h-6 w-6 text-amber-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Streak</p>
                  <p className="text-2xl font-bold">{sharedStats.streak}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Claims/Day</p>
                  <p className="text-2xl font-bold">{sharedStats.avgClaimsPerDay || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-2xl font-bold">{formatDate(sharedStats.joinedDate)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to BottleCaps
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
