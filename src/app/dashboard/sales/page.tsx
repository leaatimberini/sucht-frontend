// src/app/dashboard/sales/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { type Ticket } from '@/types/ticket.types';
import { DashboardFilters } from '@/components/dashboard-filters';
import { AlertCircle } from 'lucide-react';
// Se quita la importación de 'es' para simplificar la llamada
import { formatInTimeZone } from 'date-fns-tz';

interface Filters {
  eventId?: string;
  startDate?: string;
  endDate?: string;
}

export default function SalesHistoryPage() {
  const [history, setHistory] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async (currentFilters: Filters) => {
    setIsLoading(true);
    try {
      const response = await api.get<Ticket[]>('/tickets/history/all', {
        params: currentFilters,
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch sales history", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(filters);
  }, [fetchHistory, filters]);

  // Función para formatear la fecha a la zona horaria local de Buenos Aires
  const formatDateTimeToBuenosAires = (dateString: string) => {
    if (!dateString) return '';
    return formatInTimeZone(dateString, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy HH:mm');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Historial de Ventas y Emisiones</h1>
        <p className="text-zinc-400 mt-1">
          Un registro de todos los tickets y productos generados en la plataforma.
        </p>
      </div>

      <DashboardFilters onFilterChange={setFilters} />

      {isLoading ? (
        <p className="text-zinc-400">Cargando historial...</p>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-zinc-900 border border-zinc-800 rounded-lg p-12">
          <AlertCircle className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-xl font-semibold text-white">Sin Resultados</h3>
          <p className="text-zinc-500 mt-1">No se encontraron ventas para los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-white">Fecha</th>
                <th className="p-4 text-sm font-semibold text-white">Cliente</th>
                <th className="p-4 text-sm font-semibold text-white">Producto</th>
                <th className="p-4 text-sm font-semibold text-white">Pagado</th>
                <th className="p-4 text-sm font-semibold text-white">Estado</th>
                <th className="p-4 text-sm font-semibold text-white">RRPP</th>
                <th className="p-4 text-sm font-semibold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {history.map((ticket) => (
                <tr key={ticket.id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 text-zinc-400 text-sm">
                    {/* CORRECCIÓN: Usamos la función auxiliar para formatear la fecha */}
                    {formatDateTimeToBuenosAires(ticket.createdAt)}hs
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-zinc-200">{ticket.user.name}</p>
                    <p className="text-sm text-zinc-500">{ticket.user.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-zinc-200">{ticket.tier.name} (x{ticket.quantity})</p>
                    <p className="text-sm text-zinc-500">{ticket.event.title}</p>
                  </td>
                  <td className="p-4 font-semibold text-green-400">
                    ${Number(ticket.amountPaid).toFixed(2)}
                  </td>
                  <td className="p-4 text-sm capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      ticket.status === 'partially_paid' ? 'bg-yellow-500/20 text-yellow-400' :
                      ticket.status === 'valid' ? 'bg-green-500/20 text-green-400' :
                      'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-300">
                    {ticket.promoter ? `@${ticket.promoter.username}` : 'N/A'}
                  </td>
                  <td className="p-4">
                    <button>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}