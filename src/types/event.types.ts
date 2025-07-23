// src/types/event.types.ts
export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  flyerImageUrl?: string | null; // Añadimos esta propiedad para el flyer
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  available: boolean;
  eventId: string;
  createdAt: string;
  updatedAt: string;
}