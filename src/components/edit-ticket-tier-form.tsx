'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { type TicketTier } from '@/types/ticket.types';

const editTicketTierSchema = z.object({
  name: z.string().min(3, { message: "El nombre es requerido." }).optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo.").optional(),
  quantity: z.coerce.number().int().min(0, "La cantidad no puede ser negativa.").optional(),
});

type EditTicketTierFormInputs = z.infer<typeof editTicketTierSchema>;

export function EditTicketTierForm({
  tier,
  eventId,
  onClose,
  onTierUpdated,
}: {
  tier: TicketTier;
  eventId: string;
  onClose: () => void;
  onTierUpdated: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editTicketTierSchema),
    defaultValues: {
      name: tier.name,
      price: tier.price,
      quantity: tier.quantity,
    }
  });

  const onSubmit = async (data: EditTicketTierFormInputs) => {
    try {
      await api.patch(`/events/${eventId}/ticket-tiers/${tier.id}`, data);
      toast.success("Tipo de entrada actualizado.");
      onTierUpdated();
      onClose();
    } catch (error) {
      toast.error("Error al actualizar el tipo de entrada.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
        <input {...register('name')} id="name" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-zinc-300 mb-1">Precio</label>
        <input {...register('price')} id="price" type="number" step="0.01" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
      </div>
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad</label>
        <input {...register('quantity')} id="quantity" type="number" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
        {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
