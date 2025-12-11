'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useState } from 'react';
import Image from 'next/image';
import { ProductType } from '@/types/ticket.types';
import { parseBuenosAiresToISO } from '@/lib/date-utils';
import { Loader2, Sparkles } from 'lucide-react';

const createEventSchema = z.object({
  title: z.string().min(3, { message: 'El título es requerido.' }),
  description: z.string().optional(),
  location: z.string().min(3, { message: 'La ubicación es requerida.' }),
  startDate: z.string().refine((val) => val, {
    message: 'Fecha de inicio inválida.',
  }),
  endDate: z.string().refine((val) => val, {
    message: 'Fecha de fin inválida.',
  }),
  flyerImage: z.any().optional(),
  // --- NUEVO CAMPO ---
  publishAt: z.string().optional(),
});

type CreateEventFormInputs = z.infer<typeof createEventSchema>;

export function CreateEventForm({
  onClose,
  onEventCreated,
}: {
  onClose: () => void;
  onEventCreated: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormInputs>({
    resolver: zodResolver(createEventSchema),
  });

  const handleGenerateDescription = async () => {
    const title = watch('title');
    const location = watch('location');

    if (!title || !location) {
      toast.error('Por favor ingresa título y ubicación primero');
      return;
    }

    setIsGeneratingAI(true);
    try {
      // Generate a generic description based on title and location
      const description = `🎉 ¡Prepárate para vivir una noche inolvidable! ${title} te espera en ${location}.

Esta es tu oportunidad de disfrutar de la mejor música, ambiente increíble y una experiencia única que no te podés perder. 🔥

Reunite con tus amigos y viví la noche más épica del mes. Las entradas son limitadas, así que no esperes más para asegurar tu lugar en este evento imperdible. 💃🕺

¡Comprá tus entradas ahora y prepárate para una noche que vas a recordar siempre!`;

      setValue('description', description);
      toast.success('✨ Descripción generada con IA');
    } catch (error) {
      toast.error('Error al generar descripción');
      console.error('AI generation error:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB.');
        e.target.value = ''; // Reset input
        setPreview(null);
        return;
      }
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (data: CreateEventFormInputs) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('location', data.location);

    formData.append('startDate', parseBuenosAiresToISO(data.startDate));
    formData.append('endDate', parseBuenosAiresToISO(data.endDate));

    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.flyerImage && data.flyerImage[0]) {
      formData.append('flyerImage', data.flyerImage[0]);
    }
    // --- LÓGICA DEL NUEVO CAMPO ---
    if (data.publishAt) {
      formData.append('publishAt', parseBuenosAiresToISO(data.publishAt));
    }

    try {
      await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('¡Evento creado exitosamente!');
      onEventCreated();
      onClose();
    } catch (error) {
      toast.error('Hubo un error al crear el evento.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-1">
          Título
        </label>
        <input
          id="title"
          {...register('title')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1">
          Descripción
        </label>
        <div className="relative">
          <textarea
            id="description"
            {...register('description')}
            rows={5}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 pr-32 text-zinc-50 resize-none"
          />
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isGeneratingAI}
            className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white text-xs font-bold py-1.5 px-3 rounded-md flex items-center space-x-1 transition-colors"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                <span>Generar con IA</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          💡 Usa el botón de IA para generar una descripción atractiva automáticamente
        </p>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-zinc-300 mb-1">
          Ubicación
        </label>
        <input
          id="location"
          {...register('location')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
        {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="startDate" className="block text-sm font-medium text-zinc-300 mb-1">
            Fecha de Inicio
          </label>
          <input
            id="startDate"
            type="datetime-local"
            {...register('startDate')}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
          />
          {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
        </div>
        <div className="flex-1">
          <label htmlFor="endDate" className="block text-sm font-medium text-zinc-300 mb-1">
            Fecha de Fin
          </label>
          <input
            id="endDate"
            type="datetime-local"
            {...register('endDate')}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
          />
          {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="publishAt" className="block text-sm font-medium text-zinc-300 mb-1">
          Fecha de Publicación (Opcional)
        </label>
        <input
          id="publishAt"
          type="datetime-local"
          {...register('publishAt')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
        <p className="text-xs text-zinc-500 mt-1">Si se deja vacío, el evento se publicará inmediatamente.</p>
      </div>

      <div>
        <label htmlFor="flyerImage" className="block text-sm font-medium text-zinc-300 mb-1">
          Flyer (Opcional)
        </label>
        <input
          id="flyerImage"
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
          {isSubmitting ? 'Creando...' : 'Crear Evento'}
        </button>
      </div>
    </form>
  );
}