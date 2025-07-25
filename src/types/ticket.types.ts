import { type Event } from './event.types';
import { type User } from './user.types'; // <-- 1. IMPORTAR EL TIPO User

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  status: 'valid' | 'used' | 'invalid' | 'partially_used';
  quantity: number;
  redeemedCount: number;
  validatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  event: Event;
  tier: TicketTier;
  user: User; // <-- 2. AÑADIR LA PROPIEDAD 'user'
}
