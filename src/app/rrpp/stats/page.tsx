'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { MyRRPPStats } from "@/types/dashboard.types";
import { Ticket, Users } from "lucide-react";

function StatCard({ title, value }: { title: string, value: number }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}

export default function RRPPStatsPage() {
  const [stats, setStats] = useState<MyRRPPStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/dashboard/my-rrpp-stats');
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch RRPP stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <p className="text-zinc-400">Cargando tus estadísticas...</p>;
  }
  
  if (!stats) {
    return <p className="text-red-400">No se pudieron cargar las estadísticas.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Mis Estadísticas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Entradas Generadas por mí" value={stats.ticketsGenerated} />
        <StatCard title="Invitados que Asistieron" value={stats.peopleAdmitted} />
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-white mb-4">Mi Lista de Invitados</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-white">Invitado</th>
                <th className="p-4 text-sm font-semibold text-white">Evento</th>
                <th className="p-4 text-sm font-semibold text-white">Estado</th>
                <th className="p-4 text-sm font-semibold text-white">Ingresaron</th>
              </tr>
            </thead>
            <tbody>
              {stats.guestList.map(guest => (
                <tr key={guest.id} className="border-b border-zinc-800 last:border-b-0">
                  <td className="p-4 text-zinc-300">{guest.user.name} <span className="text-zinc-500 text-xs">({guest.user.email})</span></td>
                  <td className="p-4 text-zinc-300">{guest.event.title}</td>
                  <td className="p-4 text-zinc-300">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${guest.status === 'used' || guest.status === 'partially_used' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-300'}`}>
                      {guest.status === 'used' || guest.status === 'partially_used' ? 'Asistió' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-300 font-semibold">{guest.redeemedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
