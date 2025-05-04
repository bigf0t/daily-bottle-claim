export interface User {
  id: string;
  username: string;
  totalClaims: number;
  streak: number;
  lastClaim: string | null;
  isAdmin: boolean;
  createdAt?: string;
  usernameUpdatedAt?: string; // New field to track when username last changed
  ethAddress?: string;
  email?: string;
  profilePicture?: string; // New field for profile picture URL or data
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  processClaim?: () => "success" | "already_claimed" | undefined;
  isClaimAllowed?: boolean;
  getAllUsers?: () => User[];
  getClaimLogs?: () => any[];
  updateUserData?: (user: User) => void;

  passwordResetRequests?: any[]; 
  confirmPasswordResetRequest?: (id: string) => void;
  submitPasswordResetRequest?: (username: string) => void;

  canUpdateUsername?: () => boolean;
  updateAccountInfo?: (updatedFields: Partial<User>) => void;
}

export interface ClaimLog {
  username: string;
  result: string;
  timestamp: string;
  ip: string;
}
