
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BottleCap } from "@/components/BottleCap";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { login } = useAuth() as any;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please try again.");
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
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your username to claim your daily BottleCap token.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password (any password for demo)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For demo purposes, any password will work.
                Admin login: username "admin" / password "123"
              </p>
            </div>
            
            {error && (
              <div className="text-sm font-medium text-destructive">{error}</div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-bottlecap-blue hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <p className="mt-8 text-center text-sm text-gray-500">
        Simply enter a username to create an account or log in.<br />
        For the admin panel, use username <span className="font-semibold">admin</span> and password <span className="font-semibold">123</span>.
      </p>
    </div>
  );
}
