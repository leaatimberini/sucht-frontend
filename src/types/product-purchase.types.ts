import { Product } from "./product.types";

export interface ProductPurchase {
    id: string;
    userId: string;
    productId: string;
    eventId: string;
    quantity: number;
    amountPaid: number;
    paymentId: string;
    redeemedAt: string | null;
    createdAt: string; // ✅ Añadimos la propiedad 'createdAt' para corregir el error
    updatedAt: string;
    product: Product;
    event: {
        id: string;
        title: string;
        startDate: string;
    };
}