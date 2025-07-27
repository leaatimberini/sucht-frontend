'use client';

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { SummaryMetrics, EventPerformance } from "@/types/dashboard.types";
import { Ticket, Users, Calendar } from "lucide-react";

function StatCard({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) {
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

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [performance, setPerformance] = useState<EventPerformance[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, performanceRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/event-performance'),
      ]);
      setSummary(summaryRes.data);
      setPerformance(performanceRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  if (!summary) {
    return <p className="text-zinc-400">Cargando métricas...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Métricas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Entradas Generadas (Total)" value={summary.totalTicketsGenerated} icon={Ticket} />
        <StatCard title="Personas Ingresadas (Total)" value={summary.totalPeopleAdmitted} icon={Users} />
        <StatCard title="Eventos Creados" value={summary.totalEvents} icon={Calendar} />
      </div>

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
                <tr key={event.id} className="border-b border-zinc-800 last:border-b-0">
                  <td className="p-4 text-zinc-300 font-semibold">{event.title}</td>
                  <td className="p-4 text-zinc-300">{event.ticketsGenerated}</td>
                  <td className="p-4 text-zinc-300">{event.peopleAdmitted}</td>
                  {/* CORRECCIÓN: Se eliminó la clase 'text-zinc-300' redundante */}
                  <td className="p-4 font-bold text-pink-400">
                    {event.ticketsGenerated > 0 
                      ? `${((event.peopleAdmitted / event.ticketsGenerated) * 100).toFixed(0)}%` 
                      : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
