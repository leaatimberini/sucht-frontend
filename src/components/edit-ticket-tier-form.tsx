'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { type TicketTier } from '@/types/event.types';

// Esquema de validación para el formulario de edición
const editTicketTierSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  price: z.string().min(1, { message: 'El precio es requerido.' })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0.01, {
      message: 'El precio debe ser un número mayor que cero.',
    }),
  quantity: z.string().min(1, { message: 'La cantidad es requerida.' })
    .refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 1, {
      message: 'La cantidad debe ser un número entero mayor o igual a 1.',
    }),
  available: z.boolean(),
});

type EditTicketTierFormInputs = z.infer<typeof editTicketTierSchema>;

export function EditTicketTierForm({
  ticketTier,
  onClose,
  onTicketTierUpdated,
}: {
  ticketTier: TicketTier;
  onClose: () => void;
  onTicketTierUpdated: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditTicketTierFormInputs>({
    resolver: zodResolver(editTicketTierSchema),
    defaultValues: {
      name: ticketTier.name,
      price: ticketTier.price.toString(),
      quantity: ticketTier.quantity.toString(),
      available: ticketTier.available,
    },
  });

  const onSubmit = async (data: EditTicketTierFormInputs) => {
    try {
      // Convertimos los datos a los tipos correctos antes de enviarlos
      const payload = {
        ...data,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity, 10),
      };
      // --- LÍNEA CORREGIDA ---
      // Se añade el prefijo /api a la ruta
      await api.patch(`/ticket-tiers/${ticketTier.id}`, payload);
      // -----------------------

      toast.success('¡Tipo de ticket actualizado exitosamente!');
      onTicketTierUpdated();
      onClose();
    } catch (error) {
      toast.error('Hubo un error al actualizar el tipo de ticket.');
      console.error("Update ticket tier error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="edit-tier-name" className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
        <input
          id="edit-tier-name"
          {...register('name')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="edit-tier-price" className="block text-sm font-medium text-zinc-300 mb-1">Precio</label>
        <input
          id="edit-tier-price"
          type="number"
          step="0.01"
          {...register('price')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
      </div>

      <div>
        <label htmlFor="edit-tier-quantity" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad</label>
        <input
          id="edit-tier-quantity"
          type="number"
          step="1"
          {...register('quantity')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-zinc-50"
        />
        {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="edit-tier-available"
          type="checkbox"
          {...register('available')}
          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-zinc-600 rounded"
        />
        <label htmlFor="edit-tier-available" className="text-sm font-medium text-zinc-300">Disponible para venta</label>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar Tipo de Ticket'}
        </button>
      </div>
    </form>
  );
}