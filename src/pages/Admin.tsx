
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { BottleCap } from "@/components/BottleCap"; 
import { Ban, LogOut, Users, ClipboardList, Shield, BarChart3, Settings, Award, AlertTriangle } from "lucide-react";

export default function Admin() {
  const { user, logout, isAuthenticated, getAllUsers, getClaimLogs } = useAuth() as any;
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [blacklistInput, setBlacklistInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
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
      // Load users
      const allUsers = getAllUsers();
      setUsers(allUsers);
      
      // Load logs
      const allLogs = getClaimLogs();
      setLogs(allLogs);
      
      // Load blacklist
      const storedBlacklist = JSON.parse(localStorage.getItem("bottlecaps_blacklist") || "[]");
      setBlacklist(storedBlacklist);
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
  
  // If not admin or still loading, show placeholder
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  
  // Calculate stats
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
          <TabsList className="grid w-full grid-cols-5 mb-8">
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
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
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
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-blue-800">Claim Metrics</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Analytics features will be available in an upcoming release. This section will include:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-sm text-blue-700 space-y-1">
                    <li>Daily/weekly/monthly claim graphs</li>
                    <li>User growth statistics</li>
                    <li>Streak distribution data</li>
                    <li>Claim time heatmap</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-medium mb-2">Coming Soon: Claim Distribution</h3>
                    <div className="h-40 flex items-center justify-center bg-gray-50 rounded">
                      <p className="text-gray-400 text-sm">Chart placeholder</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-medium mb-2">Coming Soon: User Growth</h3>
                    <div className="h-40 flex items-center justify-center bg-gray-50 rounded">
                      <p className="text-gray-400 text-sm">Chart placeholder</p>
                    </div>
                  </div>
                </div>
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
