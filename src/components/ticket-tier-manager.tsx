'use client';

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { TicketTier } from "@/types/ticket.types";
import toast from "react-hot-toast";
import { Modal } from "./ui/modal";
import { PlusCircle } from "lucide-react";

// 1. AÑADIMOS 'validUntil' AL ESQUEMA DE VALIDACIÓN
const createTierSchema = z.object({
  name: z.string().min(3, { message: "El nombre es requerido." }),
  price: z.coerce.number().min(0, { message: "El precio no puede ser negativo." }),
  quantity: z.coerce.number().int().min(1, { message: "La cantidad debe ser al menos 1." }),
  validUntil: z.string().optional(),
});

type CreateTierFormInputs = z.infer<typeof createTierSchema>;

export function TicketTierManager({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createTierSchema),
  });

  const fetchTiers = useCallback(async () => {
    try {
      const response = await api.get(`/events/${eventId}/ticket-tiers`);
      setTiers(response.data);
    } catch (error) {
      console.error("Failed to fetch ticket tiers", error);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchTiers();
    }
  }, [eventId, fetchTiers]);

  const onSubmit = async (data: CreateTierFormInputs) => {
    try {
      // 2. PREPARAMOS EL PAYLOAD CORRECTAMENTE PARA LA API
      const payload = {
        ...data,
        // Solo enviamos la fecha si el usuario la seleccionó
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
      };
      await api.post(`/events/${eventId}/ticket-tiers`, payload);
      toast.success("Tipo de entrada creado con éxito.");
      reset();
      fetchTiers();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error al crear el tipo de entrada.");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mt-8">
        <h3 className="text-xl font-semibold text-white">Entradas Disponibles</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded-lg flex items-center space-x-2 text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Añadir Tipo</span>
        </button>
      </div>
      
      <div className="mt-4 space-y-3">
        {tiers.length > 0 ? (
          tiers.map(tier => (
            <div key={tier.id} className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div>
                <p className="font-semibold text-white">{tier.name}</p>
                <p className="text-sm text-zinc-400">Cantidad: {tier.quantity}</p>
                {/* 3. MOSTRAMOS LA FECHA DE VENCIMIENTO SI EXISTE */}
                {tier.validUntil && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Válido hasta: {new Date(tier.validUntil).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })} hs.
                  </p>
                )}
              </div>
              <p className="font-bold text-lg text-pink-500">${tier.price}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-zinc-900 border border-zinc-800 rounded-lg">
            <p className="text-zinc-500">Aún no hay tipos de entrada para este evento.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Añadir Nuevo Tipo de Entrada"
      >
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
          {/* 4. NUEVO CAMPO DE FECHA EN EL FORMULARIO */}
          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-zinc-300 mb-1">Válido Hasta (Opcional)</label>
            <input id="validUntil" type="datetime-local" {...register('validUntil')} className="w-full bg-zinc-800 rounded-md p-2 text-white"/>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg disabled:opacity-50">
              {isSubmitting ? 'Añadiendo...' : 'Añadir Entrada'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
