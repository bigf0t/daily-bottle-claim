
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "@/types/auth";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123";

// Default user credentials for testing
const TEST_USER_USERNAME = "123";
const TEST_USER_PASSWORD = "123";

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

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

// Initialize Supabase tables if they don't exist
const initializeSupabaseTables = async () => {
  try {
    // Check if users table exists and create if not
    const { error: usersTableError } = await supabase.rpc('create_users_table_if_not_exists');
    if (usersTableError) console.error('Error creating users table:', usersTableError);
    
    // Check if logs table exists and create if not
    const { error: logsTableError } = await supabase.rpc('create_logs_table_if_not_exists');
    if (logsTableError) console.error('Error creating logs table:', logsTableError);
    
    // Create initial admin and test user if not exists
    await createInitialUsers();
  } catch (error) {
    console.error('Error initializing Supabase tables:', error);
  }
};

// Create initial admin and test user accounts
const createInitialUsers = async () => {
  // Check if admin exists
  const { data: adminExists } = await supabase
    .from('users')
    .select('id')
    .eq('username', ADMIN_USERNAME)
    .single();

  // Create admin if not exists
  if (!adminExists) {
    await supabase.from('users').insert({
      username: ADMIN_USERNAME,
      password_hash: ADMIN_PASSWORD, // In production, use proper hashing
      total_claims: 0,
      streak: 0,
      last_claim: null,
      is_admin: true,
      created_at: getCurrentUTCDate()
    });
  }
  
  // Check if test user exists
  const { data: testUserExists } = await supabase
    .from('users')
    .select('id')
    .eq('username', TEST_USER_USERNAME)
    .single();

  // Create test user if not exists
  if (!testUserExists) {
    await supabase.from('users').insert({
      username: TEST_USER_USERNAME,
      password_hash: TEST_USER_PASSWORD, // In production, use proper hashing
      total_claims: 0,
      streak: 0,
      last_claim: null,
      is_admin: false,
      created_at: getCurrentUTCDate()
    });
  }
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Supabase tables on first load
  useEffect(() => {
    // initializeSupabaseTables(); // Uncomment when SQL functions are created
    
    // For now, we'll use localStorage until SQL functions are set up
    const loadUser = () => {
      const storedUser = localStorage.getItem("bottlecaps_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      // Ensure the admin and test user accounts exist in localStorage
      createLocalUsers();
      
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  // Create local user storage (will be replaced by Supabase)
  const createLocalUsers = () => {
    const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
    let usersUpdated = false;
    
    // Check for admin account
    const adminExists = existingUsers.some((u: User) => u.username === ADMIN_USERNAME);
    if (!adminExists) {
      existingUsers.push({
        id: "admin-id",
        username: ADMIN_USERNAME,
        totalClaims: 0,
        streak: 0,
        lastClaim: null,
        isAdmin: true,
        createdAt: getCurrentUTCDate()
      });
      usersUpdated = true;
    }
    
    // Check for test user account
    const testUserExists = existingUsers.some((u: User) => u.username === TEST_USER_USERNAME);
    if (!testUserExists) {
      existingUsers.push({
        id: Date.now().toString(),
        username: TEST_USER_USERNAME,
        totalClaims: 0,
        streak: 0,
        lastClaim: null,
        isAdmin: false,
        createdAt: getCurrentUTCDate()
      });
      usersUpdated = true;
    }
    
    // Update localStorage if changes were made
    if (usersUpdated) {
      localStorage.setItem("bottlecaps_users", JSON.stringify(existingUsers));
    }
  };

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
        isAdmin: true,
        createdAt: getCurrentUTCDate()
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
        isAdmin: false,
        createdAt: getCurrentUTCDate()
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
