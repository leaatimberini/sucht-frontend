'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { format } from 'date-fns';
import { formatDate } from '@/lib/date-utils';
import { User, Calendar, AlertCircle, Ticket as TicketIcon } from "lucide-react";
import { Loader2 } from 'lucide-react';
import { Ticket } from '@/types/ticket.types';

interface NoShowTicket extends Ticket { }

export default function NoShowsPage() {
  const [noShows, setNoShows] = useState<NoShowTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNoShows = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<NoShowTicket[]>('/dashboard/no-shows');
        setNoShows(response.data);
      } catch (error) {
        console.error("Failed to fetch no-shows", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoShows();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Inasistencias a Eventos</h1>
        <p className="text-zinc-400 mt-1">
          Lista de entradas no canjeadas de eventos que ya finalizaron.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-pink-500" /></div>
      ) : noShows.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-zinc-900 border border-zinc-800 rounded-lg p-12">
          <AlertCircle className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-xl font-semibold text-white">No se encontraron inasistencias</h3>
          <p className="text-zinc-500 mt-1">Todos los tickets de eventos pasados fueron canjeados.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-white flex items-center gap-2"><User size={16} /> Cliente</th>
                <th className="p-4 text-sm font-semibold text-white flex items-center gap-2"><Calendar size={16} /> Evento</th>
                <th className="p-4 text-sm font-semibold text-white flex items-center gap-2"><TicketIcon size={16} /> Tipo de Entrada</th>
                <th className="p-4 text-sm font-semibold text-white">Finalizó el</th>
              </tr>
            </thead>
            <tbody>
              {noShows.map((ticket) => (
                <tr key={ticket.id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4">
                    {/* --- CORRECCIÓN DE SEGURIDAD --- */}
                    <p className="font-semibold text-zinc-200">{ticket.user?.name || 'Usuario no disponible'}</p>
                    <p className="text-sm text-zinc-400">{ticket.user?.email || 'Email no disponible'}</p>
                  </td>
                  <td className="p-4 text-zinc-300">{ticket.event?.title || 'Evento no disponible'}</td>
                  <td className="p-4 text-zinc-300">{ticket.tier?.name || 'Tipo no disponible'}</td>

                  <td className="p-4 text-zinc-400">{ticket.event ? formatDate(ticket.event.endDate, 'dd/MM/yyyy') : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}