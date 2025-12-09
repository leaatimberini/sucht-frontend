'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { Ticket } from '@/types/ticket.types';
import { AuthCheck } from '@/components/auth-check';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Loader2, Crown } from 'lucide-react';

// --- COMPONENTE DE LA TARJETA DE TICKET (ACTUALIZADO) ---
function TicketCard({ ticket, onConfirm }: { ticket: Ticket; onConfirm: () => void }) {
  const isSpecialInvitation = ticket.origin === 'OWNER_INVITATION';
  // VIP Table Check: Tier name often contains "Sector" or productType is VIP_TABLE (but only tier data available here easily if we didn't add productType to frontend type properly, let's assume tier.productType or infer from isVipAccess + quantity > 1 or similar. Better: check isVipAccess).
  // Actually, user wants "igual que si fuera una invitacion vip".
  const isVipTable = ticket.isVipAccess || ticket.tier.name.toLowerCase().includes('sector') || ticket.tier.name.toLowerCase().includes('vip');

  const handleConfirm = async (ticketId: string) => {
    try {
      await api.post(`/tickets/${ticketId}/confirm-attendance`);
      toast.success("¡Asistencia confirmada! Gracias.");
      onConfirm();
    } catch (error) {
      toast.error("No se pudo confirmar la asistencia.");
    }
  };

  // Custom logic for status display
  const statusInfo = {
    valid: { text: `LISTA PARA USAR (${ticket.redeemedCount}/${ticket.quantity})`, className: 'bg-green-500/20 text-green-400' },
    partially_used: { text: `USADA PARCIALMENTE (${ticket.redeemedCount}/${ticket.quantity})`, className: 'bg-zinc-500/20 text-zinc-400' },
    used: { text: 'COMPLETAMENTE USADA', className: 'bg-zinc-500/20 text-zinc-400' },
    redeemed: { text: 'COMPLETAMENTE USADA', className: 'bg-zinc-500/20 text-zinc-400' },
    invalidated: { text: 'INVÁLIDA', className: 'bg-red-500/20 text-red-400' },
    partially_paid: { text: 'PAGO PARCIAL', className: 'bg-yellow-500/20 text-yellow-400' },
  };

  let statusText = statusInfo[ticket.status]?.text || ticket.status.toUpperCase();
  let statusClass = statusInfo[ticket.status]?.className || '';

  // Override for Gift / Fully Paid Manual Sales
  // If amountPaid matches price (or appropriate total), show validity clearly.
  // Using a heuristic: if status is VALID or PARTIALLY_PAID but it's a VIP Table and amountPaid > 0?
  // Let's rely on backend status 'valid' vs 'partially_paid'.
  // If backend fix works, status should be 'valid'.
  // We just need to handle the visual flair.

  return (
    // Aplicamos el borde dorado/morado si es VIP
    <div key={ticket.id} className={`bg-zinc-900 border ${isSpecialInvitation || isVipTable ? 'border-amber-400 shadow-xl shadow-amber-500/20' : 'border-zinc-800'} rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group`}>

      {/* Background Glow Effect for VIP */}
      {(isSpecialInvitation || isVipTable) && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-50 pointer-events-none" />
      )}

      {/* Helper Ribbon for Invitations or VIP */}
      {(isSpecialInvitation || isVipTable) && (
        <div className="absolute top-0 right-0 bg-amber-400 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">
          {isSpecialInvitation ? 'INVITACIÓN' : 'VIP ACCESS'}
        </div>
      )}

      {/* Añadimos el texto especial si es una invitación */}
      {isSpecialInvitation && ticket.promoter && (
        <div className="text-center mb-4 w-full border-b border-amber-400/20 pb-4 z-10">
          <p className="text-amber-400 font-bold text-sm">Invitación Especial de {ticket.promoter.name}</p>
          {ticket.specialInstructions && (
            <p className="text-white font-semibold text-lg mt-1">{ticket.specialInstructions}</p>
          )}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg mt-4 z-10 relative">
        <QRCodeSVG value={ticket.id} size={160} fgColor="#000000" bgColor="#ffffff" />
        {/* Marca de agua pequeña de logo si se quisiera */}
      </div>

      {ticket.userRewards && ticket.userRewards.length > 0 && (
        <div className="mt-4 w-full border-t border-zinc-800 pt-4 z-10">
          <p className="text-zinc-400 text-sm mb-2">Productos Incluidos:</p>
          <div className="flex flex-col gap-4 items-center">
            {ticket.userRewards.map((reward) => (
              <div key={reward.id} className="bg-white p-3 rounded-lg flex flex-col items-center">
                <QRCodeSVG value={reward.id} size={130} fgColor="#000000" bgColor="#ffffff" />
                <p className="text-black text-xs font-bold mt-1 text-center max-w-[130px] truncate">{reward.reward.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <h2 className={`text-2xl font-bold mt-6 z-10 ${isVipTable ? 'text-amber-100' : 'text-white'}`}>{ticket.event.title}</h2>
      <p className="text-pink-500 font-semibold z-10">{ticket.tier.name} (x{ticket.quantity})</p>

      {/* Añadimos el indicador de Acceso VIP si corresponde */}
      {ticket.isVipAccess && (
        <p className="flex items-center gap-2 mt-2 text-sm font-bold text-amber-400 z-10">
          <Crown size={16} /> CLIENTE VIP
        </p>
      )}

      <p className="text-zinc-400 text-sm mt-2 z-10">{new Date(ticket.event.startDate).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })} hs.</p>
      {ticket.tier.validUntil && (<p className="text-xs text-yellow-400 mt-1 z-10">Válido hasta: {new Date(ticket.tier.validUntil).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })} hs.</p>)}

      {ticket.event.confirmationSentAt && !ticket.confirmedAt ? (
        <button onClick={() => handleConfirm(ticket.id)} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg z-10 shadow-lg shadow-green-600/20">
          Confirmar Asistencia
        </button>
      ) : (
        <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold z-10 ${statusClass}`}>
          {statusText}
        </div>
      )}
      {ticket.confirmedAt && <p className="text-xs text-green-400 mt-1 z-10">Asistencia confirmada.</p>}
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
      // Ordenamos para que las invitaciones especiales (del Dueño o de Cumpleaños) aparezcan primero
      const sortedTickets = response.data.sort((a: Ticket, b: Ticket) => {
        const isASpecial = a.origin === 'OWNER_INVITATION' || a.origin === 'BIRTHDAY';
        const isBSpecial = b.origin === 'OWNER_INVITATION' || b.origin === 'BIRTHDAY';
        if (isASpecial && !isBSpecial) return -1;
        if (!isASpecial && isBSpecial) return 1;
        return 0;
      });
      const validTickets = sortedTickets.filter((t: Ticket) => t.status === 'valid' || t.status === 'partially_used' || t.status === 'partially_paid');
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