'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { AuthCheck } from '@/components/auth-check';
import { ProductPurchase } from '@/types/product-purchase.types';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function MisProductosPage() {
  const [productPurchases, setProductPurchases] = useState<ProductPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/store/purchase/my-products');
      setProductPurchases(response.data);
    } catch (error) {
      toast.error('No se pudieron cargar tus productos.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <AuthCheck>
      <h1 className="text-3xl font-bold text-white mb-6">Mis Productos</h1>
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-pink-500" size={32} />
        </div>
      ) : productPurchases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productPurchases.map((purchase) => (
            <div key={purchase.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col items-center text-center shadow-lg">
              <div className="bg-white p-4 rounded-md mb-4">
                <QRCodeSVG value={purchase.id || ''} size={150} fgColor="#000000" bgColor="#ffffff" />
              </div>
              <h2 className="text-xl font-bold text-white">{purchase.product.name}</h2>
              <p className="text-sm text-zinc-400 mb-4">{purchase.event.title}</p>

              <p className="text-xs text-zinc-500">
                Comprado el: {new Date(purchase.createdAt).toLocaleDateString('es-AR')}
              </p>

              <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold ${purchase.redeemedAt
                  ? 'bg-zinc-500/20 text-zinc-400'
                  : 'bg-green-500/20 text-green-400'
                }`}>
                {purchase.redeemedAt ? `CANJEADO` : 'LISTO PARA USAR'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-lg">
          <ShoppingBag className="mx-auto text-zinc-600 mb-4" size={48} />
          <p className="text-zinc-400">Aún no has comprado ningún producto.</p>
          <p className="text-zinc-500 text-sm mt-2">Visita la tienda para ver las opciones disponibles.</p>
        </div>
      )}
    </AuthCheck>
  );
}