
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
  logClaimAttempt
} from "@/services/authService";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize on first load
  useEffect(() => {
    // initializeSupabaseTables(); // Uncomment when SQL functions are created
    
    // For now, we'll use localStorage until SQL functions are set up
    const loadUser = () => {
      const storedUser = getUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
      }
      
      // Ensure the admin and test user accounts exist in localStorage
      createLocalUsers();
      
      setIsLoading(false);
    };
    
    loadUser();
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

  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    processClaim,
    isClaimAllowed: user ? isClaimAllowed(user.lastClaim) : false,
    getAllUsers: getUsers,
    getClaimLogs: getLogs,
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
