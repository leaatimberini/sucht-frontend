'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { Loader2, Send, Crown, Ticket, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';

// Interfaz para el tipo de dato Evento
interface Event {
  id: string;
  title: string;
  startDate: string;
}

// Esquema de validación actualizado para incluir el evento
const invitationSchema = z.object({
  email: z.string().email({ message: 'Debe ser un correo electrónico válido.' }),
  eventId: z.string().min(1, { message: 'Debes seleccionar un evento.' }), // <-- CAMPO NUEVO
  guestCount: z.coerce.number().int().min(0, "Debe ser 0 o más.").max(10, "Máximo 10 acompañantes."),
  isVipAccess: z.boolean().optional(),
});

type InvitationFormInputs = z.infer<typeof invitationSchema>;

export default function OrganizerInvitationsPage() {
  const [events, setEvents] = useState<Event[]>([]); // <-- ESTADO PARA EVENTOS
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      eventId: '', // <-- Valor por defecto
      guestCount: 0,
      isVipAccess: false,
    },
  });

  // Efecto para cargar los eventos al montar el componente
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        const futureEvents = response.data.filter(
          (event: Event) => new Date(event.startDate) > new Date()
        );
        setEvents(futureEvents);
      } catch (error) {
        toast.error("No se pudieron cargar los eventos.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);


  const onSubmit = async (data: InvitationFormInputs) => {
    try {
      // Llamamos al endpoint específico del Organizador con el payload completo
      await api.post('/organizer/invitations', data); // <-- 'data' ya incluye eventId
      toast.success(`¡Invitación enviada a ${data.email}!`);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar la invitación.');
    }
  };

  return (
    <AuthCheck allowedRoles={[UserRole.ORGANIZER, UserRole.ADMIN]}>
      <div className="space-y-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white">Enviar Invitaciones</h1>
          <p className="text-zinc-400 mt-2">Envía una invitación de cortesía con acceso preferencial a tus invitados.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">1. Email del Invitado</h2>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
              <input {...register('email')} id="email" type="email" placeholder="invitado@email.com" className="w-full bg-zinc-800 rounded-md p-2 text-white placeholder-zinc-500 border border-transparent focus:border-blue-600 focus:ring-0" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* --- NUEVA SECCIÓN PARA SELECCIONAR EVENTO --- */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><CalendarDays size={20} /> 2. Evento</h2>
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-zinc-300 mb-1">Seleccionar Evento</label>
              <select
                {...register('eventId')}
                id="eventId"
                className="w-full bg-zinc-800 rounded-md p-2 text-white border border-transparent focus:border-blue-600 focus:ring-0 disabled:opacity-50"
                disabled={isLoading || events.length === 0}
              >
                <option value="" disabled>
                  {isLoading ? "Cargando eventos..." : "Elige un evento"}
                </option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
              {events.length === 0 && !isLoading && <p className="text-amber-500 text-xs mt-1">No hay eventos futuros disponibles para crear invitaciones.</p>}
              {errors.eventId && <p className="text-red-500 text-xs mt-1">{errors.eventId.message}</p>}
            </div>
          </div>
          {/* --- FIN DE LA NUEVA SECCIÓN --- */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4"><Ticket size={20} /> 3. Detalles de la Entrada</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="guestCount" className="block text-sm font-medium text-zinc-300 mb-1">Nº de Acompañantes (además del invitado principal)</label>
                <input {...register('guestCount')} id="guestCount" type="number" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-transparent focus:border-blue-600 focus:ring-0" />
                {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount.message}</p>}
              </div>
              <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-md">
                <label htmlFor="isVipAccess" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Crown size={16} className="text-amber-400" />
                  Otorgar Acceso VIP
                </label>
                <Controller
                  name="isVipAccess"
                  control={control}
                  render={({ field }) => (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={!!field.value} onChange={field.onChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 text-lg disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={20}/> Enviar Invitación</>}
            </button>
          </div>
        </form>
      </div>
    </AuthCheck>
  );
}