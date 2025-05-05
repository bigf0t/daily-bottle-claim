import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { AuthContextType } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatCard } from "@/components/StatCard";
import { BottleCap } from "@/components/BottleCap";
import { UserHoverCard } from "@/components/UserHoverCard";
import {
  Ban, LogOut, Users, ClipboardList, Shield, BarChart3,
  Settings, Award, AlertTriangle, Image, Upload, Calendar,
  TrendingUp, ChartPie, Clock, MailCheck, ShieldAlert, 
  Maximize2, ChevronLeft, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';

export default function Admin() {
  const { user, logout, isAuthenticated, getAllUsers, getClaimLogs,
    passwordResetRequests = [], confirmPasswordResetRequest } = useAuth() as AuthContextType;
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [blacklistInput, setBlacklistInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [claimImage, setClaimImage] = useState<string>("https://source.unsplash.com/random/1200x800/?drink,beverage");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  // Chart dialogs open state
  const [openChartDialog, setOpenChartDialog] = useState<string | null>(null);

  const [dailyClaimData, setDailyClaimData] = useState([
    { name: 'Mon', claims: 24 },
    { name: 'Tue', claims: 30 },
    { name: 'Wed', claims: 27 },
    { name: 'Thu', claims: 32 },
    { name: 'Fri', claims: 38 },
    { name: 'Sat', claims: 41 },
    { name: 'Sun', claims: 35 },
  ]);
  
  const [historicalDailyClaimData, setHistoricalDailyClaimData] = useState([
    { name: 'Week 1', Mon: 15, Tue: 20, Wed: 18, Thu: 22, Fri: 26, Sat: 30, Sun: 25 },
    { name: 'Week 2', Mon: 18, Tue: 23, Wed: 20, Thu: 25, Fri: 30, Sat: 35, Sun: 27 },
    { name: 'Week 3', Mon: 20, Tue: 26, Wed: 22, Thu: 28, Fri: 33, Sat: 36, Sun: 29 },
    { name: 'Week 4', Mon: 24, Tue: 30, Wed: 27, Thu: 32, Fri: 38, Sat: 41, Sun: 35 },
  ]);

  const [userGrowthData, setUserGrowthData] = useState([
    { day: '4/10', users: 120 },
    { day: '4/11', users: 132 },
    { day: '4/12', users: 145 },
    { day: '4/13', users: 160 },
    { day: '4/14', users: 178 },
    { day: '4/15', users: 193 },
    { day: '4/16', users: 210 },
  ]);
  
  const [historicalUserGrowthData, setHistoricalUserGrowthData] = useState([
    { month: 'Jan', users: 50 },
    { month: 'Feb', users: 75 },
    { month: 'Mar', users: 95 },
    { month: 'Apr (Week 1)', users: 120 },
    { month: 'Apr (Week 2)', users: 145 },
    { month: 'Apr (Week 3)', users: 180 },
    { month: 'Apr (Week 4)', users: 210 },
  ]);

  const [streakDistributionData, setStreakDistributionData] = useState([
    { name: '1 day', value: 45 },
    { name: '2-3 days', value: 25 },
    { name: '4-7 days', value: 15 },
    { name: '1-2 weeks', value: 10 },
    { name: '2+ weeks', value: 5 },
  ]);
  
  const [historicalStreakDistributionData, setHistoricalStreakDistributionData] = useState([
    { month: 'Jan', '1 day': 60, '2-3 days': 20, '4-7 days': 10, '1-2 weeks': 7, '2+ weeks': 3 },
    { month: 'Feb', '1 day': 55, '2-3 days': 22, '4-7 days': 12, '1-2 weeks': 8, '2+ weeks': 3 },
    { month: 'Mar', '1 day': 50, '2-3 days': 23, '4-7 days': 14, '1-2 weeks': 9, '2+ weeks': 4 },
    { month: 'Apr', '1 day': 45, '2-3 days': 25, '4-7 days': 15, '1-2 weeks': 10, '2+ weeks': 5 },
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

  const [claimTimeData, setClaimTimeData] = useState([
    { hour: '00:00', claims: 10 },
    { hour: '03:00', claims: 5 },
    { hour: '06:00', claims: 8 },
    { hour: '09:00', claims: 30 },
    { hour: '12:00', claims: 45 },
    { hour: '15:00', claims: 38 },
    { hour: '18:00', claims: 25 },
    { hour: '21:00', claims: 15 },
  ]);
  
  const [historicalClaimTimeData, setHistoricalClaimTimeData] = useState([
    { month: 'Jan', '00:00': 5, '03:00': 2, '06:00': 4, '09:00': 15, '12:00': 25, '15:00': 20, '18:00': 10, '21:00': 8 },
    { month: 'Feb', '00:00': 7, '03:00': 3, '06:00': 5, '09:00': 20, '12:00': 30, '15:00': 25, '18:00': 15, '21:00': 10 },
    { month: 'Mar', '00:00': 8, '03:00': 4, '06:00': 7, '09:00': 25, '12:00': 38, '15:00': 32, '18:00': 20, '21:00': 12 },
    { month: 'Apr', '00:00': 10, '03:00': 5, '06:00': 8, '09:00': 30, '12:00': 45, '15:00': 38, '18:00': 25, '21:00': 15 },
  ]);

  const [suspiciousLoginAttempts, setSuspiciousLoginAttempts] = useState([
    { day: '4/10', attempts: 3 },
    { day: '4/11', attempts: 1 },
    { day: '4/12', attempts: 0 },
    { day: '4/13', attempts: 4 },
    { day: '4/14', attempts: 2 }
  ]);
  const [newUserRegistrations, setNewUserRegistrations] = useState([
    { month: 'Jan', count: 20 },
    { month: 'Feb', count: 45 },
    { month: 'Mar', count: 30 },
    { month: 'Apr', count: 55 },
  ]);
  const [blacklistTrends, setBlacklistTrends] = useState([
    { week: 'Week 1', blocks: 2 },
    { week: 'Week 2', blocks: 5 },
    { week: 'Week 3', blocks: 3 },
    { week: 'Week 4', blocks: 6 },
  ]);

  const [weeklyActiveUsers, setWeeklyActiveUsers] = useState([
    { week: 'Week 1', active: 100 },
    { week: 'Week 2', active: 115 },
    { week: 'Week 3', active: 120 },
    { week: 'Week 4', active: 110 },
  ]);

  const [claimSuccessRate, setClaimSuccessRate] = useState([
    { name: 'Success', value: 78 },
    { name: 'Failed', value: 22 },
  ]);

  const [userStreakVsClaims, setUserStreakVsClaims] = useState([
    { streak: 1, claims: 5 },
    { streak: 3, claims: 15 },
    { streak: 5, claims: 25 },
    { streak: 7, claims: 40 },
    { streak: 10, claims: 55 },
  ]);

  const [activeUserPercentage, setActiveUserPercentage] = useState<number>(0);
  const [monthlyClaimsData, setMonthlyClaimsData] = useState([
    { month: 'Jan', claims: 120 },
    { month: 'Feb', claims: 150 },
    { month: 'Mar', claims: 180 },
    { month: 'Apr', claims: 200 },
    { month: 'May', claims: 190 },
  ]);

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        const fetchedLogs = await getClaimLogs();
        
        setUsers(fetchedUsers);
        setLogs(fetchedLogs);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to fetch admin data");
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user, navigate, getAllUsers, getClaimLogs]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const addToBlacklist = (username: string) => {
    if (blacklist.includes(username)) return;
    const newBlacklist = [...blacklist, username];
    setBlacklist(newBlacklist);
    localStorage.setItem("bottlecaps_blacklist", JSON.stringify(newBlacklist));
  };

  const removeFromBlacklist = (username: string) => {
    const newBlacklist = blacklist.filter(name => name !== username);
    setBlacklist(newBlacklist);
    localStorage.setItem("bottlecaps_blacklist", JSON.stringify(newBlacklist));
  };

  const handleBlacklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blacklistInput.trim()) {
      addToBlacklist(blacklistInput.trim());
      setBlacklistInput("");
    }
  };

  const updateClaimImage = () => {
    if (imageUrl.trim()) {
      setClaimImage(imageUrl);
      localStorage.setItem("bottlecaps_claim_image", imageUrl);
      toast.success("Claim image updated successfully");
      setImageUrl("");
    } else {
      toast.error("Please enter a valid image URL");
    }
  };

  const handleApprovePasswordReset = (id: string) => {
    if (confirmPasswordResetRequest) {
      confirmPasswordResetRequest(id);
      toast.success("Password reset request approved. Please contact the user.");
    }
  };
  
  // Function to render the expanded chart dialog content based on the chart type
  const renderExpandedChartContent = (chartType: string) => {
    switch (chartType) {
      case 'dailyClaims':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">All-Time Daily Claims by Week</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={historicalDailyClaimData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="Mon" fill="#3b82f6" />
                <Bar dataKey="Tue" fill="#4f46e5" />
                <Bar dataKey="Wed" fill="#8b5cf6" />
                <Bar dataKey="Thu" fill="#d946ef" />
                <Bar dataKey="Fri" fill="#ec4899" />
                <Bar dataKey="Sat" fill="#f43f5e" />
                <Bar dataKey="Sun" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500">
              This chart shows the daily claims pattern across different weeks from the beginning of the project.
              You can see how daily claim patterns have evolved over time.
            </p>
          </div>
        );
        
      case 'userGrowth':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">All-Time User Growth</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalUserGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500">
              This chart shows the complete user growth trajectory since the beginning of the project.
              The steady growth indicates positive user acquisition and retention.
            </p>
          </div>
        );
        
      case 'streakDistribution':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">All-Time Streak Distribution Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalStreakDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="1 day" stroke="#0088FE" strokeWidth={2} />
                <Line type="monotone" dataKey="2-3 days" stroke="#00C49F" strokeWidth={2} />
                <Line type="monotone" dataKey="4-7 days" stroke="#FFBB28" strokeWidth={2} />
                <Line type="monotone" dataKey="1-2 weeks" stroke="#FF8042" strokeWidth={2} />
                <Line type="monotone" dataKey="2+ weeks" stroke="#A569BD" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {['1 day', '2-3 days', '4-7 days', '1-2 weeks', '2+ weeks'].map((name, index) => (
                <div key={name} className="flex items-center">
                  <div 
                    className="w-3 h-3 mr-2 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm">{name}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              This chart shows how streak distributions have changed over time. 
              Notice the decreasing trend of 1-day streaks and increasing trends for longer streaks, 
              indicating improved user retention.
            </p>
          </div>
        );
        
      case 'claimTimeDistribution':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">All-Time Claim Time Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={historicalClaimTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="00:00" fill="#f59e0b" stackId="a" />
                <Bar dataKey="03:00" fill="#d97706" stackId="a" />
                <Bar dataKey="06:00" fill="#b45309" stackId="a" />
                <Bar dataKey="09:00" fill="#92400e" stackId="a" />
                <Bar dataKey="12:00" fill="#78350f" stackId="a" />
                <Bar dataKey="15:00" fill="#92400e" stackId="a" />
                <Bar dataKey="18:00" fill="#b45309" stackId="a" />
                <Bar dataKey="21:00" fill="#d97706" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'].map((hour, index) => (
                <div key={hour} className="flex items-center">
                  <div 
                    className="w-3 h-3 mr-2 rounded-full" 
                    style={{ backgroundColor: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#92400e', '#b45309', '#d97706'][index] }}
                  ></div>
                  <span className="text-sm">{hour}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              This chart shows how claim times have been distributed throughout the day across different months.
              You can observe patterns in when users are most active, helping optimize notification timing.
            </p>
          </div>
        );
        
      default:
        return <div>No data available</div>;
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const userStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.totalClaims > 0).length,
    adminUsers: users.filter(u => u.isAdmin).length
  };

  const totalClaims = users.reduce((sum, user) => sum + user.totalClaims, 0);
  const maxStreak = users.reduce((max, user) => (user.streak > max ? user.streak : max), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center">
            <BottleCap size="sm" className="mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-bottlecap-navy">BottleCaps Admin</h1>
              <p className="text-sm text-gray-500">Admin Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Claims</p>
                  <h3 className="text-3xl font-bold">{totalClaims}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <BottleCap size="sm" className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <h3 className="text-3xl font-bold">{userStats.activeUsers}</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Max Streak</p>
                  <h3 className="text-3xl font-bold">{maxStreak}</h3>
                </div>
                <div className="p-3 bg-amber-50 rounded-full">
                  <Award className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Blacklisted</p>
                  <h3 className="text-3xl font-bold">{blacklist.length}</h3>
                </div>
                <div className="p-3 bg-red-50 rounded-full">
                  <Ban className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>User Stats</span>
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span>Claim Logs</span>
            </TabsTrigger>
            <TabsTrigger value="blacklist" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              <span>Blacklist</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span>Claim Image</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="passwordReset" className="flex items-center gap-2">
              <MailCheck className="h-4 w-4" />
              <span>Password Reset Requests</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="viewMore" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>View More</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>User Statistics</span>
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Total Claims</TableHead>
                        <TableHead>Streak</TableHead>
                        <TableHead>Last Claim</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <UserHoverCard user={user} asLink={true}>
                                {user.username}
                              </UserHoverCard>
                            </TableCell>
                            <TableCell>{user.totalClaims}</TableCell>
                            <TableCell>{user.streak}</TableCell>
                            <TableCell>{formatDate(user.lastClaim)}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/user/${user.id}`)}
                                >
                                  View
                                </Button>
                                {blacklist.includes(user.username) ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => removeFromBlacklist(user.username)}
                                  >
                                    Unblock
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => addToBlacklist(user.username)}
                                  >
                                    Block
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle>Claim Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.length > 0 ? (
                        logs.map((log, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{log.username}</TableCell>
                            <TableCell>
                              <span className={
                                log.result === "success" 
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }>
                                {log.result === "success" ? "Success" : "Already Claimed"}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(log.timestamp)}</TableCell>
                            <TableCell>{log.ip}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                            No claim logs yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blacklist">
            <Card>
              <CardHeader>
                <CardTitle>Blacklisted Users</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBlacklistSubmit} className="flex gap-2 mb-6">
                  <Input
                    placeholder="Add username to blacklist..."
                    value={blacklistInput}
                    onChange={(e) => setBlacklistInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">Add</Button>
                </form>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blacklist.length > 0 ? (
                        blacklist.map((username, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{username}</TableCell>
                            <TableCell>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeFromBlacklist(username)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                            No users blacklisted
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                    <div>
                      <h3 className="font-semibold text-amber-800">Honeypot Detection</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        A hidden button is present on the claim page that is invisible to regular users 
                        but may be activated by bots. Any activations will be logged here.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 bg-white p-3 rounded border border-amber-200 text-sm">
                    <p className="text-gray-500 italic">No honeypot activations detected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image">
            <Card>
              <CardHeader>
                <CardTitle>Claim Image Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Current Claim Image</h3>
                    <div className="border rounded-lg overflow-hidden mb-4">
                      <img 
                        src={claimImage} 
                        alt="Current claim image" 
                        className="w-full max-h-[300px] object-contain" 
                      />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      This image will be displayed to users during the claim process.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Update Image</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="imageUrl" className="text-sm font-medium">
                          Image URL
                        </label>
                        <Input
                          id="imageUrl"
                          placeholder="Enter image URL..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          Enter a full URL to an image (e.g., https://example.com/image.jpg)
                        </p>
                      </div>
                      
                      <Button 
                        onClick={updateClaimImage}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Update Image
                      </Button>
                      
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-1">Image Guidelines</h4>
                        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                          <li>Use high-quality images (recommended: 1200×800px)</li>
                          <li>Ensure the image is relevant to your brand or promotion</li>
                          <li>Use images that load quickly to avoid user frustration</li>
                          <li>Consider using product images or promotional content</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Claim Metrics / Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700 font-medium">
                  Last 7 days of analytics data. Click on any chart to view historical data.
                </p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Daily Claims Chart Card - Clickable */}
                  <Dialog open={openChartDialog === 'dailyClaims'} onOpenChange={(open) => !open && setOpenChartDialog(null)}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-all relative group">
                        <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="h-4 w-4 text-gray-500" />
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                            <CardTitle className="text-lg">Daily Claims</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={dailyClaimData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar dataKey="claims" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-xl font-semibold flex items-center">
                          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                          Daily Claims - Historical Data
                        </DialogTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2" 
                          onClick={() => setOpenChartDialog(null)}
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                      </DialogHeader>
                      {renderExpandedChartContent('dailyClaims')}
                    </DialogContent>
                  </Dialog>

                  {/* User Growth Chart Card - Clickable */}
                  <Dialog open={openChartDialog === 'userGrowth'} onOpenChange={(open) => !open && setOpenChartDialog(null)}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-all relative group">
                        <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="h-4 w-4 text-gray-500" />
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                            <CardTitle className="text-lg">User Growth</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="day" />
                              <YAxis />
                              <RechartsTooltip />
                              <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-xl font-semibold flex items-center">
                          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                          User Growth - Historical Data
                        </DialogTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2" 
                          onClick={() => setOpenChartDialog(null)}
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                      </DialogHeader>
                      {renderExpandedChartContent('userGrowth')}
                    </DialogContent>
                  </Dialog>

                  {/* Streak Distribution Chart Card - Clickable */}
                  <Dialog open={openChartDialog === 'streakDistribution'} onOpenChange={(open) => !open && setOpenChartDialog(null)}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-all relative group">
                        <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="h-4 w-4 text-gray-500" />
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <ChartPie className="h-5 w-5 text-purple-600 mr-2" />
                            <CardTitle className="text-lg">Streak Distribution</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                              <Pie
                                data={streakDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {streakDistributionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-xl font-semibold flex items-center">
                          <ChartPie className="h-5 w-5 text-purple-600 mr-2" />
                          Streak Distribution - Historical Data
                        </DialogTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2" 
                          onClick={() => setOpenChartDialog(null)}
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                      </DialogHeader>
                      {renderExpandedChartContent('streakDistribution')}
                    </DialogContent>
                  </Dialog>

                  {/* Claim Time Distribution Chart Card - Clickable */}
                  <Dialog open={openChartDialog === 'claimTimeDistribution'} onOpenChange={(open) => !open && setOpenChartDialog(null)}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-all relative group">
                        <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="h-4 w-4 text-gray-500" />
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-amber-600 mr-2" />
                            <CardTitle className="text-lg">Claim Time Distribution</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={claimTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="hour" />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar dataKey="claims" fill="#f59e0b" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-xl font-semibold flex items-center">
                          <Clock className="h-5 w-5 text-amber-600 mr-2" />
                          Claim Time Distribution - Historical Data
                        </DialogTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2" 
                          onClick={() => setOpenChartDialog(null)}
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                      </DialogHeader>
                      {renderExpandedChartContent('claimTimeDistribution')}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Additional Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                      <ShieldAlert className="w-5 h-5" />
                      Suspicious Login Attempts
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={suspiciousLoginAttempts} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip />
                        <Bar dataKey="attempts" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-red-700 mt-2">
                      Number of flagged suspicious login attempts detected each day.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-600">
                      <Users className="w-5 h-5" />
                      New User Registrations
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={newUserRegistrations} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-green-700 mt-2">
                      Monthly new user sign-ups to showcase community growth.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-amber-700">
                      <Shield className="w-5 h-5" />
                      Blacklist Trends
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={blacklistTrends} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip />
                        <Bar dataKey="blocks" fill="#d97706" />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-amber-800 mt-2">
                      Weekly counts of users added to blacklist to monitor security filters.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="passwordReset">
            <Card>
              <CardHeader>
                <CardTitle>Password Reset Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {passwordResetRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No password reset requests at this time.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {passwordResetRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{req.username}</TableCell>
                          <TableCell>{formatDate(req.requestedAt)}</TableCell>
                          <TableCell>
                            {req.approved ? (
                              <span className="text-green-600">Approved</span>
                            ) : (
                              <span className="text-amber-600">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {!req.approved && (
                              <Button 
                                size="sm" 
                                onClick={() => handleApprovePasswordReset(req.id)}
                              >
                                <MailCheck className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                    <div>
                      <h3 className="font-semibold text-amber-800">Coming Soon</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        The settings section will be available in the next update.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Claim Settings</h3>
                    <div className="opacity-60 pointer-events-none">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">Daily Reset Time</p>
                          <p className="text-sm text-gray-500">When the daily claim resets</p>
                        </div>
                        <Input 
                          type="time" 
                          value="00:00" 
                          className="w-32" 
                          disabled 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">Streak Reset</p>
                          <p className="text-sm text-gray-500">Reset streak if missed days</p>
                        </div>
                        <Input 
                          type="number" 
                          value="1" 
                          min="1"
                          className="w-32" 
                          disabled 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Security Settings</h3>
                    <div className="opacity-60 pointer-events-none">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">Enable CAPTCHA</p>
                          <p className="text-sm text-gray-500">Require CAPTCHA for claims</p>
                        </div>
                        <Button disabled>Disabled</Button>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">IP Rate Limiting</p>
                          <p className="text-sm text-gray-500">Max attempts per IP</p>
                        </div>
                        <Input 
                          type="number" 
                          value="10" 
                          min="1"
                          className="w-32" 
                          disabled 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viewMore">
            <Card>
              <CardHeader>
                <CardTitle>Additional Platform Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-semibold mb-3">Monthly Claims</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={monthlyClaimsData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="claims" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Active User Percentage</h3>
                    <div className="text-center text-4xl font-bold text-green-600">
                      {activeUserPercentage.toFixed(1)}%
                    </div>
                    <p className="text-center text-gray-600 mt-1">
                      Percentage of users active in the last claim period.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Community Engagement & Content</h3>
                    <p className="text-gray-700">
                      These additional stats highlight how engaged and active your user community is, useful for sharing positive platform growth with stakeholders.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Weekly Active Users</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={weeklyActiveUsers}
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="active" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">User Streak vs Total Claims</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <ScatterChart
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="streak" name="Streak" />
                        <YAxis type="number" dataKey="claims" name="Claims" />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="User data" data={userStreakVsClaims} fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
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
