// SpecialTicketDisplay.tsx
'use client';

import { Ticket } from "@/types/ticket.types";
import { Crown, PartyPopper } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface SpecialTicketDisplayProps {
  ticket: Ticket;
}

export function SpecialTicketDisplay({ ticket }: SpecialTicketDisplayProps) {
  const isOwnerInvitation = ticket.origin === 'OWNER_INVITATION';
  const isBirthdayBenefit = ticket.origin === 'BIRTHDAY';

  // Determinamos el texto del remitente.
  const senderName = ticket.promoter?.name || 'SUCHT';
  const title = isOwnerInvitation ? `Invitación Especial de ${senderName}` : `¡Tu Beneficio de Cumpleaños!`;
  const iconColor = isOwnerInvitation ? 'text-amber-400' : 'text-pink-400';
  const borderColor = isOwnerInvitation ? 'border-amber-400/50' : 'border-pink-400/50';
  const shadowColor = isOwnerInvitation ? 'shadow-amber-500/10' : 'shadow-pink-500/10';


  return (
    <div className={`border ${borderColor} bg-zinc-900 rounded-2xl p-6 shadow-lg ${shadowColor} animate-glow`}>
      <style jsx>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px ${isOwnerInvitation ? '#fde047' : '#ec4899'}, 0 0 10px ${isOwnerInvitation ? '#facc15' : '#db2777'}, 0 0 15px ${isOwnerInvitation ? '#eab308' : '#be185d'}; }
          50% { box-shadow: 0 0 10px ${isOwnerInvitation ? '#fde047' : '#ec4899'}, 0 0 15px ${isOwnerInvitation ? '#facc15' : '#db2777'}, 0 0 25px ${isOwnerInvitation ? '#eab308' : '#be185d'}; }
        }
        .animate-glow {
          animation: glow 4s ease-in-out infinite;
        }
      `}</style>

      <div className="text-center mb-4 w-full border-b ${borderColor}/50 pb-4">
        <p className={`font-bold text-sm uppercase tracking-wider ${iconColor}`}>{title}</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="bg-white p-4 rounded-lg flex-shrink-0">
          <QRCodeSVG value={ticket.id} size={160} fgColor="#000000" bgColor="#ffffff" />
        </div>

        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-white">{ticket.event.title}</h2>

          {/* CORRECCIÓN: Mostramos un texto más apropiado para invitaciones */}
          <p className="text-pink-400 font-semibold">{isOwnerInvitation || isBirthdayBenefit ? `Entrada General (x${ticket.quantity})` : `${ticket.tier.name} (x${ticket.quantity})`}</p>

          {ticket.specialInstructions && (
            <p className="mt-3 text-lg font-bold text-amber-400 uppercase tracking-wide">
              {ticket.specialInstructions}
            </p>
          )}

          {ticket.isVipAccess && (
            <div className="mt-3 inline-flex items-center justify-center md:justify-start gap-2 text-lg font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
              <Crown size={20} />
              <span>ACCESO VIP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}