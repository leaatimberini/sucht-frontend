// src/types/ticket.types.ts

import { type Event } from './event.types';
import { type User } from './user.types';

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
  createdAt: string;
  updatedAt: string;
  productType: ProductType;
  allowPartialPayment: boolean;
  partialPaymentPrice: number | null;
}

export interface Ticket {
  id: string;
  status: 'valid' | 'used' | 'invalid' | 'partially_used' | 'partially_paid';
  quantity: number;
  redeemedCount: number;
  amountPaid: number; // <-- Propiedad añadida
  confirmedAt: string | null;
  validatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  event: Event;
  tier: TicketTier;
  user: User; 
  promoter: User | null; // <-- Propiedad añadida
}