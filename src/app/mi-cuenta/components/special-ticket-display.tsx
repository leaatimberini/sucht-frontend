'use client';

import { Ticket } from "@/types/ticket.types";
import { Crown } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface SpecialTicketDisplayProps {
  ticket: Ticket;
}

export function SpecialTicketDisplay({ ticket }: SpecialTicketDisplayProps) {
  // Determinamos el texto del remitente. Si no hay promotor (dueño), usamos SUCHT por defecto.
  const senderName = ticket.promoter?.name || 'SUCHT';

  return (
    // Contenedor principal con animación de resplandor y borde dorado
    <div className="border border-amber-400/50 bg-zinc-900 rounded-2xl p-6 shadow-lg shadow-amber-500/10 animate-glow">
      <style jsx>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px #fde047, 0 0 10px #facc15, 0 0 15px #eab308; }
          50% { box-shadow: 0 0 10px #fde047, 0 0 15px #facc15, 0 0 25px #eab308; }
        }
        .animate-glow {
          animation: glow 4s ease-in-out infinite;
        }
      `}</style>

      <div className="text-center mb-4 w-full border-b border-amber-400/20 pb-4">
        <p className="text-amber-400 font-bold text-sm uppercase tracking-wider">Invitación Especial de {senderName}</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Lado del QR */}
        <div className="bg-white p-4 rounded-lg flex-shrink-0">
          <QRCodeSVG value={ticket.id} size={160} />
        </div>

        {/* Lado de la Información */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-white">{ticket.event.title}</h2>
          <p className="text-pink-400 font-semibold">{ticket.tier.name} (x{ticket.quantity})</p>
          
          {/* Instrucciones especiales */}
          {ticket.specialInstructions && (
            <p className="mt-3 text-lg font-bold text-amber-400 uppercase tracking-wide">
              {ticket.specialInstructions}
            </p>
          )}

          {/* Acceso VIP */}
          {ticket.isVipAccess && (
            <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-lg font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
              <Crown size={20} />
              <span>ACCESO VIP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}