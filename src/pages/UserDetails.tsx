
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
