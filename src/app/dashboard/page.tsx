// Dashboard Page - src/app/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { SummaryMetrics, EventPerformance } from "@/types/dashboard.types";
import { Ticket, Users, Calendar } from "lucide-react";
import { DashboardFilters } from "@/components/dashboard-filters";

// Interfaz para el estado de los filtros
interface Filters {
  eventId?: string;
  startDate?: string;
  endDate?: string;
}

// Componente para las tarjetas de estadísticas
function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <Icon className="h-5 w-5 text-zinc-500" />
      </div>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}

// Componente principal de la página del Dashboard
export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [performance, setPerformance] = useState<EventPerformance[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [isLoading, setIsLoading] = useState(true);

  // Función para buscar los datos, ahora acepta los filtros como argumento
  const fetchData = useCallback(async (currentFilters: Filters) => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (currentFilters.eventId) params.append('eventId', currentFilters.eventId);
    if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
    if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);
    const queryString = params.toString();

    try {
      const [summaryRes, performanceRes] = await Promise.all([
        api.get(`/dashboard/summary?${queryString}`),
        api.get(`/dashboard/event-performance?${queryString}`),
      ]);
      setSummary(summaryRes.data);
      setPerformance(performanceRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect se ejecuta al montar la página y cada vez que los filtros cambian
  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Métricas</h1>
      
      {/* Componente de Filtros */}
      <DashboardFilters onFilterChange={setFilters} />
      
      {isLoading ? (
         <p className="text-zinc-400">Cargando métricas...</p>
      ) : summary && (
        <>
          {/* Tarjetas de Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Entradas Generadas" value={summary.totalTicketsGenerated} icon={Ticket} />
            <StatCard title="Personas Ingresadas" value={summary.totalPeopleAdmitted} icon={Users} />
            <StatCard title="Eventos (Total)" value={summary.totalEvents} icon={Calendar} />
          </div>

          {/* Tabla de Rendimiento por Evento */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-white mb-4">Rendimiento por Evento</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-700">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-white">Evento</th>
                    <th className="p-4 text-sm font-semibold text-white">Entradas Generadas</th>
                    <th className="p-4 text-sm font-semibold text-white">Ingresos Reales</th>
                    <th className="p-4 text-sm font-semibold text-white">Tasa de Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map(event => (
                    <tr key={event.id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 text-zinc-300 font-semibold">{event.title}</td>
                      <td className="p-4 text-zinc-300">{event.ticketsGenerated}</td>
                      <td className="p-4 text-zinc-300">{event.peopleAdmitted}</td>
                      <td className="p-4 font-bold text-pink-400">
                        {event.ticketsGenerated > 0 
                          ? `${((event.peopleAdmitted / event.ticketsGenerated) * 100).toFixed(0)}%` 
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {performance.length === 0 && (
                <p className="p-4 text-center text-zinc-500">No hay datos de eventos para los filtros seleccionados.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}