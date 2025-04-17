
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { BottleCap } from "@/components/BottleCap"; 
import { Ban, LogOut, Users, ClipboardList, Shield } from "lucide-react";

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
              variant="outline" 
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            
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
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-3 mb-8">
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
                          <TableCell colSpan={5} className="text-center py-4 text-gray-500">
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
        </Tabs>
      </main>
    </div>
  );
}
