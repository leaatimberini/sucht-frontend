export interface UserReward {
  id: string;
  reward: {
    name: string;
    // Add other properties as needed
  };
  redeemedAt: string | null;
  // Add other properties as needed
}