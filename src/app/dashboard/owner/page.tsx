'use client';

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { SummaryMetrics, EventPerformance } from "@/types/dashboard.types";
import { Ticket, Users, Calendar } from "lucide-react";
import { DashboardFilters } from "@/components/dashboard-filters";
import { AuthCheck } from "@/components/auth-check";
import { UserRole } from "@/types/user.types";
import toast from 'react-hot-toast';

// Interfaz para el estado de los filtros
interface Filters {
  eventId?: string;
  startDate?: string;
  endDate?: string;
}

// Reutilizamos el componente StatCard del dashboard principal
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

// Componente principal de la página del Dashboard del Dueño
export default function OwnerDashboardPage() {
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [performance, setPerformance] = useState<EventPerformance[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [nextEventId, setNextEventId] = useState<string | null>(null);

  // 1. Buscamos el ID del próximo evento al cargar la página
  useEffect(() => {
    const fetchNextEvent = async () => {
        try {
            // NOTA: Este endpoint GET /events/next necesita ser creado en el backend.
            const response = await api.get('/events/next');
            if (response.data) {
                setNextEventId(response.data.id);
                setFilters({ eventId: response.data.id }); // Establecemos el filtro por defecto
            } else {
                // Si no hay próximo evento, cargamos las métricas generales por defecto
                setFilters({});
            }
        } catch (error) {
            console.error("No se pudo encontrar el próximo evento, cargando métricas generales.", error)
            setFilters({}); // Carga métricas generales si el endpoint falla
        }
    };
    fetchNextEvent();
  }, []);

  // 2. La función de carga de datos ahora depende de los filtros
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
      toast.error("No se pudieron cargar las métricas.");
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Evita la carga inicial vacía hasta que tengamos un filtro (del próximo evento o vacío)
    if (Object.keys(filters).length > 0 || nextEventId === null) {
        fetchData(filters);
    }
  }, [fetchData, filters, nextEventId]);

  return (
    <AuthCheck allowedRoles={[UserRole.OWNER, UserRole.ADMIN]}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Métricas en Vivo</h1>
        
        <DashboardFilters onFilterChange={setFilters} initialEventId={nextEventId} />
        
        {isLoading ? (
           <p className="text-zinc-400">Cargando métricas...</p>
        ) : summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Entradas Generadas" value={summary.totalTicketsGenerated} icon={Ticket} />
              <StatCard title="Personas Ingresadas" value={summary.totalPeopleAdmitted} icon={Users} />
              <StatCard title="Eventos (Filtrados)" value={summary.totalEvents} icon={Calendar} />
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-white mb-4">Rendimiento del Evento</h2>
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
                    {performance.length === 0 && !isLoading && (
                        <tr>
                            <td colSpan={4} className="p-4 text-center text-zinc-500">No hay datos de eventos para los filtros seleccionados.</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthCheck>
  );
}