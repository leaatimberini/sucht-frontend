'use client';

// 1. Se añade 'useCallback' a la importación
import { useEffect, useState, useCallback } from "react";
import { Event } from "@/types/event.types";
import api from "@/lib/axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { TicketTier } from "@/types/ticket.types";

const generateTicketSchema = z.object({
  userEmail: z.string().email({ message: 'Debe ser un email válido.' }),
  ticketTierId: z.string().min(1, { message: 'Debes seleccionar un tipo de entrada.' }),
});

type GenerateTicketInputs = z.infer<typeof generateTicketSchema>;

export function TicketGenerator({ event }: { event: Event }) {
  const [tiers, setTiers] = useState<TicketTier[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<GenerateTicketInputs>({
    resolver: zodResolver(generateTicketSchema)
  });

  // 2. Se envuelve la función en useCallback
  const fetchTiers = useCallback(async () => {
    try {
      // --- LÍNEA CORREGIDA ---
      const response = await api.get(`/api/events/${event.id}/ticket-tiers`);
      // -----------------------
      setTiers(response.data);
    } catch (error) {
      console.error("Failed to fetch ticket tiers", error);
    }
  }, [event.id]); // La función depende de event.id

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]); // 3. Se añade la función a la lista de dependencias

  const onSubmit = async (data: GenerateTicketInputs) => {
    try {
      await api.post('/api/tickets', {
        userEmail: data.userEmail,
        eventId: event.id,
        ticketTierId: data.ticketTierId,
      });
      toast.success(`Entrada generada para ${data.userEmail}!`);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar la entrada.');
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white">{event.title}</h2>
      <p className="text-sm text-zinc-400 mb-4">{new Date(event.startDate).toLocaleDateString('es-AR', { dateStyle: 'full' })}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor={`email-${event.id}`} className="block text-sm font-medium text-zinc-300 mb-1">Email del Cliente</label>
          <input
            {...register('userEmail')}
            id={`email-${event.id}`}
            type="email"
            placeholder="cliente@email.com"
            className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"
          />
          {errors.userEmail && <p className="text-xs text-red-500 mt-1">{errors.userEmail.message}</p>}
        </div>

        <div>
          <label htmlFor={`tier-${event.id}`} className="block text-sm font-medium text-zinc-300 mb-1">Tipo de Entrada</label>
          <select
            {...register('ticketTierId')}
            id={`tier-${event.id}`}
            className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"
            disabled={tiers.length === 0}
          >
            <option value="">Selecciona un tipo...</option>
            {tiers.map(tier => (
              <option key={tier.id} value={tier.id}>
                {tier.name} (${tier.price}) - Quedan: {tier.quantity}
              </option>
            ))}
          </select>
          {errors.ticketTierId && <p className="text-xs text-red-500 mt-1">{errors.ticketTierId.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Generando...' : 'Generar Entrada'}
        </button>
      </form>
    </div>
  );
}