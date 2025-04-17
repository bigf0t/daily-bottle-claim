
// Get the current date in UTC
export const getCurrentUTCDate = (): string => {
  const now = new Date();
  return now.toISOString();
};

// Check if a claim is allowed (24h passed since last claim)
export const isClaimAllowed = (lastClaimDate: string | null): boolean => {
  if (!lastClaimDate) return true;
  
  const lastClaim = new Date(lastClaimDate);
  const now = new Date();
  
  // Convert to UTC date strings (YYYY-MM-DD) to check for date change
  const lastClaimUTCDay = lastClaim.toISOString().split('T')[0];
  const nowUTCDay = now.toISOString().split('T')[0];
  
  return lastClaimUTCDay !== nowUTCDay;
};
