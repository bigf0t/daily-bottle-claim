import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { AuthContextType } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { BottleCap } from "@/components/BottleCap";
import { 
  Ban, LogOut, Users, ClipboardList, Shield, BarChart3, 
  Settings, Award, AlertTriangle, Image, Upload, Calendar,
  TrendingUp, ChartPie, Clock, MailCheck
} from "lucide-react";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
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

  // New state for managing password reset request approval notes
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Demo data for analytics charts
  const [dailyClaimData, setDailyClaimData] = useState([
    { name: 'Mon', claims: 24 },
    { name: 'Tue', claims: 30 },
    { name: 'Wed', claims: 27 },
    { name: 'Thu', claims: 32 },
    { name: 'Fri', claims: 38 },
    { name: 'Sat', claims: 41 },
    { name: 'Sun', claims: 35 },
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
  
  const [streakDistributionData, setStreakDistributionData] = useState([
    { name: '1 day', value: 45 },
    { name: '2-3 days', value: 25 },
    { name: '4-7 days', value: 15 },
    { name: '1-2 weeks', value: 10 },
    { name: '2+ weeks', value: 5 },
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
  
  const navigate = useNavigate();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user && !user.isAdmin) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);
  
  // Load data on mount
  useEffect(() => {
    if (user?.isAdmin) {
      
      const allUsers = getAllUsers();
      setUsers(allUsers);
      
      const allLogs = getClaimLogs();
      setLogs(allLogs);
      
      const storedBlacklist = JSON.parse(localStorage.getItem("bottlecaps_blacklist") || "[]");
      setBlacklist(storedBlacklist);
      
      const savedClaimImage = localStorage.getItem("bottlecaps_claim_image");
      if (savedClaimImage) {
        setClaimImage(savedClaimImage);
      }
    }
  }, [user, getAllUsers, getClaimLogs]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
  
  // Add user to blacklist
  const addToBlacklist = (username: string) => {
    if(blacklist.includes(username)) return;
    const newBlacklist = [...blacklist, username];
    setBlacklist(newBlacklist);
    localStorage.setItem("bottlecaps_blacklist", JSON.stringify(newBlacklist));
  };
  
  // Remove user from blacklist
  const removeFromBlacklist = (username: string) => {
    const newBlacklist = blacklist.filter(name => name !== username);
    setBlacklist(newBlacklist);
    localStorage.setItem("bottlecaps_blacklist", JSON.stringify(newBlacklist));
  };
  
  // Handle blacklist form submission
  const handleBlacklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blacklistInput.trim()) {
      addToBlacklist(blacklistInput.trim());
      setBlacklistInput("");
    }
  };
  
  // Update claim image
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

  // Approve password reset request from admin panel
  const handleApprovePasswordReset = (id: string) => {
    if (confirmPasswordResetRequest) {
      confirmPasswordResetRequest(id);
      toast.success("Password reset request approved. Please contact the user.");
    }
  };

  // If not admin or still loading, show placeholder
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const totalClaims = users.reduce((sum, user) => sum + user.totalClaims, 0);
  const activeUsers = users.filter(user => user.lastClaim !== null).length;
  const maxStreak = users.reduce((max, user) => (user.streak > max ? user.streak : max), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Header */}
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {/* Dashboard Stats Overview */}
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
                  <h3 className="text-3xl font-bold">{activeUsers}</h3>
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
          </TabsList>
          
          {/* Users Tab */}
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
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.totalClaims}</TableCell>
                            <TableCell>{user.streak}</TableCell>
                            <TableCell>{formatDate(user.lastClaim)}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
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
          
          {/* Claims Tab */}
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
          
          {/* Blacklist Tab */}
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
          
          {/* Image Management Tab */}
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

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Claim Metrics / Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700 font-medium">
                  Analytics features will be available in an upcoming release. This section will include:
                </p>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Daily/weekly/monthly claim graphs</li>
                  <li>User growth statistics</li>
                  <li>Streak distribution data</li>
                  <li>Claim time heatmap</li>
                </ul>

                {/* Example baseline charts using demo data */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Daily Claims Chart */}
                  <Card>
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

                  {/* User Growth Chart */}
                  <Card>
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

                  {/* Streak Distribution Chart */}
                  <Card>
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

                  {/* Claim Time Heatmap */}
                  <Card>
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
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Reset Requests Tab */}
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

          {/* Settings Tab */}
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
        </Tabs>
      </main>
    </div>
  );
}
