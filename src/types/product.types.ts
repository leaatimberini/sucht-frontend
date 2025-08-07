// frontend/src/types/product.types.ts

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  stock: number | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}