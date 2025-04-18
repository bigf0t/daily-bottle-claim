
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BottleCap } from "@/components/BottleCap";
import { UserPlus } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { login } = useAuth() as any;
  
  const isValidEthAddress = (address: string) => {
    // Simple check: length 42, starts with "0x" and hex chars
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    
    if (!isValidEthAddress(ethAddress.trim())) {
      setError("A valid Base Chain ETH address is required");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      // Here we call login because actual user creation will be handled in loginUser service adjusted for strict login
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="mb-8 flex flex-col items-center">
        <BottleCap size="lg" animated className="mb-4" />
        <h1 className="text-4xl font-bold text-bottlecap-navy mb-2">BottleCaps</h1>
        <p className="text-bottlecap-blue text-xl">Daily Claim Platform</p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Sign up to claim your daily BottleCap tokens.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ethAddress">Base Chain ETH Address</Label>
              <Input
                id="ethAddress"
                type="text"
                placeholder="Enter your Base Chain ETH address"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your Base Chain ETH address is required for account verification.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For demo purposes, any password will work.
              </p>
            </div>
            
            {error && (
              <div className="text-sm font-medium text-destructive">{error}</div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-bottlecap-blue hover:bg-blue-600"
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            
            <div className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-bottlecap-blue font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

