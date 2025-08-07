// frontend/src/stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product.types'; // Necesitarás crear este tipo
import toast from 'react-hot-toast';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => {
        const currentItems = get().items;
        const itemExists = currentItems.find((item) => item.id === product.id);

        if (itemExists) {
          toast.success(`${product.name} actualizado en el carrito.`);
          set({
            items: currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          toast.success(`${product.name} añadido al carrito.`);
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
        toast.error('Producto eliminado del carrito.');
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          }));
        }
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // Nombre para el almacenamiento local
    }
  )
);