import { type Event } from './event.types';

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para el objeto Ticket completo
export interface Ticket {
  id: string;
  status: 'valid' | 'used' | 'invalid';
  validatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  event: Event;
  tier: TicketTier;
}