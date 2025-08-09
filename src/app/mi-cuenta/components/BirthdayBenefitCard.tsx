'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Gift, Users, Loader } from 'lucide-react';
import { Event } from '@/types/event.types';
import { Ticket } from '@/types/ticket.types';

export function BirthdayBenefitCard({ events }: { events: Event[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [guestCount, setGuestCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
  const [giftQrId, setGiftQrId] = useState<string | null>(null);

  const handleClaimGroupEntry = async () => {
    if (!selectedEventId) {
      toast.error('Por favor, selecciona un evento.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/birthday-benefits/claim-group-entry', {
        eventId: selectedEventId,
        guestCount: guestCount,
      });
      setGeneratedTicket(response.data);
      toast.success('¡Tu QR de ingreso grupal ha sido generado!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'No se pudo generar el beneficio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimGift = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/birthday-benefits/claim-champagne-gift');
      setGiftQrId(response.data.id);
      toast.success('¡Tu QR de regalo ha sido generado!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'No se pudo generar el regalo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-amber-400/50 rounded-lg p-6 space-y-6">
      <div className="text-center">
        <Gift className="mx-auto h-12 w-12 text-amber-400" />
        <h2 className="text-2xl font-bold text-white mt-2">¡Feliz Cumpleaños!</h2>
        <p className="text-zinc-400">Celebra con nosotros. Tienes beneficios especiales disponibles esta semana.</p>
      </div>

      {/* Beneficio de Ingreso Grupal */}
      <div className="bg-zinc-800 p-4 rounded-lg">
        <h3 className="font-semibold text-white flex items-center gap-2"><Users size={18} /> Ingreso para tu grupo</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="event-selector" className="block text-sm font-medium text-zinc-300 mb-1">
              Selecciona el evento para festejar
            </label>
            <select
              id="event-selector"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-zinc-700 rounded-md p-2"
            >
              <option value="">Selecciona un evento...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="guest-count" className="block text-sm font-medium text-zinc-300 mb-1">
              Cantidad de invitados (además de vos)
            </label>
            <input
              type="number"
              id="guest-count"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value))}
              min="0"
              className="w-full bg-zinc-700 rounded-md p-2"
            />
          </div>
          <button
            onClick={handleClaimGroupEntry}
            disabled={isLoading || !selectedEventId}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg disabled:opacity-50"
          >
            {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Generar QR de Ingreso'}
          </button>
        </div>
      </div>

      {/* Beneficio de Regalo */}
      <div className="bg-zinc-800 p-4 rounded-lg">
        <h3 className="font-semibold text-white">Tu Regalo: Champagne</h3>
        <button
          onClick={handleClaimGift}
          disabled={isLoading}
          className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 rounded-lg disabled:opacity-50"
        >
          {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Generar QR de Regalo'}
        </button>
      </div>
    </div>
  );
}