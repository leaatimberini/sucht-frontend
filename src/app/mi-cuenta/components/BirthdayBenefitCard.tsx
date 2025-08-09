'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Gift, Users, Loader, Ticket } from 'lucide-react';
import { Event } from '@/types/event.types';
import { QRCodeSVG } from 'qrcode.react';

// Tipos para la respuesta de los beneficios (según lo que devuelve tu backend)
interface BirthdayTicket {
  id: string;
  tier: { name: string };
}
interface BirthdayGift {
  id: string;
}

interface BirthdayBenefitCardProps {
  events: Event[]; // ahora lo recibe como prop
}

export function BirthdayBenefitCard({ events }: BirthdayBenefitCardProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [guestCount, setGuestCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [groupTicket, setGroupTicket] = useState<BirthdayTicket | null>(null);
  const [giftQr, setGiftQr] = useState<BirthdayGift | null>(null);

  // Si el prop llega con eventos, preselecciono el primero para mejor UX
  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const handleClaimGroupEntry = async () => {
    if (!selectedEventId) {
      toast.error('Por favor, selecciona un evento para festejar.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/birthday-benefits/claim-group-entry', {
        eventId: selectedEventId,
        guestCount: Number(guestCount),
      });
      setGroupTicket(response.data);
      toast.success('¡Tu QR de ingreso grupal ha sido generado!');
    } catch (error: any) {
      console.error('Failed to claim group entry benefit', error);
      toast.error(error?.response?.data?.message || 'No se pudo generar el beneficio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimGift = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/birthday-benefits/claim-champagne-gift');
      setGiftQr(response.data);
      toast.success('¡Tu QR de regalo ha sido generado!');
    } catch (error: any) {
      console.error('Failed to claim champagne gift', error);
      toast.error(error?.response?.data?.message || 'No se pudo generar el regalo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border-2 border-amber-400/50 rounded-lg p-6 space-y-6 mb-8 shadow-lg shadow-amber-500/10">
      <div className="text-center">
        <Gift className="mx-auto h-12 w-12 text-amber-400" />
        <h2 className="text-2xl font-bold text-white mt-2">¡Feliz Cumpleaños!</h2>
        <p className="text-zinc-400">Celebra con nosotros. Tienes beneficios especiales disponibles esta semana.</p>
      </div>

      {/* Beneficio de Ingreso Grupal */}
      <div className="bg-zinc-800 p-4 rounded-lg">
        <h3 className="font-semibold text-white flex items-center gap-2"><Users size={18} /> Ingreso para tu grupo</h3>
        {groupTicket ? (
          <div className="flex flex-col items-center text-center mt-4">
            <div className="bg-white p-2 rounded-lg"><QRCodeSVG value={groupTicket.id} size={128} /></div>
            <p className="text-white font-bold mt-2">{groupTicket.tier?.name}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="event-selector" className="block text-sm font-medium text-zinc-300 mb-1">Selecciona el evento para festejar</label>
              <select id="event-selector" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="w-full bg-zinc-700 rounded-md p-2">
                <option value="">Selecciona un evento...</option>
                {events.map(event => (<option key={event.id} value={event.id}>{(event as any).title || (event as any).name}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="guest-count" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad de invitados (además de vos)</label>
              <input type="number" id="guest-count" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} min={0} className="w-full bg-zinc-700 rounded-md p-2" />
            </div>
            <button onClick={handleClaimGroupEntry} disabled={isLoading || !selectedEventId} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg disabled:opacity-50">
              {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Generar QR de Ingreso'}
            </button>
          </div>
        )}
      </div>

      {/* Beneficio de Regalo */}
      <div className="bg-zinc-800 p-4 rounded-lg">
        <h3 className="font-semibold text-white flex items-center gap-2"><Ticket size={18} /> Tu Regalo: Champagne</h3>
        {giftQr ? (
          <div className="flex flex-col items-center text-center mt-4">
            <div className="bg-white p-2 rounded-lg"><QRCodeSVG value={giftQr.id} size={128} /></div>
            <p className="text-white font-bold mt-2">Presenta este QR en la barra</p>
          </div>
        ) : (
          <button onClick={handleClaimGift} disabled={isLoading} className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 rounded-lg disabled:opacity-50">
            {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Generar QR de Regalo'}
          </button>
        )}
      </div>
    </div>
  );
}
