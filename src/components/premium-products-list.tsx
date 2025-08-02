'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Ticket } from '@/types/ticket.types';

export function PremiumProductsList({ eventId }: { eventId: string }) {
  const [products, setProducts] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/tickets/premium-products/${eventId}`);
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch premium products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [eventId]);

  if (isLoading) return <p className="text-zinc-400 text-center">Cargando productos...</p>;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg mt-6">
      <ul role="list" className="divide-y divide-zinc-800">
        {products.length > 0 ? products.map((ticket) => (
          <li key={ticket.id} className="flex items-center justify-between gap-x-6 p-4">
            <div>
              <p className="font-semibold text-white">{ticket.tier.name}</p>
              <p className="text-sm text-zinc-400">Comprador: {ticket.user.name}</p>
            </div>
            <p className={`text-sm font-semibold capitalize ${
              ticket.status === 'partially_paid' ? 'text-yellow-400' : 
              ticket.status === 'valid' ? 'text-green-400' : 'text-zinc-500'
            }`}>
              {ticket.status.replace('_', ' ')}
            </p>
          </li>
        )) : <p className="p-6 text-center text-zinc-500">No se vendieron productos premium para este evento.</p>}
      </ul>
    </div>
  );
}