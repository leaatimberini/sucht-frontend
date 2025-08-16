'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Trophy } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';

interface RaffleStatus {
  prizeName: string;
  deadline: string;
}

const formatTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return { days, hours, minutes, seconds };
};

export function RaffleCountdown({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<RaffleStatus | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    api.get(`/raffles/status/${eventId}`)
      .then(res => {
        setStatus(res.data);
        setTimeLeft(differenceInSeconds(new Date(res.data.deadline), new Date()));
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

  if (!status || timeLeft <= 0) {
    return null; // No mostrar nada si no hay sorteo o si ya terminó
  }
  
  const { days, hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-pink-500/10 border border-amber-400/30 rounded-lg p-6 my-8">
      <div className="text-center">
        <Trophy className="mx-auto text-amber-400 mb-2" size={32} />
        <h3 className="text-xl font-bold text-white">¡Sorteo Semanal!</h3>
        <p className="text-zinc-300 mt-2">Adquiere tu entrada antes de las 17:00hs del día del evento y participa automáticamente por:</p>
        <p className="text-amber-400 font-bold text-lg my-3">{status.prizeName}</p>
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