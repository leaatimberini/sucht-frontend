// frontend/src/components/redeemed-rewards-history.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/date-utils';

// Tipos basados en lo que devuelve la API
interface UserReward {
  id: string;
  user: { name: string; email: string; };
  reward: { name: string; };
  redeemedAt: string;
}

export function RedeemedRewardsHistory() {
  const [history, setHistory] = useState<UserReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/rewards/history/redeemed');
        setHistory(response.data);
      } catch (error) {
        toast.error('No se pudo cargar el historial.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) {
    return <p className="text-zinc-400 text-center">Cargando historial...</p>;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-zinc-700">
          <tr>
            <th className="p-4 text-sm font-semibold text-white">Cliente</th>
            <th className="p-4 text-sm font-semibold text-white">Premio Canjeado</th>
            <th className="p-4 text-sm font-semibold text-white">Fecha de Canje</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id} className="border-b border-zinc-800 last:border-b-0">
              <td className="p-4">
                <p className="font-semibold text-zinc-200">{item.user.name}</p>
                <p className="text-sm text-zinc-500">{item.user.email}</p>
              </td>
              <td className="p-4 text-zinc-300">{item.reward.name}</td>
              <td className="p-4 text-zinc-400">{formatDate(item.redeemedAt, 'dd/MM/yyyy HH:mm')} hs</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}