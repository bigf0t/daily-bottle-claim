
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClaimModal } from "@/components/ClaimModal";
import { BottleCap } from "@/components/BottleCap";
import { HoneypotButton } from "@/components/HoneypotButton";
import { CalendarDays, Star, Clock, LogOut, Award, Edit, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const { 
    user, logout, isAuthenticated, isClaimAllowed,
    canUpdateUsername, updateAccountInfo,
    submitPasswordResetRequest,
    getAllUsers,
    getClaimLogs,
  } = useAuth() as any;
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const navigate = useNavigate();

  // Edit account UI state
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editPassword, setEditPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Stats analytics state
  const [totalClaimsToday, setTotalClaimsToday] = useState(0);
  const [averageStreak, setAverageStreak] = useState(0);
  const [activeUsersToday, setActiveUsersToday] = useState(0);

  // Redirect to login if not authenticated or redirect admin to admin page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.isAdmin) {
      navigate("/admin");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Update analytics on load and when claim logs or users change
  useEffect(() => {
    if (!getClaimLogs || !getAllUsers) return;

    const logs = getClaimLogs();
    const users = getAllUsers();

    // Reset analytics counters
    let claimsToday = 0;
    let streaksSum = 0;
    let activeUsersSet = new Set<string>();

    const todayUTCDateStr = new Date().toISOString().split("T")[0];

    logs.forEach((log: any) => {
      if (log.result === "success") {
        const logDate = log.timestamp.split("T")[0];
        if (logDate === todayUTCDateStr) {
          claimsToday++;
          activeUsersSet.add(log.username);
        }
      }
    });

    users.forEach((u: any) => {
      streaksSum += u.streak || 0;
    });

    setTotalClaimsToday(claimsToday);
    setActiveUsersToday(activeUsersSet.size);
    setAverageStreak(users.length ? (streaksSum / users.length) : 0);
  }, [getClaimLogs, getAllUsers]);

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

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Handle save edit account info
  const handleSave = () => {
    setEditError("");
    setEditSuccess("");

    // Validate username update if changed
    if (editUsername !== user?.username) {
      if (!canUpdateUsername()) {
        setEditError("Username can only be changed once every 30 days.");
        return;
      }
      if (!editUsername.trim()) {
        setEditError("Username cannot be empty.");
        return;
      }
    }

    // Validate email format if changed
    if (editEmail.trim() && editEmail !== user?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editEmail.trim())) {
        setEditError("Invalid email address.");
        return;
      }
    }

    // Validate password change confirmation
    if (editPassword || confirmPassword) {
      if (editPassword !== confirmPassword) {
        setEditError("Passwords do not match.");
        return;
      }
      if (editPassword.length < 4) {
        setEditError("Password must be at least 4 characters.");
        return;
      }
    }

    // Prepare update payload
    const updatedFields: any = {};
    if (editUsername !== user?.username) {
      updatedFields.username = editUsername.trim();
    }
    if (editEmail !== user?.email) {
      updatedFields.email = editEmail.trim();
    }

    // Password change requires admin approval by sending a reset request (simulate)
    if (editPassword) {
      submitPasswordResetRequest(user.username);
      setEditSuccess("Password change request submitted, wait for admin confirmation.");
      setEditPassword("");
      setConfirmPassword("");
    }

    if (Object.keys(updatedFields).length > 0) {
      updateAccountInfo(updatedFields);
      setEditSuccess("Account info updated successfully.");
    }

    setEditing(false);
  };

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
            {editing ? (
              <>
                <Button variant="ghost" onClick={() => setEditing(false)}><X className="w-5 h-5" /></Button>
                <Button variant="default" onClick={handleSave}><Check className="w-5 h-5" /></Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-600" onClick={() => setEditing(true)}>
                  <Edit className="h-5 w-5 mr-1" />
                  <span>Edit My Account</span>
                </Button>
                <Button variant="ghost" className="text-gray-600" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 mr-1" />
                  <span>Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content - User profile and stats */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-8">
        {/* User info card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username">Username (once per 30 days)</Label>
                  <Input
                    id="username"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    disabled={!canUpdateUsername()}
                    className={!canUpdateUsername() ? "opacity-50 cursor-not-allowed" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Change Password (admin approval required)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="New password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {editError && (
                  <p className="text-destructive font-semibold">{editError}</p>
                )}
                {editSuccess && (
                  <p className="text-green-600 font-semibold">{editSuccess}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center">
                  <div className="text-4xl font-bold mr-2">{user.username}</div>
                </div>

                <Separator />

                <div className="flex items-center space-x-2 text-gray-600">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>Joined: {formatDate(user.createdAt) || "Today"}</span>
                </div>

                <div className="mt-2">
                  <p>Email: {user.email || "Not set"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>User Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Total Claims by current user */}
              <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
                <BottleCap size="sm" />
                <div className="mt-2 text-2xl font-bold">{user.totalClaims}</div>
                <div className="text-sm text-gray-500">My Total Claimed</div>
              </div>

              {/* Current streak */}
              <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg">
                <Star className="w-10 h-10 text-bottlecap-gold" />
                <div className="mt-2 text-2xl font-bold">{user.streak}</div>
                <div className="text-sm text-gray-500">My Day Streak</div>
              </div>

              {/* Last claim date */}
              <div className="col-span-2 flex flex-col p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-500" />
                  <div className="text-sm text-gray-500">My Last Claim:</div>
                </div>
                <div className="mt-1 text-lg font-medium">{formatDate(user.lastClaim)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New analytics card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Community Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold">Total Claims Today</h3>
                <p className="text-2xl font-bold text-green-700">{totalClaimsToday}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-semibold">Active Users Today</h3>
                <p className="text-2xl font-bold text-yellow-700">{activeUsersToday}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <h3 className="text-lg font-semibold">Average Streak</h3>
                <p className="text-2xl font-bold text-indigo-700">{averageStreak.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claim Section - Centered and Prominent */}
        <div className="flex flex-col items-center justify-center mt-6 mb-12">
          {isClaimAllowed ? (
            <div className="text-center">
              <BottleCap size="lg" animated className="mb-6 mx-auto" />
              <p className="text-center mb-6 text-xl font-medium text-bottlecap-navy">
                Your daily BottleCap is ready to claim!
              </p>
              <Button
                size="lg"
                className="w-64 h-16 text-xl bg-bottlecap-blue hover:bg-blue-600 shadow-lg transition-all hover:scale-105"
                onClick={() => setIsClaimModalOpen(true)}
              >
                Claim Now
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <BottleCap size="md" color="silver" className="mb-6 mx-auto opacity-60" />
              <div className="text-center mb-6">
                <p className="text-gray-500 mb-2 text-xl">
                  You've already claimed today.
                </p>
                <p className="text-sm text-bottlecap-blue">
                  Come back tomorrow for your next BottleCap!
                </p>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-64 h-16 text-xl"
                disabled
              >
                Already Claimed
              </Button>
            </div>
          )}
        </div>

        {/* Achievement badge - Optional */}
        {user.streak >= 7 && (
          <div className="max-w-lg mx-auto mt-8">
            <div className="flex items-center text-bottlecap-gold bg-amber-50 p-4 rounded-lg shadow-sm">
              <Award className="w-10 h-10 mr-4" />
              <div>
                <p className="font-semibold text-lg">Consistent Claimer!</p>
                <p>You've maintained a {user.streak}-day streak. Keep it going!</p>
              </div>
            </div>
          </div>
        )}
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

