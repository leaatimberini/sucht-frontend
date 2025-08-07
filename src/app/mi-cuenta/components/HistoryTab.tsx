// src/app/mi-cuenta/components/HistoryTab.tsx
'use client';

import { Ticket } from "@/types/ticket.types";
import { UserReward } from "@/types/reward.types"; // Asumimos que crearás este archivo de tipos
import { format } from "date-fns";

export function HistoryTab({ tickets, rewards }: { tickets: Ticket[], rewards: UserReward[] }) {
  const usedTickets = tickets.filter(t => t.status === 'used' || t.status === 'redeemed');
  const usedRewards = rewards.filter(r => r.redeemedAt !== null);
  
  const allUsedItems = [
    ...usedTickets.map(t => ({ id: t.id, name: t.tier.name, date: t.validatedAt })),
    ...usedRewards.map(r => ({ id: r.id, name: r.reward.name, date: r.redeemedAt }))
  ].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

  if (allUsedItems.length === 0) {
    return <p className="text-zinc-500 text-center py-10">No has utilizado ninguna entrada o premio todavía.</p>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-4">Historial de Items Usados</h2>
      {allUsedItems.map(item => (
        <div key={item.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex justify-between items-center">
          <p className="text-white font-semibold">{item.name}</p>
          <p className="text-zinc-400 text-sm">
            Usado el: {format(new Date(item.date!), 'dd/MM/yyyy HH:mm')} hs
          </p>
        </div>
      ))}
    </div>
  );
}