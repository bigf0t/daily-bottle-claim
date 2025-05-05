
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "@/types/auth";
import { isClaimAllowed, getCurrentUTCDate } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [passwordResetRequests, setPasswordResetRequests] = useState<any[]>([]);

  // Initialize on first load
  useEffect(() => {
    // Check for existing session and set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setUser(null);
        }
      }
    );
    
    // Check for existing session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserData(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initSession();
    
    // Cleanup subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user data from the database
  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
        return;
      }

      setUser(data);
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<void> => {
    try {
      // First find the user by username to get their email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();

      if (userError || !userData?.email) {
        throw new Error("No such username or invalid password.");
      }

      // Then attempt to sign in with email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      });

      if (error) {
        throw new Error("Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      throw new Error("No such username or invalid password.");
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Update user data function
  const updateUserData = async (updatedUser: User) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update(updatedUser)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update user data");
    }
  };

  // Claim function 
  const processClaim = async () => {
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
      
      try {
        // Update the user in the database
        const { error: updateError } = await supabase
          .from('users')
          .update({
            totalClaims: updatedUser.totalClaims,
            streak: updatedUser.streak,
            lastClaim: updatedUser.lastClaim
          })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
        
        // Log the claim attempt
        const { error: logError } = await supabase
          .from('claim_logs')
          .insert({
            user_id: user.id,
            username: user.username,
            result: 'success',
            timestamp: now
          });
        
        if (logError) throw logError;
        
        setUser(updatedUser);
        return "success";
      } catch (error) {
        console.error("Error processing claim:", error);
        toast.error("Failed to process claim");
        return;
      }
    } else {
      try {
        // Log the failed claim attempt
        await supabase
          .from('claim_logs')
          .insert({
            user_id: user.id,
            username: user.username,
            result: 'already_claimed',
            timestamp: now
          });
      } catch (error) {
        console.error("Error logging failed claim:", error);
      }
      
      return "already_claimed";
    }
  };

  // Register new user
  const register = async (
    username: string,
    email: string,
    password: string,
    ethAddress?: string,
    profilePicture?: string
  ): Promise<User> => {
    try {
      // First check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error("Username already exists.");
      }

      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Failed to create user account.");
      }

      // Create user profile in our users table
      const newUser = {
        id: authData.user.id,
        username,
        email,
        password_hash: "hashed", // We don't actually store the password, auth handles that
        eth_address: ethAddress || null,
        profile_picture: profilePicture || null,
        total_claims: 0,
        streak: 0,
        last_claim: null,
        is_admin: false,
        created_at: getCurrentUTCDate()
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert(newUser);

      if (insertError) {
        // If creating the profile fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw insertError;
      }

      // Fetch the complete user data to return
      const { data: createdUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (fetchError) throw fetchError;

      return createdUser as User;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  };

  // Get all users (admin only)
  const getAllUsers = async (): Promise<User[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      return [];
    }
  };

  // Get all claim logs (admin only)
  const getClaimLogs = async (): Promise<any[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('claim_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error fetching claim logs:", error);
      toast.error("Failed to fetch claim logs");
      return [];
    }
  };

  // Update username only if allowed (at least 30 days since last update)
  const canUpdateUsername = (): boolean => {
    if (!user?.usernameUpdatedAt) return true; // if never updated, allowed
    const lastUpdate = new Date(user.usernameUpdatedAt);
    const now = new Date();
    // 30 days elapsed check
    return (now.getTime() - lastUpdate.getTime()) >= (30 * 24 * 60 * 60 * 1000);
  };

  // Update user account info including username and email
  const updateAccountInfo = async (updatedFields: Partial<User>) => {
    if (!user) return;
    
    try {
      let updates: any = { ...updatedFields };
      
      // Update usernameUpdatedAt if username changed
      if (updatedFields.username && updatedFields.username !== user.username) {
        updates.usernameUpdatedAt = getCurrentUTCDate();
      }
      
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUser({ ...user, ...updates });
      toast.success("Account information updated successfully");
    } catch (error) {
      console.error("Error updating account info:", error);
      toast.error("Failed to update account information");
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    processClaim,
    isClaimAllowed: user ? isClaimAllowed(user.lastClaim) : false,
    getAllUsers,
    getClaimLogs,
    updateUserData,
    register,
    passwordResetRequests,
    confirmPasswordResetRequest: (id: string) => {}, // Placeholder for now
    submitPasswordResetRequest: (username: string) => {}, // Placeholder for now
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
