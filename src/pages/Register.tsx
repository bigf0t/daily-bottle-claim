
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { registerUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BottleCap } from "@/components/BottleCap";
import { UserPlus, Camera, ImageIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert the image to a Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      // Register the user with the profile picture
      await registerUser(username, ethAddress.trim(), password, email.trim() || undefined, profilePicture || undefined);
      // Redirect to login page instead of auto-login
      setIsLoading(false);
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      console.error(err);
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
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-3">
              <Label htmlFor="profilePicture">Profile Picture (optional)</Label>
              <Avatar className="h-24 w-24 cursor-pointer hover:opacity-90 transition-opacity">
                {profilePicture ? (
                  <AvatarImage src={profilePicture} alt="Profile preview" />
                ) : (
                  <AvatarFallback className="bg-bottlecap-blue/10">
                    <ImageIcon className="h-12 w-12 text-bottlecap-blue/50" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex items-center">
                <Label
                  htmlFor="profilePicture"
                  className="flex items-center gap-2 px-4 py-2 bg-bottlecap-blue text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  {profilePicture ? "Change Picture" : "Upload Picture"}
                </Label>
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

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
              <Label htmlFor="email">Email Address (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional but recommended to receive project updates and information about upcoming events.
              </p>
            </div>

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
