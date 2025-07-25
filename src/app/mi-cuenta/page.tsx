'use client';

import { AuthCheck } from "@/components/auth-check";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { Ticket } from "@/types/ticket.types";
import { useEffect, useState } from "react";
import { QRCodeSVG } from 'qrcode.react';

export default function MiCuentaPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await api.get('/tickets/my-tickets');
        setTickets(response.data);
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [user]);

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-2">Hola, {user?.email.split('@')[0]}</h1>
        <p className="text-zinc-400 mb-8">Aquí encontrarás todas tus entradas. ¡Prepárate para la fiesta!</p>

        {isLoading ? (
          <p className="text-zinc-500">Cargando tus entradas...</p>
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={ticket.id} size={160} />
                </div>
                <h2 className="text-2xl font-bold text-white mt-6">{ticket.event.title}</h2>
                <p className="text-pink-500 font-semibold">{ticket.tier.name}</p>
                <p className="text-zinc-400 text-sm mt-2">
                  {new Date(ticket.event.startDate).toLocaleDateString('es-AR', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })} hs.
                </p>
                <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold ${
                  ticket.status === 'valid' ? 'bg-green-500/20 text-green-400' :
                  ticket.status === 'used' ? 'bg-zinc-500/20 text-zinc-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {ticket.status === 'valid' ? 'LISTA PARA USAR' : 'YA UTILIZADA'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-10">Aún no tienes ninguna entrada. ¡Pídesela a tu RRPP de confianza!</p>
        )}
      </div>
    </AuthCheck>
  );
}