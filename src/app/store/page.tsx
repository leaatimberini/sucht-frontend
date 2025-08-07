// frontend/src/app/store/page.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Product } from '@/types/product.types';
import { useCartStore } from '@/stores/cart-store';
import { AuthCheck } from '@/components/auth-check';
import { ShoppingBasket, Loader } from 'lucide-react';
import Image from 'next/image';

// Componente para la tarjeta de cada producto
function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
      <div className="relative w-full h-48 bg-zinc-800">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBasket className="w-16 h-16 text-zinc-700" />
          </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-white text-lg">{product.name}</h3>
        <p className="text-zinc-400 text-sm mt-1 flex-grow">{product.description}</p>
        <div className="mt-4 flex items-baseline gap-2">
          <p className="text-2xl font-bold text-green-400">${product.price}</p>
          {product.originalPrice && (
            <p className="text-md text-zinc-500 line-through">${product.originalPrice}</p>
          )}
        </div>
        <button
          onClick={() => addToCart(product)}
          className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg transition-colors"
        >
          Añadir al Carrito
        </button>
      </div>
    </div>
  );
}

// Componente principal de la página de la tienda
export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/store/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Tienda de Productos</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-pink-500" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {products.length === 0 && !isLoading && (
          <p className="text-zinc-500 text-center py-10">No hay productos disponibles en este momento.</p>
        )}
      </div>
    </AuthCheck>
  );
}