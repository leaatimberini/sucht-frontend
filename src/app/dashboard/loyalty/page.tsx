'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Trophy, User, Mail } from "lucide-react";

// Tipo de datos para el ranking de asistencia
interface AttendanceRankingData {
  userId: string;
  userName: string;
  userEmail: string;
  totalAttendance: number;
}

export default function LoyaltyPage() {
  const [ranking, setRanking] = useState<AttendanceRankingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setIsLoading(true);
        // Hacemos la llamada al nuevo endpoint del ranking
        const response = await api.get<AttendanceRankingData[]>('/dashboard/loyalty/attendance-ranking');
        setRanking(response.data);
      } catch (error) {
        console.error("Failed to fetch attendance ranking", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="text-amber-400" />
          Ranking de Fidelización
        </h1>
        <p className="text-zinc-400 mt-1">
          Top 25 de clientes con mayor cantidad de asistencias.
        </p>
      </div>

      {isLoading ? (
        <p className="text-zinc-400">Cargando ranking...</p>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-white w-16 text-center">#</th>
                <th className="p-4 text-sm font-semibold text-white"><User size={16} className="inline mr-2" />Cliente</th>
                <th className="p-4 text-sm font-semibold text-white"><Mail size={16} className="inline mr-2" />Email</th>
                <th className="p-4 text-sm font-semibold text-white text-center">Asistencias Totales</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((client, index) => (
                <tr key={client.userId} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 text-center">
                    <span className={`font-bold text-lg ${
                      index === 0 ? 'text-amber-400' : 
                      index === 1 ? 'text-gray-300' : 
                      index === 2 ? 'text-amber-600' : 'text-zinc-400'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-zinc-200">{client.userName}</td>
                  <td className="p-4 text-zinc-400">{client.userEmail}</td>
                  <td className="p-4 text-center font-bold text-xl text-pink-400">{client.totalAttendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ranking.length === 0 && !isLoading && (
            <p className="p-6 text-center text-zinc-500">No hay datos de asistencia para mostrar.</p>
          )}
        </div>
      )}
    </div>
  );
}