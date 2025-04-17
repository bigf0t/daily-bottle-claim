
export interface User {
  id: string;
  username: string;
  totalClaims: number;
  streak: number;
  lastClaim: string | null;
  isAdmin: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
