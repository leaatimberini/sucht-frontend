'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { Event } from '@/types/event.types';
import { Loader2, Edit, X, PartyPopper, CheckCircle, XCircle, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

// --- TIPOS DE DATOS ---
interface BirthdaySummary {
  user: {
    id: string;
    name: string;
    email: string;
  };
  ticket: {
    id: string;
    guestLimit: number;
    guestsEntered: number;
    isEntryClaimed: boolean;
  };
  reward: {
    name: string;
    isGiftClaimed: boolean;
  };
}

// --- SUB-COMPONENTES DE LA PÁGINA ---

function EditGuestLimitModal({ summary, onClose, onUpdated }: { summary: BirthdaySummary, onClose: () => void, onUpdated: () => void }) {
  const [guestLimit, setGuestLimit] = useState(summary.ticket.guestLimit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.patch(`/admin/birthday/ticket/${summary.ticket.id}`, { guestLimit });
      toast.success('Límite de invitados actualizado.');
      onUpdated();
      onClose();
    } catch (error) {
      toast.error('No se pudo actualizar el límite.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>
        <h3 className="text-xl font-bold text-white mb-2">Editar Invitados</h3>
        <p className="text-zinc-400 mb-6">Estás editando el beneficio de <span className="font-semibold text-white">{summary.user.name}</span>.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="guestLimit" className="block text-sm font-medium text-zinc-300 mb-1">Nuevo límite de invitados</label>
            <input
              id="guestLimit"
              type="number"
              value={guestLimit}
              onChange={(e) => setGuestLimit(parseInt(e.target.value, 10))}
              className="w-full bg-zinc-800 rounded-md p-2"
              min="0"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
            {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function AdminBirthdayPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<BirthdaySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSummary, setEditingSummary] = useState<BirthdaySummary | null>(null);

  useEffect(() => {
    api.get('/events').then(res => {
        setEvents(res.data)
        // Seleccionar el evento más próximo por defecto
        const nextEvent = res.data.find((e: Event) => new Date(e.startDate) > new Date());
        if (nextEvent) {
            setSelectedEventId(nextEvent.id);
        }
    });
  }, []);

  const fetchSummary = useCallback(async () => {
    if (!selectedEventId) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/birthday/summary?eventId=${selectedEventId}`);
      setSummaryData(response.data);
    } catch (error) {
      toast.error('No se pudo cargar el resumen de cumpleaños.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.ORGANIZER]}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <PartyPopper className="text-pink-400"/>
                Gestión de Cumpleaños
            </h1>
            <p className="text-zinc-400 mt-1">Revisa los beneficios reclamados por evento.</p>
        </div>
        
        <div className="mb-6 max-w-xs">
          <label htmlFor="event-selector" className="block text-sm font-medium text-zinc-300 mb-1">Selecciona un Evento</label>
          <select 
            id="event-selector"
            value={selectedEventId || ''}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2"
          >
            <option value="" disabled>Elige un evento...</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-zinc-700">
                <tr>
                    <th className="p-4 text-sm font-semibold text-white">Cumpleañero/a</th>
                    <th className="p-4 text-sm font-semibold text-white text-center">Invitados</th>
                    <th className="p-4 text-sm font-semibold text-white text-center">Ingresaron</th>
                    <th className="p-4 text-sm font-semibold text-white">Regalo</th>
                    <th className="p-4 text-sm font-semibold text-white">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <tr><td colSpan={5} className="text-center p-6 text-zinc-400"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : summaryData.length > 0 ? (
                    summaryData.map((summary) => (
                    <tr key={summary.user.id} className="border-b border-zinc-800 last:border-b-0">
                        <td className="p-4"><p className="font-semibold text-zinc-200">{summary.user.name}</p><p className="text-sm text-zinc-500">{summary.user.email}</p></td>
                        <td className="p-4 text-center text-zinc-300">{summary.ticket.guestLimit}</td>
                        <td className="p-4 text-center font-bold text-white">{summary.ticket.guestsEntered}</td>
                        <td className="p-4">
                        <span className={`flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full ${summary.reward.isGiftClaimed ? 'bg-zinc-500/20 text-zinc-400' : 'bg-green-500/20 text-green-400'}`}>
                            {summary.reward.isGiftClaimed ? <CheckCircle size={14}/> : <Gift size={14}/>}
                            {summary.reward.isGiftClaimed ? 'Canjeado' : 'Pendiente'}
                        </span>
                        </td>
                        <td className="p-4">
                        <button onClick={() => setEditingSummary(summary)} className="text-pink-400 hover:text-pink-30á00 flex items-center gap-2"><Edit size={16} /> Editar</button>
                        </td>
                    </tr>
                ))
                ) : (
                    <tr><td colSpan={5} className="text-center p-6 text-zinc-500">No se reclamaron beneficios de cumpleaños para este evento.</td></tr>
                )}
                </tbody>
            </table>
        </div>
        
        {editingSummary && <EditGuestLimitModal summary={editingSummary} onClose={() => setEditingSummary(null)} onUpdated={fetchSummary} />}
      </div>
    </AuthCheck>
  );
}