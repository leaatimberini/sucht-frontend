// src/app/dashboard/loyalty/page.tsx
'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Trophy, User, Mail, Award } from "lucide-react";

// Tipo de datos para el ranking
interface AttendanceRankingUser {
  userId: string;
  userName: string;
  userEmail: string;
  totalAttendance: number;
}

// Tipo de datos para asistencia perfecta (más simple)
interface PerfectAttendanceUser {
  id: string;
  name: string;
  email: string;
}

export default function LoyaltyPage() {
  const [ranking, setRanking] = useState<AttendanceRankingUser[]>([]);
  const [perfectAttendance, setPerfectAttendance] = useState<PerfectAttendanceUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    if (!startDate || !endDate) {
      return;
    }
    try {
      setIsLoading(true);
      const params = { startDate, endDate };

      const [rankingRes, perfectAttendanceRes] = await Promise.all([
        api.get<AttendanceRankingUser[]>('/dashboard/loyalty/attendance-ranking', { params }),
        api.get<PerfectAttendanceUser[]>('/dashboard/loyalty/perfect-attendance', { params })
      ]);

      setRanking(rankingRes.data);
      setPerfectAttendance(perfectAttendanceRes.data);
    } catch (error) {
      console.error("Failed to fetch loyalty data", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="text-amber-400" />
          Fidelización de Clientes
        </h1>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-zinc-300 mb-1">Fecha de Inicio</label>
            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"/>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-zinc-300 mb-1">Fecha de Fin</label>
            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"/>
          </div>
          <button onClick={fetchData} disabled={isLoading || !startDate || !endDate} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 h-10">
            {isLoading ? 'Buscando...' : 'Filtrar'}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <p className="text-zinc-400 text-center py-10">Cargando datos...</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-4">
              <Award className="text-sky-400" />
              Asistencia Perfecta
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              {perfectAttendance.length > 0 ? (
                <ul className="divide-y divide-zinc-800">
                  {perfectAttendance.map(user => (
                    <li key={user.id} className="py-2 flex justify-between items-center">
                      <span className="text-zinc-200">{user.name}</span>
                      <span className="text-zinc-400 text-sm">{user.email}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500 text-center">No hay clientes con asistencia perfecta en este período.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Ranking de Asistencia</h2>
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
                <p className="p-6 text-center text-zinc-500">No hay datos de asistencia para mostrar en este período.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}