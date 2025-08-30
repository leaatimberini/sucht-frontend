// frontend/src/components/ticket-generator.tsx
'use client';

import { Event } from "@/types/event.types";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { TicketTier } from "@/types/ticket.types";
import { CalendarDays, Loader2 } from "lucide-react";

// Esquema de validación actualizado para incluir el eventId
const generateTicketSchema = z.object({
  eventId: z.string().min(1, { message: 'Debes seleccionar un evento.' }),
  userEmail: z.string().email({ message: 'Debe ser un email válido.' }),
  ticketTierId: z.string().min(1, { message: 'Debes seleccionar un tipo de entrada.' }),
  quantity: z.coerce.number().int().min(1, { message: 'La cantidad debe ser al menos 1.' }),
});

type GenerateTicketInputs = z.infer<typeof generateTicketSchema>;

export function TicketGenerator() {
  const [events, setEvents] = useState<Event[]>([]);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(generateTicketSchema),
    defaultValues: {
      eventId: '',
      userEmail: '',
      ticketTierId: '',
      quantity: 1,
    },
  });

  // Observamos el valor del campo eventId para cargar los tiers correspondientes
  const selectedEventId = useWatch({ control, name: 'eventId' });

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
        console.error("Failed to fetch events", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // Efecto para cargar los "tiers" cuando cambia el evento seleccionado
  useEffect(() => {
    if (!selectedEventId) {
      setTiers([]);
      return;
    }

    const fetchTiers = async () => {
      setIsLoadingTiers(true);
      try {
        const response = await api.get(`/events/${selectedEventId}/ticket-tiers`);
        setTiers(response.data);
      } catch (error) {
        toast.error("No se pudieron cargar los tipos de entrada para este evento.");
        console.error("Failed to fetch ticket tiers", error);
      } finally {
        setIsLoadingTiers(false);
      }
    };
    fetchTiers();
  }, [selectedEventId]);

  const onSubmit = async (data: GenerateTicketInputs) => {
    try {
      await api.post('/tickets/generate-by-rrpp', {
        userEmail: data.userEmail,
        eventId: data.eventId, // <-- Usamos el eventId del formulario
        ticketTierId: data.ticketTierId,
        quantity: data.quantity
      });
      toast.success(`${data.quantity} entradas generadas para ${data.userEmail}!`);
      // Reseteamos el formulario excepto el evento seleccionado para agilizar la carga
      reset({
        eventId: data.eventId,
        userEmail: '',
        ticketTierId: '',
        quantity: 1,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar la entrada.');
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
        <CalendarDays size={24} />
        Generador de Entradas
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="eventId" className="block text-sm font-medium text-zinc-300 mb-1">1. Seleccionar Evento</label>
          <select
            {...register('eventId')}
            id="eventId"
            className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700 disabled:opacity-50"
            disabled={isLoadingEvents}
          >
            <option value="">{isLoadingEvents ? "Cargando..." : "Elige un evento"}</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
          {errors.eventId && <p className="text-xs text-red-500 mt-1">{errors.eventId.message}</p>}
        </div>

        <div>
          <label htmlFor="userEmail" className="block text-sm font-medium text-zinc-300 mb-1">2. Email del Cliente</label>
          <input
            {...register('userEmail')}
            id="userEmail"
            type="email"
            placeholder="cliente@email.com"
            className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"
            disabled={!selectedEventId}
          />
          {errors.userEmail && <p className="text-xs text-red-500 mt-1">{errors.userEmail.message}</p>}
        </div>

        <div>
          <label htmlFor="ticketTierId" className="block text-sm font-medium text-zinc-300 mb-1">3. Tipo de Entrada</label>
          <div className="relative">
            <select
              {...register('ticketTierId')}
              id="ticketTierId"
              className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700 disabled:opacity-50"
              disabled={!selectedEventId || isLoadingTiers || tiers.length === 0}
            >
              <option value="">{isLoadingTiers ? "Cargando tipos..." : "Selecciona un tipo..."}</option>
              {tiers.map(tier => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} ({tier.isFree ? 'GRATIS' : `$${tier.price}`})
                </option>
              ))}
            </select>
            {isLoadingTiers && <Loader2 className="animate-spin absolute right-3 top-2.5 text-zinc-400" size={20}/>}
          </div>
          {errors.ticketTierId && <p className="text-xs text-red-500 mt-1">{errors.ticketTierId.message}</p>}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-zinc-300 mb-1">4. Cantidad</label>
          <input
            {...register('quantity')}
            id="quantity"
            type="number"
            min="1"
            placeholder="1"
            className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"
            disabled={!selectedEventId}
          />
          {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting || !selectedEventId} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center">
          {isSubmitting ? <Loader2 className="animate-spin"/> : 'Generar Entradas'}
        </button>
      </form>
    </div>
  );
}