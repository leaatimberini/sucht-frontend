// src/app/mi-cuenta/components/MisEntradasTab.tsx
'use client';

import { Ticket } from "@/types/ticket.types";
import { QRCodeSVG } from 'qrcode.react';
import api from "@/lib/axios";
import toast from "react-hot-toast";

export function MisEntradasTab({ tickets, onConfirm }: { tickets: Ticket[], onConfirm: () => void }) {
  const handleConfirm = async (ticketId: string) => {
    try {
      await api.post(`/tickets/${ticketId}/confirm-attendance`);
      toast.success("¡Asistencia confirmada! Gracias.");
      onConfirm();
    } catch (error) {
      toast.error("No se pudo confirmar la asistencia.");
    }
  };

  if (tickets.length === 0) {
    return <p className="text-zinc-500 text-center py-10">Aún no tienes ninguna entrada. ¡Pídesela a tu RRPP de confianza!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="bg-white p-4 rounded-lg"><QRCodeSVG value={ticket.id} size={160} /></div>
          <h2 className="text-2xl font-bold text-white mt-6">{ticket.event.title}</h2>
          <p className="text-pink-500 font-semibold">{ticket.tier.name} (x{ticket.quantity})</p>
          <p className="text-zinc-400 text-sm mt-2">{new Date(ticket.event.startDate).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })} hs.</p>
          {ticket.tier.validUntil && (<p className="text-xs text-yellow-400 mt-1">Válido hasta: {new Date(ticket.tier.validUntil).toLocaleString('es-AR', {dateStyle: 'short', timeStyle: 'short'})} hs.</p>)}
          
          {ticket.event.confirmationSentAt && !ticket.confirmedAt ? (
            <button onClick={() => handleConfirm(ticket.id)} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg">
              Confirmar Asistencia
            </button>
          ) : (
            <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold ${
              ticket.status === 'valid' ? 'bg-green-500/20 text-green-400' :
              ticket.status === 'used' || ticket.status === 'redeemed' || ticket.status === 'partially_used' ? 'bg-zinc-500/20 text-zinc-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {ticket.status === 'valid' && `LISTA PARA USAR (${ticket.redeemedCount}/${ticket.quantity})`}
              {ticket.status === 'partially_used' && `USADA PARCIALMENTE (${ticket.redeemedCount}/${ticket.quantity})`}
              {ticket.status === 'used' && `COMPLETAMENTE USADA`}
              {ticket.status === 'redeemed' && `COMPLETAMENTE USADA`}
            </div>
          )}
          {ticket.confirmedAt && <p className="text-xs text-green-400 mt-1">Asistencia confirmada.</p>}
        </div>
      ))}
    </div>
  );
}