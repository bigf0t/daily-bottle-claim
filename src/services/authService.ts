
import { User, ClaimLog } from "@/types/auth";
import { getCurrentUTCDate } from "@/utils/authUtils";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default admin credentials
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "123";

// Default user credentials for testing
export const TEST_USER_USERNAME = "123";
export const TEST_USER_PASSWORD = "123";

// Initialize Supabase client
// Adding fallback values to prevent initialization errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Initialize Supabase tables if they don't exist
export const initializeSupabaseTables = async () => {
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
export const createInitialUsers = async () => {
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

// Create local user storage functions
export const createLocalUsers = () => {
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

// Get user from localStorage
export const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem("bottlecaps_user");
  return storedUser ? JSON.parse(storedUser) : null;
};

// Save user to localStorage
export const saveUserToStorage = (user: User): void => {
  localStorage.setItem("bottlecaps_user", JSON.stringify(user));
};

// Remove user from localStorage
export const removeUserFromStorage = (): void => {
  localStorage.removeItem("bottlecaps_user");
};

// Login user
export const loginUser = async (username: string, password: string): Promise<User> => {
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
    
    saveUserToStorage(adminUser);
    return adminUser;
  }
  
  // Check if user exists
  const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
  const existingUser = existingUsers.find((u: User) => u.username === username);
  
  if (existingUser) {
    // Simple password check - in a real app, this would use proper hashing
    // We're not checking passwords for this demo
    saveUserToStorage(existingUser);
    return existingUser;
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
    saveUserToStorage(newUser);
    return newUser;
  }
};

// Update user data
export const updateUserData = (updatedUser: User): void => {
  // Update in localStorage (current user)
  saveUserToStorage(updatedUser);
  
  // Update in users list
  const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
  const updatedUsers = existingUsers.map((u: User) => 
    u.id === updatedUser.id ? updatedUser : u
  );
  localStorage.setItem("bottlecaps_users", JSON.stringify(updatedUsers));
};

// Get all users
export const getAllUsers = (): User[] => {
  return JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
};

// Get all claim logs
export const getClaimLogs = (): ClaimLog[] => {
  return JSON.parse(localStorage.getItem("bottlecaps_logs") || "[]");
};

// Log claim attempt
export const logClaimAttempt = (username: string, result: string, timestamp: string): void => {
  const existingLogs = JSON.parse(localStorage.getItem("bottlecaps_logs") || "[]");
  existingLogs.push({
    username,
    result,
    timestamp,
    ip: "127.0.0.1" // Placeholder, would be actual IP in real app
  });
  localStorage.setItem("bottlecaps_logs", JSON.stringify(existingLogs));
};
