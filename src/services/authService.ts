
import { User, ClaimLog } from "@/types/auth";
import { getCurrentUTCDate } from "@/utils/authUtils";

// Removed Supabase initialize and stuff to focus on localStorage for strict login/registration

// Default admin credentials
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "123";

// Initialize or create default users if missing
export const createLocalUsers = () => {
  const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
  let usersUpdated = false;
  
  const adminExists = existingUsers.some((u: User) => u.username === ADMIN_USERNAME);
  if (!adminExists) {
    existingUsers.push({
      id: "admin-id",
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD, // plain for demo; normally hash
      totalClaims: 0,
      streak: 0,
      lastClaim: null,
      isAdmin: true,
      createdAt: getCurrentUTCDate()
    });
    usersUpdated = true;
  }
  
  // No more test user by default. Removed random test user.
  
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

// Login user with strict validation: users must exist and password match
export const loginUser = async (username: string, password: string): Promise<User> => {
  const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");

  // Check admin login first
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
  
  // Find existing user by username
  const existingUser = existingUsers.find((u: User & { password?: string }) => u.username === username);
  
  if (!existingUser) {
    throw new Error("No such username or invalid password.");
  }
  
  // Check password matches stored password property (if missing, treat as invalid)
  if (!(existingUser as any).password || (existingUser as any).password !== password) {
    throw new Error("No such username or invalid password.");
  }
  
  // Successful login
  saveUserToStorage(existingUser);
  return existingUser;
};

// Register user: create new user if it doesn't exist, else throw error
export const registerUser = async (username: string, ethAddress: string, password: string): Promise<User> => {
  const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");

  if (existingUsers.find((u: User & { password?: string }) => u.username === username)) {
    throw new Error("Username already exists.");
  }
  
  const newUser: User & { password: string; ethAddress: string } = {
    id: Date.now().toString(),
    username,
    totalClaims: 0,
    streak: 0,
    lastClaim: null,
    isAdmin: false,
    createdAt: getCurrentUTCDate(),
    password,
    ethAddress
  };
  
  existingUsers.push(newUser);
  localStorage.setItem("bottlecaps_users", JSON.stringify(existingUsers));
  saveUserToStorage(newUser);
  return newUser;
};

// Update user data including password if needed
export const updateUserData = (updatedUser: User): void => {
  saveUserToStorage(updatedUser);

  const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
  const updatedUsers = existingUsers.map((u: User & { password?: string }) =>
    u.id === updatedUser.id ? { ...u, ...updatedUser } : u
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
    ip: "127.0.0.1"
  });
  localStorage.setItem("bottlecaps_logs", JSON.stringify(existingLogs));
};

// Store password reset requests to localStorage
export interface PasswordResetRequest {
  id: string;
  username: string;
  requestedAt: string;
  approved: boolean;
}

export const getPasswordResetRequests = (): PasswordResetRequest[] => {
  return JSON.parse(localStorage.getItem("bottlecaps_password_reset_requests") || "[]");
};

export const addPasswordResetRequest = (request: PasswordResetRequest): void => {
  const existing = getPasswordResetRequests();
  existing.push(request);
  localStorage.setItem("bottlecaps_password_reset_requests", JSON.stringify(existing));
};

export const approvePasswordResetRequest = (id: string): void => {
  const requests = getPasswordResetRequests();
  const updated = requests.map(r =>
    r.id === id ? { ...r, approved: true } : r
  );
  localStorage.setItem("bottlecaps_password_reset_requests", JSON.stringify(updated));
};

