// src/components/redeemed-products-history.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { ProductPurchase } from '@/types/product-purchase.types';
import { formatDate } from '@/lib/date-utils';

export function RedeemedProductsHistory() {
  const [history, setHistory] = useState<ProductPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/store/purchase/redeemed-history');
        setHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch redeemed products history:', err);
        setError('No se pudo cargar el historial de productos canjeados.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div className="text-center text-white">Cargando historial...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (history.length === 0) {
    return <div className="text-center text-zinc-400">No hay productos canjeados aún.</div>;
  }

  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Historial de Productos Canjeados</h2>
      <ul className="space-y-4">
        {history.map((item) => (
          <li key={item.id} className="bg-zinc-800 p-4 rounded-md flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold text-white">{item.product.name}</p>
              <p className="text-zinc-400 text-sm">Por: {item.user.name}</p>
              <p className="text-zinc-500 text-xs">
                Fecha de canje: {item.redeemedAt ? formatDate(item.redeemedAt, "dd 'de' MMMM, HH:mm") : 'N/A'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}