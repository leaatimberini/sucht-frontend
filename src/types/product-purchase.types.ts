// src/types/product-purchase.types.ts
import { Product } from "./product.types";
import { User } from "./user.types"; // Añadir esta importación

export interface ProductPurchase {
    id: string;
    userId: string;
    productId: string;
    eventId: string;
    quantity: number;
    amountPaid: number;
    paymentId: string;
    redeemedAt: string | null;
    createdAt: string;
    updatedAt: string;
    product: Product;
    event: {
        id: string;
        title: string;
        startDate: string;
    };
    user: User; // <-- Propiedad que faltaba
}