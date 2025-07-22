'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useState } from 'react';
import Image from 'next/image';
import { type Event } from '@/app/dashboard/events/page';

// El esquema de validación es el mismo, pero todos los campos son opcionales para la actualización
const editEventSchema = z.object({
  title: z.string().min(3, { message: 'El título es requerido.' }).optional(),
  description: z.string().optional(),
  location: z.string().min(3, { message: 'La ubicación es requerida.' }).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha de inicio inválida.' }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha de fin inválida.' }).optional(),
  flyerImage: z.any().optional(),
});

type EditEventFormInputs = z.infer<typeof editEventSchema>;

const API_URL = 'http://localhost:8000';

export function EditEventForm({
  event,
  onClose,
  onEventUpdated,
}: {
  event: Event;
  onClose: () => void;
  onEventUpdated: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(
    event.flyerImageUrl ? `${API_URL}${event.flyerImageUrl}` : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditEventFormInputs>({
    resolver: zodResolver(editEventSchema),
    // Pre-rellenamos el formulario con los datos del evento
    defaultValues: {
      title: event.title,
      description: event.description || '',
      location: event.location,
      startDate: new Date(event.startDate).toISOString().substring(0, 16),
      endDate: new Date(event.endDate).toISOString().substring(0, 16),
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (data: EditEventFormInputs) => {
    const formData = new FormData();
    // Añadimos solo los campos que el usuario podría haber cambiado
    if (data.title) formData.append('title', data.title);
    if (data.location) formData.append('location', data.location);
    if (data.startDate) formData.append('startDate', new Date(data.startDate).toISOString());
    if (data.endDate) formData.append('endDate', new Date(data.endDate).toISOString());
    if (data.description) formData.append('description', data.description);
    if (data.flyerImage && data.flyerImage[0]) {
      formData.append('flyerImage', data.flyerImage[0]);
    }

    try {
      await api.patch(`/events/${event.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('¡Evento actualizado exitosamente!');
      onEventUpdated();
      onClose();
    } catch (error) {
      toast.error('Hubo un error al actualizar el evento.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ... El JSX del formulario es idéntico al de CreateEventForm ... */}
        {/* Campo de Título */}
        <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-1">Título</label>
            <input id="title" {...register('title')} className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"/>
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>
        {/* Campo de Descripción */}
        <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1">Descripción</label>
            <textarea id="description" {...register('description')} className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"/>
        </div>
        {/* Campo de Ubicación */}
        <div>
            <label htmlFor="location" className="block text-sm font-medium text-zinc-300 mb-1">Ubicación</label>
            <input id="location" {...register('location')} className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"/>
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
        </div>
        {/* Campos de Fecha */}
        <div className="flex space-x-4">
            <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-zinc-300 mb-1">Fecha de Inicio</label>
                <input id="startDate" type="datetime-local" {...register('startDate')} className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"/>
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
            </div>
            <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-zinc-300 mb-1">Fecha de Fin</label>
                <input id="endDate" type="datetime-local" {...register('endDate')} className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"/>
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
            </div>
        </div>
        {/* Campo de Flyer */}
        <div>
            <label htmlFor="flyerImage" className="block text-sm font-medium text-zinc-300 mb-1">Cambiar Flyer (Opcional)</label>
            <input id="flyerImage" type="file" accept="image/png, image/jpeg, image/jpg" {...register('flyerImage')} onChange={handleFileChange} className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"/>
            {preview && (
                <div className="mt-4"><p className="text-sm text-zinc-400 mb-2">Vista previa:</p>
                <Image src={preview} alt="Vista previa del flyer" width={200} height={300} className="rounded-lg object-contain" style={{ height: 'auto' }}/>
                </div>
            )}
        </div>
        {/* Botón de Envío */}
        <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </div>
    </form>
  );
}