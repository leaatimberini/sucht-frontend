'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { RRPPPerformance } from "@/types/dashboard.types";

export default function RRPPStatsPage() {
  const [performance, setPerformance] = useState<RRPPPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/dashboard/rrpp-performance');
        setPerformance(response.data);
      } catch (error) {
        console.error("Failed to fetch RRPP performance data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Rendimiento de RRPP</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-white">RRPP</th>
              <th className="p-4 text-sm font-semibold text-white">Entradas Generadas</th>
              <th className="p-4 text-sm font-semibold text-white">Ingresos Reales</th>
              <th className="p-4 text-sm font-semibold text-white">Tasa de Conversión</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="text-center p-6 text-zinc-400">Cargando datos...</td></tr>
            ) : (
              performance.map(rrpp => (
                <tr key={rrpp.rrppId} className="border-b border-zinc-800 last:border-b-0">
                  <td className="p-4 text-zinc-300 font-semibold">{rrpp.rrppName}</td>
                  <td className="p-4 text-zinc-300">{rrpp.ticketsGenerated}</td>
                  <td className="p-4 text-zinc-300">{rrpp.peopleAdmitted}</td>
                  <td className="p-4 font-bold text-pink-400">
                    {rrpp.ticketsGenerated > 0 
                      ? `${((rrpp.peopleAdmitted / rrpp.ticketsGenerated) * 100).toFixed(0)}%` 
                      : '0%'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
