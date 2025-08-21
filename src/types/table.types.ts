// --- TIPOS DE DATOS ---
export interface TableCategory {
    id: string;
    name: string;
}

export interface Table {
    id: string;
    tableNumber: string;
    status: 'available' | 'reserved' | 'occupied' | 'unavailable';
    category: TableCategory;
    positionX: number | null;
    positionY: number | null;
}

export interface TableReservation {
    id: string;
    clientName: string;
    clientEmail: string | null;
    guestCount: number;
    amountPaid: number;
    totalPrice: number;
    paymentType: string;
    reservedByUser: { name: string };
    table: { tableNumber: string, category: { name: string } };
    ticket: { status: string };
}