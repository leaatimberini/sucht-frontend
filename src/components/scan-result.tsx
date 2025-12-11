// frontend/src/components/scan-history.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Ticket } from '@/types/ticket.types';
import { formatDate } from '@/lib/date-utils';

export function ScanHistory({ eventId }: { eventId: string }) {
  const [history, setHistory] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // El backend en tickets.service.ts tiene un método getScanHistory que devuelve los tickets ya validados
        const response = await api.get(`/tickets/scan-history/${eventId}`);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch scan history", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    // Refresca el historial automáticamente cada 15 segundos
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, [eventId]);

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return formatDate(dateString, 'HH:mm:ss');
  };

  if (isLoading) return <p className="text-zinc-400 text-center">Cargando historial...</p>;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg mt-6">
      <ul role="list" className="divide-y divide-zinc-800">
        {history.length > 0 ? history.map((ticket) => (
          <li key={ticket.id} className="flex items-center justify-between gap-x-6 p-4">
            <div>
              <p className="font-semibold text-white">{ticket.user.name}</p>
              <p className="text-sm text-zinc-400">{ticket.tier.name}</p>
              {/* Añadimos insignia de VIP si corresponde */}
              {ticket.isVipAccess && (
                <p className="text-xs font-bold text-amber-400 mt-1 p-1 bg-amber-400/10 rounded-md inline-block">
                  ACCESO VIP
                </p>
              )}
            </div>
            <div className="text-right">
              {/* Añadimos el contador de canje para más detalle */}
              <p className="font-mono text-lg font-bold text-pink-400">{ticket.redeemedCount}/{ticket.quantity}</p>
              <p className="text-sm text-zinc-500">
                {formatTime(ticket.validatedAt)}hs
              </p>
            </div>
          </li>
        )) : <p className="p-6 text-center text-zinc-500">Aún no se han escaneado entradas.</p>}
      </ul>
    </div>
  );
}