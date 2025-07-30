'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const notificationSchema = z.object({
  title: z.string().min(3, { message: 'El título es requerido.' }),
  body: z.string().min(10, { message: 'El mensaje debe tener al menos 10 caracteres.' }),
});

type NotificationFormInputs = z.infer<typeof notificationSchema>;

export function NotificationSender() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NotificationFormInputs>({
    resolver: zodResolver(notificationSchema),
  });

  const onSubmit = async (data: NotificationFormInputs) => {
    try {
      await api.post('/notifications/send-to-all', data);
      toast.success('¡Notificación enviada a todos los usuarios suscritos!');
      reset();
    } catch (error) {
      toast.error('No se pudo enviar la notificación.');
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-1">Título de la Notificación</label>
          <input 
            id="title"
            {...register('title')}
            placeholder="¡Nuevo Evento Anunciado!"
            className="w-full bg-zinc-800 rounded-md p-2 text-white"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-zinc-300 mb-1">Mensaje</label>
          <textarea
            id="body"
            {...register('body')}
            placeholder="Este sábado no te pierdas la fiesta del año..."
            rows={4}
            className="w-full bg-zinc-800 rounded-md p-2 text-white"
          />
          {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Notificación'}
          </button>
        </div>
      </form>
    </div>
  );
}
