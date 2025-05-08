
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClaimModal } from "@/components/ClaimModal";
import { BottleCap } from "@/components/BottleCap";
import { HoneypotButton } from "@/components/HoneypotButton";
import { CalendarDays, Star, Clock, LogOut, Award, Edit, Check, X, Camera, User, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getTimeUntilNextClaim } from "@/utils/authUtils";
import {
  requestNotificationPermission,
  hasNotificationPermission,
  scheduleNotification,
  cancelScheduledNotification,
  getNotificationPreference,
  setNotificationPreference,
  storeNotificationTimerId,
  getNotificationTimerId,
  clearNotificationTimerId
} from "@/utils/notificationUtils";

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
  const [editEthAddress, setEditEthAddress] = useState(user?.ethAddress || "");
  const [editPassword, setEditPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editProfilePicture, setEditProfilePicture] = useState<string | null>(user?.profilePicture || null);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Stats analytics state
  const [totalClaimsToday, setTotalClaimsToday] = useState(0);
  const [averageStreak, setAverageStreak] = useState(0);
  const [activeUsersToday, setActiveUsersToday] = useState(0);
  const [showAllData, setShowAllData] = useState(false);

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(getNotificationPreference());
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(hasNotificationPermission());
  const notificationTimerRef = useRef<number>(-1);

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

    // Update form fields when user changes
    if (user) {
      setEditUsername(user.username || "");
      setEditEmail(user.email || "");
      setEditEthAddress(user.ethAddress || "");
      setEditProfilePicture(user.profilePicture || null);
    }
  }, [isAuthenticated, user, navigate]);

  // Calculate user-specific analytics
  useEffect(() => {
    if (!getClaimLogs || !getAllUsers || !user) return;

    const logs = getClaimLogs();
    const users = getAllUsers();

    // Calculate user's claims today
    const todayUTCDateStr = new Date().toISOString().split("T")[0];

    // Check if user has claimed today
    const hasClaimedToday = user.lastClaim ?
      new Date(user.lastClaim).toISOString().split("T")[0] === todayUTCDateStr : false;

    // Set user's claims today (0 or 1)
    setTotalClaimsToday(hasClaimedToday ? 1 : 0);

    // Calculate user's average claims per day since account creation
    if (user.createdAt && user.totalClaims) {
      const createdDate = new Date(user.createdAt);
      const today = new Date();
      const daysSinceCreation = Math.max(1, Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)));
      const avgClaimsPerDay = parseFloat((user.totalClaims / daysSinceCreation).toFixed(1));
      setAverageStreak(avgClaimsPerDay);
    } else {
      setAverageStreak(0);
    }

    // Count active users (users who have claimed at least once)
    const activeUsers = users.filter(u => u.totalClaims > 0).length;
    setActiveUsersToday(activeUsers);

  }, [getClaimLogs, getAllUsers, user, showAllData]);

  // Handle notification permission and scheduling
  useEffect(() => {
    // Check if there's an existing timer ID in localStorage
    const existingTimerId = getNotificationTimerId();
    if (existingTimerId > 0) {
      // Clear the existing timer
      cancelScheduledNotification(existingTimerId);
      clearNotificationTimerId();
    }

    // Only schedule notifications if enabled and permission granted
    if (notificationsEnabled && notificationPermissionGranted && user?.lastClaim) {
      const timeUntilNextMs = getTimeUntilNextClaim(user.lastClaim);

      if (timeUntilNextMs > 0) {
        // Schedule notification for when the next claim is available
        const timerId = scheduleNotification(
          timeUntilNextMs,
          "BottleCap Ready to Claim!",
          {
            body: "Your next BottleCap is now available to claim. Don't break your streak!",
            icon: "/bottlecap-icon.png",
            badge: "/bottlecap-icon.png",
            requireInteraction: true,
            tag: "bottlecap-claim-reminder"
          }
        );

        // Store the timer ID
        if (timerId > 0) {
          notificationTimerRef.current = timerId;
          storeNotificationTimerId(timerId);
        }
      }
    }

    // Cleanup function
    return () => {
      if (notificationTimerRef.current > 0) {
        cancelScheduledNotification(notificationTimerRef.current);
      }
    };
  }, [user?.lastClaim, notificationsEnabled, notificationPermissionGranted]);

  // Handle toggling notifications
  const handleToggleNotifications = async () => {
    if (!notificationPermissionGranted) {
      // Request permission if not already granted
      const permissionGranted = await requestNotificationPermission();
      setNotificationPermissionGranted(permissionGranted);

      if (!permissionGranted) {
        toast.error("Notification permission denied. Please enable notifications in your browser settings.");
        return;
      }
    }

    // Toggle notification preference
    const newEnabledState = !notificationsEnabled;
    setNotificationsEnabled(newEnabledState);
    setNotificationPreference(newEnabledState);

    if (newEnabledState) {
      toast.success("Claim notifications enabled!");
    } else {
      toast.info("Claim notifications disabled");
      // Cancel any existing notification timer
      if (notificationTimerRef.current > 0) {
        cancelScheduledNotification(notificationTimerRef.current);
        clearNotificationTimerId();
        notificationTimerRef.current = -1;
      }
    }
  };

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

  // Handle profile picture change
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert the image to a Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    if (editEthAddress !== user?.ethAddress) {
      // Basic ETH address validation
      if (editEthAddress && !editEthAddress.startsWith("0x")) {
        setEditError("ETH address should start with '0x'");
        return;
      }
      updatedFields.ethAddress = editEthAddress.trim();
    }
    if (editProfilePicture !== user?.profilePicture) {
      updatedFields.profilePicture = editProfilePicture;
    }

    // Password change requires admin approval by sending a reset request
    if (editPassword) {
      submitPasswordResetRequest(user.username, editPassword);
      setEditSuccess("Password change request submitted. Your account will be locked until an admin approves the change.");
      setEditPassword("");
      setConfirmPassword("");
      // Force logout after password reset request
      setTimeout(() => {
        logout();
        navigate("/login");
        toast.info("You have been logged out. Your account is locked until the password change is approved.");
      }, 3000);
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
                <Button
                  variant="ghost"
                  className={`text-gray-600 ${notificationsEnabled ? 'text-blue-600' : ''}`}
                  onClick={handleToggleNotifications}
                >
                  <Bell className={`h-5 w-5 mr-1 ${notificationsEnabled ? 'text-blue-600 fill-blue-200' : ''}`} />
                  <span>{notificationsEnabled ? 'Notifications On' : 'Notifications Off'}</span>
                </Button>
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
                {/* Profile Picture Edit */}
                <div className="flex flex-col items-center space-y-3">
                  <Label htmlFor="profilePictureEdit">Profile Picture</Label>
                  <Avatar className="h-24 w-24 cursor-pointer hover:opacity-90 transition-opacity">
                    {editProfilePicture ? (
                      <AvatarImage src={editProfilePicture} alt="Profile preview" />
                    ) : (
                      <AvatarFallback className="bg-bottlecap-blue/10">
                        <User className="h-12 w-12 text-bottlecap-blue/50" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex items-center">
                    <Label
                      htmlFor="profilePictureEdit"
                      className="flex items-center gap-2 px-4 py-2 bg-bottlecap-blue text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      {editProfilePicture ? "Change Picture" : "Upload Picture"}
                    </Label>
                    <Input
                      id="profilePictureEdit"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                    />
                  </div>
                </div>

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
                  <Label htmlFor="ethAddress">ETH Wallet Address</Label>
                  <Input
                    id="ethAddress"
                    type="text"
                    placeholder="0x..."
                    value={editEthAddress}
                    onChange={(e) => setEditEthAddress(e.target.value)}
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
                  <Avatar className="h-16 w-16 mr-4">
                    {user.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.username} />
                    ) : (
                      <AvatarFallback className="bg-bottlecap-blue/10">
                        <User className="h-8 w-8 text-bottlecap-blue/50" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-4xl font-bold">{user.username}</div>
                </div>

                <Separator />

                <div className="flex items-center space-x-2 text-gray-600">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>Joined: {formatDate(user.createdAt) || "Today"}</span>
                </div>

                <div className="mt-2 space-y-1">
                  <p>Email: {user.email || "Not set"}</p>
                  <p>ETH Address: {user.ethAddress || "Not set"}</p>
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
                {user.streak >= 100 && (
                  <div className="mt-1 text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                    2x REWARDS ACTIVE!
                  </div>
                )}
                {user.streak >= 90 && user.streak < 100 && (
                  <div className="mt-1 text-xs text-amber-600">
                    {100 - user.streak} days to 2x rewards
                  </div>
                )}
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

        {/* Analytics card with tabs */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>My Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="week" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="week">Last 7 Days</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
              <TabsContent value="week">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold">Claims Today</h3>
                    <p className="text-2xl font-bold text-green-700">{totalClaimsToday}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h3 className="text-lg font-semibold">Day Streak</h3>
                    <p className="text-2xl font-bold text-yellow-700">{user.streak}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <h3 className="text-lg font-semibold">Avg Claims/Day</h3>
                    <p className="text-2xl font-bold text-indigo-700">{averageStreak.toFixed(1)}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="all">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold">Total Claims All Time</h3>
                    <p className="text-2xl font-bold text-green-700">
                      {user.totalClaims}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h3 className="text-lg font-semibold">Days Since Joined</h3>
                    <p className="text-2xl font-bold text-yellow-700">
                      {user.createdAt ?
                        Math.max(1, Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))) :
                        0}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <h3 className="text-lg font-semibold">All-Time Average</h3>
                    <p className="text-2xl font-bold text-indigo-700">{averageStreak.toFixed(1)}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Claim Section - Centered and Prominent */}
        <div className="flex flex-col items-center justify-center mt-6 mb-8">
          {isClaimAllowed ? (
            <div className="text-center">
              <BottleCap size="lg" animated className="mb-6 mx-auto" />
              <p className="text-center mb-6 text-xl font-medium text-bottlecap-navy">
                Your BottleCap is ready to claim!
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
                  You've already claimed recently.
                </p>
                <p className="text-sm text-bottlecap-blue mb-2">
                  Next claim available in:
                </p>
                <div className="text-2xl font-mono text-bottlecap-gold mb-4">
                  {(() => {
                    if (!user?.lastClaim) return "00:00:00";

                    const timeUntilNextMs = getTimeUntilNextClaim(user.lastClaim);
                    const hours = Math.floor(timeUntilNextMs / (1000 * 60 * 60));
                    const minutes = Math.floor((timeUntilNextMs % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeUntilNextMs % (1000 * 60)) / 1000);

                    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                  })()}
                </div>
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

        {/* Notification Settings */}
        <Card className="shadow-md mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-bottlecap-blue" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Claim Reminders</p>
                <p className="text-sm text-gray-500">Get notified when your next claim is available</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notification-toggle"
                  checked={notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                />
                <Label htmlFor="notification-toggle" className="sr-only">
                  Enable claim notifications
                </Label>
              </div>
            </div>
            {!notificationPermissionGranted && (
              <p className="text-sm text-amber-600 mt-2">
                You need to allow notifications in your browser for this feature to work.
              </p>
            )}
            {notificationsEnabled && notificationPermissionGranted && !isClaimAllowed && (
              <p className="text-sm text-green-600 mt-2">
                You'll be notified when your next claim is available.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Achievement badges */}
        {user.streak >= 100 ? (
          <div className="max-w-lg mx-auto mt-8">
            <div className="flex items-center text-yellow-600 bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200">
              <Award className="w-10 h-10 mr-4 text-yellow-500" />
              <div>
                <p className="font-semibold text-lg">LEGENDARY STREAK ACHIEVED!</p>
                <p>You've maintained a {user.streak}-day streak and now earn <span className="font-bold">DOUBLE REWARDS</span> with each claim!</p>
              </div>
            </div>
          </div>
        ) : user.streak >= 90 ? (
          <div className="max-w-lg mx-auto mt-8">
            <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg shadow-sm">
              <Award className="w-10 h-10 mr-4" />
              <div>
                <p className="font-semibold text-lg">Almost There!</p>
                <p>You've maintained a {user.streak}-day streak. Only {100 - user.streak} more days to reach 100 and earn DOUBLE rewards!</p>
              </div>
            </div>
          </div>
        ) : user.streak >= 7 ? (
          <div className="max-w-lg mx-auto mt-8">
            <div className="flex items-center text-bottlecap-gold bg-amber-50 p-4 rounded-lg shadow-sm">
              <Award className="w-10 h-10 mr-4" />
              <div>
                <p className="font-semibold text-lg">Consistent Claimer!</p>
                <p>You've maintained a {user.streak}-day streak. Keep it going! Reach 100 days to earn double rewards.</p>
              </div>
            </div>
          </div>
        ) : null}
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
