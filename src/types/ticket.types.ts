export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  // Propiedades añadidas para consistencia
  available: boolean;
  eventId: string;
  // ---
  createdAt: string;
  updatedAt: string;
}