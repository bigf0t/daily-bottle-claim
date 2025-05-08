
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { BottleCap } from "@/components/BottleCap";
import { ArrowLeft, Calendar, Award, BarChart3, Clock, TrendingUp, ChartPie, Share2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, getAllUsers, getClaimLogs } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Example analytics data - in a real app, this would come from an API
  const [dailyClaimData, setDailyClaimData] = useState([
    { name: 'Mon', claims: 2 },
    { name: 'Tue', claims: 1 },
    { name: 'Wed', claims: 1 },
    { name: 'Thu', claims: 0 },
    { name: 'Fri', claims: 1 },
    { name: 'Sat', claims: 0 },
    { name: 'Sun', claims: 2 },
  ]);

  const [claimTimeData, setClaimTimeData] = useState([
    { hour: '00:00', claims: 1 },
    { hour: '03:00', claims: 0 },
    { hour: '06:00', claims: 0 },
    { hour: '09:00', claims: 2 },
    { hour: '12:00', claims: 1 },
    { hour: '15:00', claims: 2 },
    { hour: '18:00', claims: 1 },
    { hour: '21:00', claims: 0 },
  ]);

  const [monthlyClaimsData, setMonthlyClaimsData] = useState([
    { month: 'Jan', claims: 5 },
    { month: 'Feb', claims: 8 },
    { month: 'Mar', claims: 12 },
    { month: 'Apr', claims: 15 },
    { month: 'May', claims: 10 },
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const [claimOutcomeData, setClaimOutcomeData] = useState([
    { name: 'Success', value: 85 },
    { name: 'Already Claimed', value: 15 },
  ]);

  const [streakHistoryData, setStreakHistoryData] = useState([
    { date: '1/1', streak: 1 },
    { date: '1/8', streak: 3 },
    { date: '1/15', streak: 5 },
    { date: '1/22', streak: 7 },
    { date: '1/29', streak: 4 },
    { date: '2/5', streak: 6 },
    { date: '2/12', streak: 8 },
  ]);

  // State for share dialog
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [claimsToday, setClaimsToday] = useState(0);
  const [avgClaimsPerDay, setAvgClaimsPerDay] = useState(0);

  // No longer need to generate a share URL
  const openShareDialog = useCallback(() => {
    setIsShareDialogOpen(true);
  }, []);

  // Calculate claims today for this user
  const calculateClaimsToday = (user) => {
    if (!user || !user.lastClaim) return 0;

    try {
      // Get all claim logs for this user
      const logs = getClaimLogs ? getClaimLogs() : [];
      console.log("Claim logs:", logs);

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Count successful claims made today by this user
      return logs.filter(log =>
        log.username === user.username &&
        log.result === "success" &&
        log.timestamp.split('T')[0] === todayStr
      ).length;
    } catch (error) {
      console.error("Error calculating claims today:", error);
      return 0;
    }
  };

  // Calculate average claims per day since account creation
  const calculateAvgClaimsPerDay = (user) => {
    if (!user || !user.createdAt || !user.totalClaims) return 0;

    const createdDate = new Date(user.createdAt);
    const today = new Date();

    // Calculate days since account creation (at least 1 day)
    const daysSinceCreation = Math.max(1, Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)));

    // Calculate average claims per day
    return parseFloat((user.totalClaims / daysSinceCreation).toFixed(1));
  };

  useEffect(() => {
    // Don't redirect to login if we're already authenticated
    // This prevents the redirect loop issue
    if (isAuthenticated === false && !isLoading) {
      navigate("/login");
      return;
    }

    // Only check admin status if we have a currentUser
    if (currentUser && !currentUser.isAdmin && !isLoading) {
      navigate("/dashboard");
      return;
    }

    const loadUserData = () => {
      try {
        if (getAllUsers && id) {
          const allUsers = getAllUsers();
          console.log("All users:", allUsers); // Debug log

          if (!allUsers || allUsers.length === 0) {
            console.error("No users found in getAllUsers()");
            toast.error("No users found");
            navigate("/admin");
            setIsLoading(false);
            return;
          }

          const foundUser = allUsers.find(u => u.id === id);
          console.log("Found user:", foundUser, "for ID:", id); // Debug log

          if (foundUser) {
            // Make a clean copy of the user without any password field
            const cleanUser = {
              id: foundUser.id,
              username: foundUser.username,
              totalClaims: foundUser.totalClaims || 0,
              streak: foundUser.streak || 0,
              lastClaim: foundUser.lastClaim,
              isAdmin: foundUser.isAdmin || false,
              createdAt: foundUser.createdAt,
              usernameUpdatedAt: foundUser.usernameUpdatedAt,
              ethAddress: foundUser.ethAddress,
              email: foundUser.email,
              profilePicture: foundUser.profilePicture
            };

            setUser(cleanUser);

            // Calculate user-specific metrics
            const userClaimsToday = calculateClaimsToday(cleanUser);
            setClaimsToday(userClaimsToday);

            const userAvgClaimsPerDay = calculateAvgClaimsPerDay(cleanUser);
            setAvgClaimsPerDay(userAvgClaimsPerDay);
          } else {
            console.error("User not found with ID:", id);
            toast.error("User not found");
            navigate("/admin");
          }
        } else {
          console.error("getAllUsers or id is missing:", { getAllUsers: !!getAllUsers, id });
          toast.error("Could not load user data");
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Error loading user data");
        navigate("/admin");
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure the user data is loaded
    setTimeout(loadUserData, 100);
  }, [id, isAuthenticated, currentUser, navigate, getAllUsers, getClaimLogs, isLoading]);

  useEffect(() => {
    // Update analytics data when user changes
    if (user) {
      // Daily claims - randomize but based on user's total claims
      setDailyClaimData(prevData => prevData.map(item => ({
        ...item,
        claims: Math.min(Math.floor(Math.random() * (user.totalClaims > 10 ? 3 : 2)), user.totalClaims)
      })));

      // Monthly claims - distribute the user's total claims across months
      const totalClaims = user.totalClaims || 0;
      const monthlyAvg = totalClaims / 5; // 5 months in our data

      setMonthlyClaimsData(prevData => prevData.map((item, index) => {
        // Weight more recent months with more claims
        const weight = (index + 1) / 15 + 0.5;
        return {
          ...item,
          claims: Math.max(1, Math.floor(monthlyAvg * weight))
        };
      }));

      // Update streak history to match user's current streak
      const currentStreak = user.streak || 0;
      setStreakHistoryData(prevData => {
        // Create a realistic streak progression
        return prevData.map((item, index) => ({
          ...item,
          streak: Math.min(currentStreak, Math.floor((index + 1) * currentStreak / 7) + (Math.random() > 0.5 ? 1 : 0))
        }));
      });

      // No need to generate share URL anymore
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>User not found</p>
        <Button onClick={() => navigate("/admin")} className="mt-4">Back to Admin</Button>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 pb-10">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <BottleCap size="sm" className="mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-bottlecap-navy">User Details</h1>
              <p className="text-sm text-gray-500">View user statistics and analytics</p>
            </div>
          </div>
          <div>
            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={openShareDialog}
                >
                  <Share2 className="h-4 w-4" />
                  Share Stats
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>User Analytics</DialogTitle>
                  <DialogDescription>
                    {user?.username}'s bottle cap collection stats
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                    <Avatar className="h-12 w-12 mr-3">
                      {user?.profilePicture ? (
                        <AvatarImage src={user.profilePicture} alt={user.username} />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-sm">
                          {user?.username ? user.username.substring(0, 2).toUpperCase() : "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-bold text-lg">{user?.username}</div>
                      <div className="text-xs text-gray-500">Member since {formatDate(user?.createdAt)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">Total Claims</div>
                      <div className="text-2xl font-bold text-blue-700">{user?.totalClaims}</div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600">Current Streak</div>
                      <div className="text-2xl font-bold text-amber-700">{user?.streak}</div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg text-center mb-4">
                    <div className="text-sm text-gray-600">Average Claims/Day</div>
                    <div className="text-2xl font-bold text-green-700">{avgClaimsPerDay}</div>
                  </div>

                  {user?.streak >= 100 && (
                    <div className="bg-yellow-50 p-2 rounded-lg text-center border border-yellow-200">
                      <div className="text-sm font-semibold text-yellow-700">
                        <span className="inline-block animate-pulse">★</span> 100+ DAY STREAK! EARNING DOUBLE REWARDS! <span className="inline-block animate-pulse">★</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-center text-gray-500 mt-2">
                  Take a screenshot to share these stats
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start">
              <Avatar className="mr-4 h-16 w-16 border-2 border-blue-100">
                <AvatarImage src={user.profilePicture || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                  {user.username ? user.username.substring(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.username}</CardTitle>
                <CardDescription>
                  <div className="flex flex-col sm:flex-row sm:gap-6 mt-2">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4 text-gray-500" />
                      <span>Last claim {formatDate(user.lastClaim)}</span>
                    </div>
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Claims Today</p>
                      <h3 className="text-3xl font-bold">{claimsToday}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <BottleCap size="sm" className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Streak</p>
                      <h3 className="text-3xl font-bold">{user.streak}</h3>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-full">
                      <Award className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg Claims/Day</p>
                      <h3 className="text-3xl font-bold">{avgClaimsPerDay}</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Daily Claims</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Monthly Trends</span>
            </TabsTrigger>
            <TabsTrigger value="streaks" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Streak History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Claims by Day of Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyClaimData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="claims" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Claims by Time of Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={claimTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="claims" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyClaimsData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="claims" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streaks">
            <Card>
              <CardHeader>
                <CardTitle>Streak History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={streakHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="streak" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </main>
    </div>
  );
}
