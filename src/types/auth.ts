
export interface User {
  id: string;
  username: string;
  totalClaims: number;
  streak: number;
  lastClaim: string | null;
  isAdmin: boolean;
  createdAt?: string;
  usernameUpdatedAt?: string;
  ethAddress?: string;
  email?: string;
  profilePicture?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  processClaim?: () => Promise<"success" | "already_claimed" | undefined>;
  isClaimAllowed?: boolean;
  getAllUsers?: () => Promise<User[]>;
  getClaimLogs?: () => Promise<any[]>;
  updateUserData?: (user: User) => Promise<void>;
  register?: (
    username: string, 
    email: string, 
    password: string,
    ethAddress?: string,
    profilePicture?: string
  ) => Promise<User>;
  
  passwordResetRequests?: any[]; 
  confirmPasswordResetRequest?: (id: string) => void;
  submitPasswordResetRequest?: (username: string) => void;

  canUpdateUsername?: () => boolean;
  updateAccountInfo?: (updatedFields: Partial<User>) => Promise<void>;
}

export interface ClaimLog {
  username: string;
  result: string;
  timestamp: string;
  ip: string;
}
