
export interface User {
  id: string;
  username: string;
  totalClaims: number;
  streak: number;
  lastClaim: string | null;
  isAdmin: boolean;
  createdAt?: string;
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
}
