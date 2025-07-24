'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { type Event } from '@/types/event.types';
import { format } from 'date-fns';

// Esquema de validación para el formulario de edición de eventos
const editEventSchema = z.object({
  title: z.string().min(3, { message: 'El título es requerido.' }),
  description: z.string().optional(),
  location: z.string().min(3, { message: 'La ubicación es requerida.' }),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de inicio inválida.',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de fin inválida.',
  }),
});

type EditEventFormInputs = z.infer<typeof editEventSchema>;

export function EditEventForm({
  event, // El evento a editar
  onClose,
  onEventUpdated,
}: {
  event: Event;
  onClose: () => void;
  onEventUpdated: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditEventFormInputs>({
    resolver: zodResolver(editEventSchema),
    // Pre-rellenar el formulario con los datos del evento
    defaultValues: {
      title: event.title,
      description: event.description || '',
      location: event.location,
      // Formatear las fechas a un formato compatible con datetime-local
      startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const onSubmit = async (data: EditEventFormInputs) => {
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      // --- LÍNEA CORREGIDA ---
      // Se añade el prefijo /api a la ruta
      await api.patch(`/events/${event.id}`, payload);
      // -----------------------

      toast.success('¡Evento actualizado exitosamente!');
      onEventUpdated(); // Llama a la función para refrescar la lista de eventos
      onClose(); // Cierra el modal
    } catch (error) {
      toast.error('Hubo un error al actualizar el evento.');
      console.error("Error updating event:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campo de Título */}
      <div>
        <label htmlFor="edit-title" className="block text-sm font-medium text-zinc-300 mb-1">Título</label>
        <input
          id="edit-title"
          {...register('title')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>
      
      {/* Resto de los campos (Descripción, Ubicación, Fechas) */}
      <div>
        <label htmlFor="edit-description" className="block text-sm font-medium text-zinc-300 mb-1">Descripción</label>
        <textarea
          id="edit-description"
          {...register('description')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
      </div>
      <div>
        <label htmlFor="edit-location" className="block text-sm font-medium text-zinc-300 mb-1">Ubicación</label>
        <input
          id="edit-location"
          {...register('location')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
        {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="edit-startDate" className="block text-sm font-medium text-zinc-300 mb-1">Fecha de Inicio</label>
          <input
            id="edit-startDate"
            type="datetime-local"
            {...register('startDate')}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
          />
          {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
        </div>
        <div className="flex-1">
          <label htmlFor="edit-endDate" className="block text-sm font-medium text-zinc-300 mb-1">Fecha de Fin</label>
          <input
            id="edit-endDate"
            type="datetime-local"
            {...register('endDate')}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
          />
          {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar Evento'}
        </button>
      </div>
    </form>
  );
}