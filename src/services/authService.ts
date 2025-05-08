
import { User, ClaimLog } from "@/types/auth";
import { getCurrentUTCDate } from "@/utils/authUtils";

// Focus the user list on realistic tracking by keeping only users and no extra test accounts or analytics clutter

// Default admin credentials
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "123";

// Initialize or create default users if missing
export const createLocalUsers = () => {
  const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
  let usersUpdated = false;

  // Check if admin user exists, if not add it
  if (!existingUsers.some((u: User) => u.username === ADMIN_USERNAME)) {
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

  // Check if the user has a pending password reset request
  const passwordRequests = getPasswordResetRequests();
  const pendingRequest = passwordRequests.find(
    req => req.username === username && !req.approved && req.locked
  );

  if (pendingRequest) {
    // Block login due to pending password reset
    throw new Error("Account locked pending password reset approval. Please contact an administrator.");
  }

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

    // Make sure admin exists in the users list too
    const adminExists = existingUsers.some(u => u.username === ADMIN_USERNAME);
    if (!adminExists) {
      existingUsers.push({
        ...adminUser,
        password: ADMIN_PASSWORD
      });
      localStorage.setItem("bottlecaps_users", JSON.stringify(existingUsers));
    }

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

  // Successful login - create a clean user object without password
  const { password: _, ...cleanUser } = existingUser;
  saveUserToStorage(cleanUser as User);
  return cleanUser as User;
};

// Updated registerUser to handle profile pictures and email
export const registerUser = async (
  username: string,
  ethAddress: string | undefined,
  password: string,
  email?: string,
  profilePicture?: string
): Promise<User> => {
  const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");

  if (existingUsers.find((u: User & { password?: string }) => u.username === username)) {
    throw new Error("Username already exists.");
  }

  // Create a user object with password for storage
  const userWithPassword = {
    id: Date.now().toString(),
    username,
    totalClaims: 0,
    streak: 0,
    lastClaim: null,
    isAdmin: false,
    createdAt: getCurrentUTCDate(),
    password, // Include password for login
  };

  // Add optional fields
  if (ethAddress && ethAddress.trim() !== "") {
    userWithPassword.ethAddress = ethAddress;
  }

  if (email && email.trim() !== "") {
    userWithPassword.email = email;
  }

  if (profilePicture) {
    userWithPassword.profilePicture = profilePicture;
  }

  // Store the user with password in localStorage
  existingUsers.push(userWithPassword);
  localStorage.setItem("bottlecaps_users", JSON.stringify(existingUsers));

  // Return a clean user object without password
  const { password: _, ...cleanUser } = userWithPassword;
  return cleanUser as User;
};

// Update user data including password if needed
export const updateUserData = (updatedUser: User): void => {
  // Save the clean user (without password) to the current session
  saveUserToStorage(updatedUser);

  // Update the user in the users list while preserving the password
  const existingUsers = JSON.parse(localStorage.getItem("bottlecaps_users") || "[]");
  const updatedUsers = existingUsers.map((u: User & { password?: string }) => {
    if (u.id === updatedUser.id) {
      // Preserve the password from the existing user
      return { ...u, ...updatedUser, password: u.password };
    }
    return u;
  });

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
export const logClaimAttempt = (
  username: string,
  result: string,
  timestamp: string,
  amount: number = 1
): void => {
  const existingLogs = JSON.parse(localStorage.getItem("bottlecaps_logs") || "[]");
  existingLogs.push({
    username,
    result,
    timestamp,
    ip: "127.0.0.1",
    amount: result === "success" ? amount : 0
  });
  localStorage.setItem("bottlecaps_logs", JSON.stringify(existingLogs));
};

// Store password reset requests to localStorage
export interface PasswordResetRequest {
  id: string;
  username: string;
  requestedAt: string;
  approved: boolean;
  newPassword: string;
  locked: boolean; // Flag to indicate if the account is locked pending approval
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
  const request = requests.find(r => r.id === id);

  if (!request) {
    console.error("Password reset request not found:", id);
    return;
  }

  // Mark the request as approved
  const updatedRequests = requests.map(r =>
    r.id === id ? { ...r, approved: true } : r
  );
  localStorage.setItem("bottlecaps_password_reset_requests", JSON.stringify(updatedRequests));

  // Find the user and update their password
  const users = getAllUsers();
  const userIndex = users.findIndex((u: User & { password?: string }) => u.username === request.username);

  if (userIndex === -1) {
    console.error("User not found for password reset:", request.username);
    return;
  }

  // Get the new password from the request
  const newPassword = request.newPassword;

  // Update the user's password in the users array
  users[userIndex].password = newPassword;
  localStorage.setItem("bottlecaps_users", JSON.stringify(users));

  // Also update the current user's session if they're logged in
  const currentUser = getUserFromStorage();
  if (currentUser && currentUser.username === request.username) {
    // Force logout the user if they're currently logged in
    // This is a security measure - they'll need to log in with the new password
    removeUserFromStorage();
  }

  console.log(`Password reset approved for ${request.username}. User can now log in with their new password.`);
};
