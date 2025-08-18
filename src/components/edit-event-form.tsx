'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { type Event } from '@/types/event.types';
import { format } from 'date-fns';
import { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

const editEventSchema = z.object({
  title: z.string().min(3, { message: 'El título es requerido.' }),
  description: z.string().optional(),
  location: z.string().min(3, { message: 'La ubicación es requerida.' }),
  startDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: 'Fecha de inicio inválida.',
  }),
  endDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: 'Fecha de fin inválida.',
  }),
  publishAt: z.string().optional(),
  flyerImage: z.any().optional(),
});

type EditEventFormInputs = z.infer<typeof editEventSchema>;

const safeFormat = (date: any, formatString: string) => {
    try {
        // Usamos new Date() que es la forma correcta de parsear la fecha
        return format(new Date(date), formatString);
    } catch {
        return '';
    }
};

export function EditEventForm({ event, onClose, onEventUpdated }: { event: Event; onClose: () => void; onEventUpdated: () => void; }) {
  const [preview, setPreview] = useState<string | null>(event.flyerImageUrl);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditEventFormInputs>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description || '',
      location: event.location,
      startDate: safeFormat(event.startDate, "yyyy-MM-dd'T'HH:mm"),
      endDate: safeFormat(event.endDate, "yyyy-MM-dd'T'HH:mm"),
      publishAt: event.publishAt ? safeFormat(event.publishAt, "yyyy-MM-dd'T'HH:mm") : '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(event.flyerImageUrl);
    }
  };

  const onSubmit = async (data: EditEventFormInputs) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('location', data.location);
    formData.append('startDate', new Date(data.startDate).toISOString());
    formData.append('endDate', new Date(data.endDate).toISOString());

    if (data.description) formData.append('description', data.description);
    if (data.publishAt) formData.append('publishAt', new Date(data.publishAt).toISOString());
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
      console.error("Error updating event:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="edit-title" className="block text-sm font-medium text-zinc-300 mb-1">Título</label>
        <input
          id="edit-title"
          {...register('title')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>
      
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

      <div>
        <label htmlFor="edit-publishAt" className="block text-sm font-medium text-zinc-300 mb-1">Fecha de Publicación</label>
        <input
          id="edit-publishAt"
          type="datetime-local"
          {...register('publishAt')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
      </div>

      <div>
        <label htmlFor="edit-flyerImage" className="block text-sm font-medium text-zinc-300 mb-1">Cambiar Flyer (Opcional)</label>
        <input
          id="edit-flyerImage"
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          {...register('flyerImage')}
          onChange={handleFileChange}
          className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
        />
        {preview && (
          <div className="mt-4">
            <p className="text-sm text-zinc-400 mb-2">Vista previa:</p>
            <Image
              src={preview}
              alt="Vista previa del flyer"
              width={200}
              height={300}
              className="rounded-lg object-contain"
              style={{ height: 'auto' }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Actualizar Evento'}
        </button>
      </div>
    </form>
  );
}