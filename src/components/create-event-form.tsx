// frontend/src/components/create-event-form.tsx
'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useState } from 'react';
import Image from 'next/image';
import { ProductType } from "@/types/ticket.types";

const createEventSchema = z.object({
  title: z.string().min(3, { message: 'El título es requerido.' }),
  description: z.string().optional(),
  location: z.string().min(3, { message: 'La ubicación es requerida.' }),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de inicio inválida.',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de fin inválida.',
  }),
  flyerImage: z.any().optional(),
});

const createTicketTierSchema = z.object({
  name: z.string().min(3, { message: "El nombre es requerido." }),
  isFree: z.boolean().default(false),
  price: z.coerce.number().min(0, { message: "El precio no puede ser negativo." }).optional(),
  quantity: z.coerce.number().int().min(1, { message: "La cantidad debe ser al menos 1." }),
  validUntil: z.string().optional(),
  productType: z.nativeEnum(ProductType),
  allowPartialPayment: z.boolean(),
  partialPaymentPrice: z.coerce.number().min(0).optional().nullable(),
}).refine(data => {
  if (!data.isFree && (!data.price || data.price <= 0)) {
    return false;
  }
  return true;
}, {
  message: "El precio es requerido y debe ser mayor a cero para entradas de pago.",
  path: ['price'],
});

type CreateEventFormInputs = z.infer<typeof createEventSchema>;
type CreateTicketTierFormInputs = z.infer<typeof createTicketTierSchema>;

export function CreateEventForm({
  onClose,
  onEventCreated,
}: {
  onClose: () => void;
  onEventCreated: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormInputs>({
    resolver: zodResolver(createEventSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (data: CreateEventFormInputs) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('location', data.location);
    formData.append('startDate', new Date(data.startDate).toISOString());
    formData.append('endDate', new Date(data.endDate).toISOString());
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.flyerImage && data.flyerImage[0]) {
      formData.append('flyerImage', data.flyerImage[0]);
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
        <textarea
          id="description"
          {...register('description')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
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