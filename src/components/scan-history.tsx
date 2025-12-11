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
        const response = await api.get(`/tickets/scan-history/${eventId}`);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch scan history", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  // CORRECCIÓN: Función para formatear la fecha a la zona horaria de Buenos Aires
  // CORRECCIÓN: Función para formatear la fecha a la zona horaria de Buenos Aires
  const formatTime = (dateString: string) => {
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
            </div>
            <p className="text-sm text-zinc-500">
              {/* CORRECCIÓN: Se usa la nueva función para formatear la hora */}
              {formatTime(ticket.validatedAt!)}hs
            </p>
          </li>
        )) : <p className="p-6 text-center text-zinc-500">Aún no se han escaneado entradas.</p>}
      </ul>
    </div>
  );
}