// frontend/src/types/reward.types.ts

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  stock: number | null;
  isActive: boolean;
}

export interface UserReward {
  id: string;
  reward: Reward;
  redeemedAt: string | null;
  createdAt: string;
}