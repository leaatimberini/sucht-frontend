'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Trophy, Gift } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';

// --- NUEVAS INTERFACES PARA MANEJAR LA RESPUESTA DE LA API ---
interface Prize {
  prizeRank: number;
  product: { name: string; };
}
interface Winner {
  user: { name: string; };
  prize: Prize;
}
interface RaffleStatus {
  id: string;
  status: 'pending' | 'completed';
  drawDate: string; // ISO String
  prizes: Prize[];
  winners: Winner[];
}

const formatTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return { days, hours, minutes, seconds };
};

export function RaffleCountdown({ eventId }: { eventId: string }) {
  const [raffle, setRaffle] = useState<RaffleStatus | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Usamos el nuevo endpoint para obtener la info del sorteo
    api.get(`/raffles/event/${eventId}`)
      .then(res => {
        if (res.data) {
          setRaffle(res.data);
          setTimeLeft(differenceInSeconds(parseISO(res.data.drawDate), new Date()));
        }
      })
      .catch(err => console.error("No raffle configured for this event."));
  }, [eventId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Si no hay sorteo, no mostramos nada
  if (!raffle) {
    return null;
  }
  
  // --- LÓGICA DE VISUALIZACIÓN ---

  // Si el sorteo está PENDIENTE y aún queda tiempo, mostramos el contador
  if (raffle.status === 'pending' && timeLeft > 0) {
    const { days, hours, minutes, seconds } = formatTime(timeLeft);
    return (
      <div className="bg-gradient-to-r from-amber-500/10 to-pink-500/10 border border-amber-400/30 rounded-lg p-6 my-8">
        <div className="text-center">
          <Trophy className="mx-auto text-amber-400 mb-2" size={32} />
          <h3 className="text-xl font-bold text-white">¡Sorteo del Evento!</h3>
          <p className="text-zinc-300 mt-2">Adquiere tu entrada y participa automáticamente por:</p>
          <div className="text-amber-400 font-bold text-lg my-3 space-y-1">
            {raffle.prizes.sort((a, b) => a.prizeRank - b.prizeRank).map(p => (
                <p key={p.prizeRank}>- {p.product.name} -</p>
            ))}
          </div>
          <div className="flex justify-center gap-4 text-white">
            <div><span className="text-2xl font-bold">{String(days).padStart(2, '0')}</span><span className="text-xs block">DÍAS</span></div>
            <div><span className="text-2xl font-bold">{String(hours).padStart(2, '0')}</span><span className="text-xs block">HS</span></div>
            <div><span className="text-2xl font-bold">{String(minutes).padStart(2, '0')}</span><span className="text-xs block">MIN</span></div>
            <div><span className="text-2xl font-bold">{String(seconds).padStart(2, '0')}</span><span className="text-xs block">SEG</span></div>
          </div>
          <p className="text-xs text-zinc-500 mt-4">Mesa VIP: 3 chances | Entrada Paga: 2 chances | Entrada Free: 1 chance</p>
        </div>
      </div>
    );
  }

  // Si el sorteo está COMPLETADO, mostramos los ganadores
  if (raffle.status === 'completed' && raffle.winners.length > 0) {
    return (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-lg p-6 my-8">
            <div className="text-center">
                <Gift className="mx-auto text-blue-400 mb-2" size={32} />
                <h3 className="text-xl font-bold text-white">¡Ganadores del Sorteo!</h3>
                <p className="text-zinc-300 mt-2">¡Felicitaciones a los afortunados!</p>
                <div className="text-left mt-4 bg-zinc-900/50 rounded-lg p-4 space-y-3">
                    {raffle.winners.sort((a, b) => a.prize.prizeRank - b.prize.prizeRank).map(winner => (
                        <div key={winner.user.name}>
                            <p className="font-bold text-white">{winner.user.name}</p>
                            <p className="text-sm text-blue-400">Ganó: {winner.prize.product.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
  }

  // Si ninguna de las condiciones se cumple (ej. sorteo pendiente pero sin tiempo), no mostramos nada.
  return null;
}