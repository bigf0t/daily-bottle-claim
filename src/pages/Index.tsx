import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth() as any;
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard, others to login
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // This is just a loading screen, won't be visible for long
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-bottlecap-navy">BottleCaps</h1>
        <p className="text-xl text-bottlecap-blue">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
