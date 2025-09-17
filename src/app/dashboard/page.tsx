// Dashboard Page - src/app/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { SummaryMetrics } from "@/types/dashboard.types";
import { Ticket, Users, Calendar } from "lucide-react";
import { DashboardFilters } from "@/components/dashboard-filters";
// FIX: Importamos el nuevo componente de métricas
import { EventPerformance } from "@/components/dashboard/EventPerformance";

// Interfaz para el estado de los filtros
interface Filters {
  eventId?: string;
  startDate?: string;
  endDate?: string;
}

// Componente para las tarjetas de estadísticas (sin cambios)
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
  // FIX: Ya no necesitamos el estado 'performance', el nuevo componente lo maneja internamente.
  // const [performance, setPerformance] = useState<EventPerformance[]>([]); 
  const [filters, setFilters] = useState<Filters>({});
  const [isLoading, setIsLoading] = useState(true);

  // FIX: La función de búsqueda ahora solo se encarga de las métricas de resumen.
  const fetchData = useCallback(async (currentFilters: Filters) => {
    setIsLoading(true);
    const params = new URLSearchParams();
    // Los filtros siguen aplicando a las tarjetas de resumen
    if (currentFilters.eventId) params.append('eventId', currentFilters.eventId);
    if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
    if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);
    const queryString = params.toString();

    try {
      // Solo necesitamos hacer una llamada a la API aquí
      const summaryRes = await api.get(`/dashboard/summary?${queryString}`);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Failed to fetch summary data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Métricas</h1>
      
      <DashboardFilters onFilterChange={setFilters} />
      
      {isLoading ? (
         <p className="text-zinc-400">Cargando métricas...</p>
      ) : summary && (
        <>
          {/* Tarjetas de Resumen (sin cambios) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Entradas Generadas" value={summary.totalTicketsGenerated} icon={Ticket} />
            <StatCard title="Personas Ingresadas" value={summary.totalPeopleAdmitted} icon={Users} />
            <StatCard title="Eventos (Total)" value={summary.totalEvents} icon={Calendar} />
          </div>

          {/* FIX: Reemplazamos la tabla vieja con nuestro nuevo componente */}
          <div className="mt-10">
            <EventPerformance />
          </div>
        </>
      )}
    </div>
  );
}