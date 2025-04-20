import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { registerUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BottleCap } from "@/components/BottleCap";
import { UserPlus, HelpCircle } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth() as any;

  const isValidEthAddress = (address: string) => {
    if (!address.trim()) {
      return true; // optional ETH address
    }
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
      // Register the user first
      await registerUser(username, ethAddress.trim(), password);
      // Then login
      await login(username, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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

            <div className="space-y-2 flex items-center">
              <Label htmlFor="email">Email Address (optional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Email info"
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bottlecap-blue rounded"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs whitespace-normal break-words">
                  This email address is optional but recommended to receive updates and information about the project and upcoming events.
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="space-y-2">
              <Label htmlFor="ethAddress">Base Chain ETH Address (optional)</Label>
              <Input
                id="ethAddress"
                type="text"
                placeholder="Enter your Base Chain ETH address (optional)"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your Base Chain ETH address is optional and can be added later in your profile.
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
