'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { Ticket } from '@/types/ticket.types';
import { AuthCheck } from '@/components/auth-check';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// --- COMPONENTE DE LA TARJETA DE TICKET ---
function TicketCard({ ticket, onConfirm }: { ticket: Ticket; onConfirm: () => void }) {
  const handleConfirm = async (ticketId: string) => {
    try {
      await api.post(`/tickets/${ticketId}/confirm-attendance`);
      toast.success("¡Asistencia confirmada! Gracias.");
      onConfirm();
    } catch (error) {
      toast.error("No se pudo confirmar la asistencia.");
    }
  };

  const statusInfo = {
    valid: { text: `LISTA PARA USAR (${ticket.redeemedCount}/${ticket.quantity})`, className: 'bg-green-500/20 text-green-400' },
    partially_used: { text: `USADA PARCIALMENTE (${ticket.redeemedCount}/${ticket.quantity})`, className: 'bg-zinc-500/20 text-zinc-400' },
    used: { text: 'COMPLETAMENTE USADA', className: 'bg-zinc-500/20 text-zinc-400' },
    redeemed: { text: 'COMPLETAMENTE USADA', className: 'bg-zinc-500/20 text-zinc-400' },
    invalidated: { text: 'INVÁLIDA', className: 'bg-red-500/20 text-red-400' },
    partially_paid: { text: 'PAGO PARCIAL', className: 'bg-yellow-500/20 text-yellow-400' },
  };

  return (
    <div key={ticket.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center">
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG value={ticket.id} size={160} />
      </div>
      <h2 className="text-2xl font-bold text-white mt-6">{ticket.event.title}</h2>
      <p className="text-pink-500 font-semibold">{ticket.tier.name} (x{ticket.quantity})</p>
      <p className="text-zinc-400 text-sm mt-2">{new Date(ticket.event.startDate).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })} hs.</p>
      {ticket.tier.validUntil && (<p className="text-xs text-yellow-400 mt-1">Válido hasta: {new Date(ticket.tier.validUntil).toLocaleString('es-AR', {dateStyle: 'short', timeStyle: 'short'})} hs.</p>)}
      
      {ticket.event.confirmationSentAt && !ticket.confirmedAt ? (
        <button onClick={() => handleConfirm(ticket.id)} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg">
          Confirmar Asistencia
        </button>
      ) : (
        <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo[ticket.status]?.className || ''}`}>
          {statusInfo[ticket.status]?.text || ticket.status.toUpperCase()}
        </div>
      )}
      {ticket.confirmedAt && <p className="text-xs text-green-400 mt-1">Asistencia confirmada.</p>}
    </div>
  );
}


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function MisEntradasPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tickets/my-tickets');
      // Filtramos aquí para mostrar solo las entradas que aún son relevantes
      const validTickets = response.data.filter((t: Ticket) => t.status === 'valid' || t.status === 'partially_used');
      setTickets(validTickets);
    } catch (error) {
      toast.error('No se pudieron cargar tus entradas.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <AuthCheck>
      <h1 className="text-3xl font-bold text-white mb-6">Mis Entradas</h1>
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-pink-500" size={32} />
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onConfirm={fetchTickets} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-lg">
           <p className="text-zinc-400">Aún no tienes ninguna entrada activa.</p>
           <p className="text-zinc-500 text-sm mt-2">¡Pídesela a tu RRPP de confianza o visita la sección de eventos!</p>
        </div>
      )}
    </AuthCheck>
  );
}