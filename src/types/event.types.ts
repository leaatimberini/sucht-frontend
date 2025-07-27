export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startDate: string;
  endDate: string;
  flyerImageUrl: string | null;
  confirmationSentAt: string | null; // <-- Campo añadido
  createdAt: string;
  updatedAt: string;
}

// Esta interfaz fue movida y actualizada en ticket.types.ts
// La dejamos aquí por referencia, pero no debería estar en este archivo.
// export interface TicketTier { ... } 
