
import { Event } from "./event.types";
import { User } from "./user.types";

export enum TicketStatus {
  VALID = 'valid',
  USED = 'used',
  PARTIALLY_USED = 'partially_used',
  INVALIDATED = 'invalidated',
  PARTIALLY_PAID = 'partially_paid',
  REDEEMED = 'redeemed',
}

export enum ProductType {
  TICKET = 'ticket',
  VIP_TABLE = 'vip_table',
  VOUCHER = 'voucher',
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  validUntil: string | null;
  isFree: boolean;
  productType: ProductType;
  allowPartialPayment: boolean;
  partialPaymentPrice: number | null;
  isBirthdayDefault: boolean;
  isBirthdayVipOffer: boolean;
  consumptionCredit: number | null;

  // --- CAMPOS NUEVOS Y ACTUALIZADOS ---
  eventId: string;
  description: string | null;
  isVip: boolean;
  isPubliclyListed: boolean;
  tableNumber: number | null;
  capacity: number | null;
  location: string | null;
  tableCategoryId: string | null;
  linkedRewardId?: string | null; // Nuevo campo
  linkedReward?: any | null; // Usar tipo apropiado si está disponible
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  ticketId: string | null;
  redeemedAt: string | null;
  origin: string | null;
  reward: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
}

export interface Ticket {
  id: string;
  event: Event;
  tier: TicketTier;
  user: User;
  promoter: User | null;
  status: TicketStatus;
  origin: string | null;
  quantity: number;
  redeemedCount: number;
  amountPaid: number;
  paymentId: string | null;
  specialInstructions: string | null;
  confirmedAt: string | null;
  validatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isVipAccess: boolean;
  userRewards: UserReward[]; // Nuevo campo
}