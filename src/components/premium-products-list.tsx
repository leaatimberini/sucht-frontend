// frontend/src/components/premium-products-list.tsx
'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Ticket } from '@/types/ticket.types';
import { formatDate } from '@/lib/date-utils';

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

  // Función para formatear la fecha a la zona horaria local de Buenos Aires
  // Función para formatear la fecha a la zona horaria local de Buenos Aires
  const formatDateTimeToBuenosAires = (dateString: string) => {
    if (!dateString) return '';
    return formatDate(dateString, 'dd/MM/yyyy HH:mm');
  };

  if (isLoading) return <p className="text-zinc-400 text-center">Cargando productos...</p>;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg mt-6">
      <ul role="list" className="divide-y divide-zinc-800">
        {products.length > 0 ? products.map((ticket) => (
          <li key={ticket.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">{ticket.tier.name}</p>
                <p className="text-sm text-zinc-400">
                  Comprador: <span className="text-zinc-300">{ticket.user?.name}</span>
                </p>
                <p className="text-sm text-zinc-400">
                  RRPP: <span className="text-zinc-300">{ticket.promoter ? `@${ticket.promoter.username}` : 'N/A'}</span>
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold capitalize ${ticket.status === 'partially_paid' ? 'text-yellow-400' :
                  ticket.status === 'redeemed' || ticket.status === 'used' ? 'text-red-400' :
                    'text-green-400'
                  }`}>
                  {ticket.status.replace('_', ' ')}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Pagado: <span className="text-white">${Number(ticket.amountPaid).toFixed(2)}</span>
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Cantidad: <span className="text-white">{ticket.quantity}</span>
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Fecha: <span className="text-white">{formatDateTimeToBuenosAires(ticket.createdAt)}hs</span>
                </p>
              </div>
            </div>
          </li>
        )) : <p className="p-6 text-center text-zinc-500">No se vendieron productos premium para este evento.</p>}
      </ul>
    </div>
  );
}