
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { BottleCap } from "@/components/BottleCap";
import { ArrowLeft, Calendar, Award, BarChart3, Clock, TrendingUp, ChartPie } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, getAllUsers } = useAuth();
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (currentUser && !currentUser.isAdmin) {
      navigate("/dashboard");
      return;
    }

    if (getAllUsers) {
      const allUsers = getAllUsers();
      const foundUser = allUsers.find(u => u.id === id);
      
      if (foundUser) {
        setUser(foundUser);
        // In a real application, you would fetch user-specific analytics here
        // For now we'll just update the dummy data to somewhat match the user
        
        setDailyClaimData(prevData => prevData.map(item => ({
          ...item,
          claims: Math.floor(Math.random() * 3)
        })));
        
        setMonthlyClaimsData(prevData => prevData.map(item => ({
          ...item,
          claims: Math.floor(Math.random() * (foundUser.totalClaims || 10) / 2) + 1
        })));
      } else {
        toast.error("User not found");
        navigate("/admin");
      }
    }
    
    setIsLoading(false);
  }, [id, isAuthenticated, currentUser, navigate, getAllUsers]);

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
                      <p className="text-sm font-medium text-gray-500">Total Claims</p>
                      <h3 className="text-3xl font-bold">{user.totalClaims}</h3>
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
                      <p className="text-sm font-medium text-gray-500">Claim Rate</p>
                      <h3 className="text-3xl font-bold">85%</h3>
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
          <TabsList className="grid w-full grid-cols-4 mb-8">
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
            <TabsTrigger value="outcomes" className="flex items-center gap-2">
              <ChartPie className="h-4 w-4" />
              <span>Claim Outcomes</span>
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

          <TabsContent value="outcomes">
            <Card>
              <CardHeader>
                <CardTitle>Claim Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-around">
                  <div className="w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={claimOutcomeData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {claimOutcomeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="space-y-4">
                      {claimOutcomeData.map((item, index) => (
                        <div key={item.name} className="flex items-center">
                          <div 
                            className="w-4 h-4 mr-2 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.value}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
