'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { AuthCheck } from '@/components/auth-check';
import { Ticket } from '@/types/ticket.types';
import { UserReward } from '@/types/reward.types';
import { formatDate } from '@/lib/date-utils';
import { Loader2, History } from 'lucide-react';
import toast from 'react-hot-toast';

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function HistorialPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ticketsRes, userRewardsRes] = await Promise.all([
        api.get('/tickets/my-tickets'),
        api.get('/rewards/my-rewards'),
      ]);
      setTickets(ticketsRes.data);
      setUserRewards(userRewardsRes.data);
    } catch (error) {
      toast.error('No se pudo cargar tu historial.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Procesamos los datos para unificar y ordenar el historial
  const usedTickets = tickets.filter(t => t.status === 'used' || t.status === 'redeemed' || t.status === 'partially_used');
  const usedRewards = userRewards.filter(r => r.redeemedAt !== null);

  const allUsedItems = [
    ...usedTickets.map(t => ({ id: t.id, name: t.tier.name, date: t.validatedAt, type: 'Ticket' })),
    ...usedRewards.map(r => ({ id: r.id, name: r.reward.name, date: r.redeemedAt, type: 'Premio' }))
  ].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

  return (
    <AuthCheck>
      <h1 className="text-3xl font-bold text-white mb-6">Historial de Canjes</h1>
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-pink-500" size={32} />
        </div>
      ) : allUsedItems.length > 0 ? (
        <div className="space-y-4">
          {allUsedItems.map(item => (
            <div key={`${item.type}-${item.id}`} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.type === 'Ticket' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {item.type}
                </span>
                <p className="text-white font-semibold mt-2">{item.name}</p>
              </div>
              <p className="text-zinc-400 text-sm mt-2 sm:mt-0">
                Usado el: {formatDate(item.date!)} hs
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-lg">
          <History className="mx-auto text-zinc-600 mb-4" size={48} />
          <p className="text-zinc-400">No has utilizado ninguna entrada o premio todavía.</p>
        </div>
      )}
    </AuthCheck>
  );
}