
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "@/types/auth";
import { isClaimAllowed, getCurrentUTCDate } from "@/utils/authUtils";
import { 
  getUserFromStorage, 
  createLocalUsers, 
  loginUser, 
  removeUserFromStorage,
  updateUserData as updateUser,
  getAllUsers as getUsers,
  getClaimLogs as getLogs,
  logClaimAttempt,
  addPasswordResetRequest,
  getPasswordResetRequests,
  approvePasswordResetRequest
} from "@/services/authService";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [passwordResetRequests, setPasswordResetRequests] = useState<any[]>([]);

  // Initialize on first load
  useEffect(() => {
    // initializeSupabaseTables(); // Uncomment when SQL functions are created
    
    // Use localStorage for user management now
    const loadUser = () => {
      const storedUser = getUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
      }
      
      createLocalUsers();
      
      setIsLoading(false);
    };
    
    loadUser();

    // Load password reset requests
    setPasswordResetRequests(getPasswordResetRequests());
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<void> => {
    const loggedInUser = await loginUser(username, password);
    setUser(loggedInUser);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    removeUserFromStorage();
  };

  // Update user data function
  const updateUserData = (updatedUser: User) => {
    setUser(updatedUser);
    updateUser(updatedUser);
  };

  // Claim function 
  const processClaim = () => {
    if (!user) return;
    
    const now = getCurrentUTCDate();
    const wasAllowed = isClaimAllowed(user.lastClaim);
    
    if (wasAllowed) {
      // Check if the streak should be continued or reset
      let newStreak = 1; // Default to 1 for first claim or reset streak
      
      if (user.lastClaim) {
        const lastClaimDate = new Date(user.lastClaim);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If last claim was yesterday, increment streak
        if (lastClaimDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
          newStreak = user.streak + 1;
        }
      }
      
      const updatedUser = {
        ...user,
        totalClaims: user.totalClaims + 1,
        streak: newStreak,
        lastClaim: now
      };
      
      // Log the claim attempt
      logClaimAttempt(user.username, "success", now);
      updateUserData(updatedUser);
      return "success";
    } else {
      // Log the failed claim attempt
      logClaimAttempt(user.username, "already_claimed", now);
      return "already_claimed";
    }
  };

  // Password reset request - users submit request
  const submitPasswordResetRequest = (username: string) => {
    const req = {
      id: Date.now().toString(),
      username,
      requestedAt: getCurrentUTCDate(),
      approved: false,
    };
    addPasswordResetRequest(req);
    setPasswordResetRequests((prev) => [...prev, req]);
  };

  // Admin approve password reset request
  const confirmPasswordResetRequest = (id: string) => {
    approvePasswordResetRequest(id);
    setPasswordResetRequests((prev) => prev.map(r => r.id === id ? { ...r, approved: true } : r));
  };

  // Update username only if allowed (at least 30 days since last update)
  const canUpdateUsername = () => {
    if (!user?.usernameUpdatedAt) return true; // if never updated, allowed
    const lastUpdate = new Date(user.usernameUpdatedAt);
    const now = new Date();
    // 30 days elapsed check
    return (now.getTime() - lastUpdate.getTime()) >= (30 * 24 * 60 * 60 * 1000);
  };

  // Update user account info including username and email
  const updateAccountInfo = (updatedFields: Partial<User>) => {
    if (!user) return;
    let updatedUser = {...user, ...updatedFields};
    // Update usernameUpdatedAt if username changed
    if (updatedFields.username && updatedFields.username !== user.username) {
      updatedUser.usernameUpdatedAt = getCurrentUTCDate();
    }
    updateUserData(updatedUser);
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    processClaim,
    isClaimAllowed: user ? isClaimAllowed(user.lastClaim) : false,
    getAllUsers: getUsers,
    getClaimLogs: getLogs,
    updateUserData,
    submitPasswordResetRequest,
    passwordResetRequests,
    confirmPasswordResetRequest,
    canUpdateUsername,
    updateAccountInfo,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
