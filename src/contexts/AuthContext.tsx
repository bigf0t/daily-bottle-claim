
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "@/types/auth";

// Default admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get the current date in UTC
const getCurrentUTCDate = (): string => {
  const now = new Date();
  return now.toISOString();
};

// Check if a claim is allowed (24h passed since last claim)
export const isClaimAllowed = (lastClaimDate: string | null): boolean => {
  if (!lastClaimDate) return true;
  
  const lastClaim = new Date(lastClaimDate);
  const now = new Date();
  
  // Convert to UTC date strings (YYYY-MM-DD) to check for date change
  const lastClaimUTCDay = lastClaim.toISOString().split('T')[0];
  const nowUTCDay = now.toISOString().split('T')[0];
  
  return lastClaimUTCDay !== nowUTCDay;
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("bottlecaps_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<void> => {
    // For demo purposes, we're using localStorage
    // In a real app, this would be an API call
    
    // Check for admin login
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: "admin-id",
        username: ADMIN_USERNAME,
        totalClaims: 0,
        streak: 0,
        lastClaim: null,
        isAdmin: true
      };
      
      setUser(adminUser);
      localStorage.setItem("bottlecaps_user", JSON.stringify(adminUser));
      return;
    }
    
    // Check if user exists
    const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
    const existingUser = existingUsers.find((u: User) => u.username === username);
    
    if (existingUser) {
      // Simple password check - in a real app, this would use proper hashing
      // We're not checking passwords for this demo
      setUser(existingUser);
      localStorage.setItem("bottlecaps_user", JSON.stringify(existingUser));
    } else {
      // Create new user if it doesn't exist
      const newUser: User = {
        id: Date.now().toString(),
        username,
        totalClaims: 0,
        streak: 0,
        lastClaim: null,
        isAdmin: false
      };
      
      // Add user to users list
      existingUsers.push(newUser);
      localStorage.setItem("bottlecaps_users", JSON.stringify(existingUsers));
      
      // Set as current user
      setUser(newUser);
      localStorage.setItem("bottlecaps_user", JSON.stringify(newUser));
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("bottlecaps_user");
  };

  // Update user data
  const updateUserData = (updatedUser: User) => {
    // Update in state
    setUser(updatedUser);
    
    // Update in localStorage (current user)
    localStorage.setItem("bottlecaps_user", JSON.stringify(updatedUser));
    
    // Update in users list
    const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
    const updatedUsers = existingUsers.map((u: User) => 
      u.id === updatedUser.id ? updatedUser : u
    );
    localStorage.setItem("bottlecaps_users", JSON.stringify(updatedUsers));
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

  // Log claim attempts for admin to review
  const logClaimAttempt = (username: string, result: string, timestamp: string) => {
    const existingLogs = JSON.parse(localStorage.getItem("bottlecaps_logs") || "[]");
    existingLogs.push({
      username,
      result,
      timestamp,
      ip: "127.0.0.1" // Placeholder, would be actual IP in real app
    });
    localStorage.setItem("bottlecaps_logs", JSON.stringify(existingLogs));
  };

  // Get all users (for admin)
  const getAllUsers = (): User[] => {
    return JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
  };

  // Get all claim logs (for admin)
  const getClaimLogs = () => {
    return JSON.parse(localStorage.getItem("bottlecaps_logs") || "[]");
  };

  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    processClaim,
    isClaimAllowed: user ? isClaimAllowed(user.lastClaim) : false,
    getAllUsers,
    getClaimLogs,
    updateUserData
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
