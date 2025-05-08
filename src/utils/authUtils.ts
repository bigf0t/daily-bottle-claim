
// Get the current date in UTC
export const getCurrentUTCDate = (): string => {
  const now = new Date();
  return now.toISOString();
};

// Check if a claim is allowed (6 hours passed since last claim)
export const isClaimAllowed = (lastClaimDate: string | null): boolean => {
  if (!lastClaimDate) return true;

  const lastClaim = new Date(lastClaimDate);
  const now = new Date();

  // Calculate time difference in milliseconds
  const timeDiff = now.getTime() - lastClaim.getTime();

  // 6 hours in milliseconds = 6 * 60 * 60 * 1000 = 21,600,000
  const sixHoursInMs = 6 * 60 * 60 * 1000;

  return timeDiff >= sixHoursInMs;
};

// Get time until next claim is available (in milliseconds)
export const getTimeUntilNextClaim = (lastClaimDate: string | null): number => {
  if (!lastClaimDate) return 0;

  const lastClaim = new Date(lastClaimDate);
  const now = new Date();

  // Calculate when the next claim will be available (6 hours after last claim)
  const sixHoursInMs = 6 * 60 * 60 * 1000;
  const nextClaimTime = new Date(lastClaim.getTime() + sixHoursInMs);

  // If next claim time is in the past, return 0
  if (nextClaimTime <= now) return 0;

  // Return time difference in milliseconds
  return nextClaimTime.getTime() - now.getTime();
};
