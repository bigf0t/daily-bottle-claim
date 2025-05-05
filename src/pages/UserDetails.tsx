
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { User } from "@/types/auth";

// Sample data for charts
const initialDailyClaimData = [
  { day: "Mon", claims: 1 },
  { day: "Tue", claims: 0 },
  { day: "Wed", claims: 2 },
  { day: "Thu", claims: 1 },
  { day: "Fri", claims: 0 },
  { day: "Sat", claims: 0 },
  { day: "Sun", claims: 1 }
];

const initialMonthlyClaimsData = [
  { month: "Jan", claims: 4 },
  { month: "Feb", claims: 8 },
  { month: "Mar", claims: 12 },
  { month: "Apr", claims: 6 },
  { month: "May", claims: 10 },
  { month: "Jun", claims: 5 }
];

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user: currentUser, getAllUsers } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyClaimData, setDailyClaimData] = useState(initialDailyClaimData);
  const [monthlyClaimsData, setMonthlyClaimsData] = useState(initialMonthlyClaimsData);

  // Update only the part that needs fixing in the useEffect
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (currentUser && !currentUser.isAdmin) {
      navigate("/dashboard");
      return;
    }

    const loadUser = async () => {
      setIsLoading(true);
      
      try {
        if (getAllUsers) {
          const allUsers = await getAllUsers();
          const foundUser = allUsers.find(u => u.id === id);
          
          if (foundUser) {
            setUser(foundUser);
            
            // In a real application, you would fetch user-specific analytics here
            // For now we'll just update the dummy data to somewhat match the user
            
            setDailyClaimData(prevData => prevData.map(item => ({
              ...item,
              claims: Math.floor(Math.random() * 3)
            })));
            
            setMonthlyClaimsData(prevData => prevData.map(item => ({
              ...item,
              claims: Math.floor(Math.random() * (foundUser.totalClaims || 10) / 2) + 1
            })));
          } else {
            toast.error("User not found");
            navigate("/admin");
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        toast.error("Failed to load user data");
        navigate("/admin");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, [id, isAuthenticated, currentUser, navigate, getAllUsers]);

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading user details...</div>;
  }

  if (!user) {
    return <div className="container mx-auto p-6">User not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Details: {user.username}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Username:</span> {user.username}</p>
            <p><span className="font-medium">Total Claims:</span> {user.totalClaims}</p>
            <p><span className="font-medium">Current Streak:</span> {user.streak}</p>
            <p><span className="font-medium">Last Claim:</span> {user.lastClaim 
              ? new Date(user.lastClaim).toLocaleDateString() 
              : 'Never'}</p>
            <p><span className="font-medium">ETH Address:</span> {user.ethAddress || 'Not set'}</p>
            <p><span className="font-medium">Email:</span> {user.email || 'Not set'}</p>
            <p><span className="font-medium">Created At:</span> {user.createdAt 
              ? new Date(user.createdAt).toLocaleDateString() 
              : 'Unknown'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Activity</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Daily Claims This Week</h3>
              <div className="h-40 w-full">
                {/* Simple visualization of daily claims */}
                <div className="flex h-32 items-end space-x-2">
                  {dailyClaimData.map((day, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-blue-500 w-full" 
                        style={{ height: `${day.claims * 30}px` }}
                      ></div>
                      <span className="text-xs mt-1">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Monthly Claims</h3>
              <div className="h-40 w-full">
                {/* Simple visualization of monthly claims */}
                <div className="flex h-32 items-end space-x-1">
                  {monthlyClaimsData.map((month, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-green-500 w-full" 
                        style={{ height: `${month.claims * 4}px` }}
                      ></div>
                      <span className="text-xs mt-1">{month.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => navigate('/admin')}
      >
        Back to Admin
      </button>
    </div>
  );
};

export default UserDetails;
