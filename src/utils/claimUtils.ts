// Default claim amount if not set
const DEFAULT_CLAIM_AMOUNT = 1;

// Get the current claim amount from localStorage
export const getClaimAmount = (): number => {
  const storedAmount = localStorage.getItem("bottlecaps_claim_amount");
  if (storedAmount) {
    const parsedAmount = parseInt(storedAmount, 10);
    return isNaN(parsedAmount) || parsedAmount < 1 ? DEFAULT_CLAIM_AMOUNT : parsedAmount;
  }
  return DEFAULT_CLAIM_AMOUNT;
};

// Set the claim amount in localStorage
export const setClaimAmount = (amount: number): void => {
  // Ensure amount is at least 1
  const validAmount = Math.max(1, amount);
  localStorage.setItem("bottlecaps_claim_amount", validAmount.toString());
};
