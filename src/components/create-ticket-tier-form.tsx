'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import toast from "react-hot-toast";

// SOLUCIÓN DEFINITIVA: Usamos z.coerce.number() para la conversión de tipos
const createTierSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1."),
});

type CreateTierFormInputs = z.infer<typeof createTierSchema>;

export function CreateTicketTierForm({ 
  eventId, 
  onClose, 
  onTierCreated 
}: { 
  eventId: string;
  onClose: () => void;
  onTierCreated: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTierFormInputs>({
    resolver: zodResolver(createTierSchema),
  });

  const onSubmit = async (data: CreateTierFormInputs) => {
    try {
      await api.post(`/events/${eventId}/ticket-tiers`, data);
      toast.success("Tipo de entrada creado con éxito.");
      reset();
      onTierCreated(); // Llama a la función para recargar la lista
      onClose(); // Cierra el modal
    } catch (error) {
      toast.error("Error al crear el tipo de entrada.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Nombre (Ej: General)</label>
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
          {isSubmitting ? 'Añadiendo...' : 'Añadir Entrada'}
        </button>
      </div>
    </form>
  );
}