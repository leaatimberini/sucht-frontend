'use client';

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { type TicketTier, ProductType } from '@/types/ticket.types';
import { useEffect } from "react";

// Esquema de validación completo con todos los campos necesarios.
const editTicketTierSchema = z.object({
  name: z.string().min(3, { message: "El nombre es requerido." }),
  isFree: z.boolean(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  quantity: z.coerce.number().int().min(0, "La cantidad no puede ser negativa."),
  validUntil: z.string().optional().nullable(),
  productType: z.nativeEnum(ProductType),
  allowPartialPayment: z.boolean(),
  partialPaymentPrice: z.coerce.number().min(0).optional().nullable(),
  isBirthdayDefault: z.boolean().optional(),
  isBirthdayVipOffer: z.boolean().optional(),
  consumptionCredit: z.coerce.number().min(0).optional().nullable(),
  isVip: z.boolean(),
  description: z.string().optional().nullable(),
  tableNumber: z.coerce.number().int().positive().optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  location: z.string().optional().nullable(),
  isPubliclyListed: z.boolean(),
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
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(editTicketTierSchema),
  });

  useEffect(() => {
    // Nos aseguramos de que todos los campos del backend se carguen en el formulario
    reset({
      ...tier,
      validUntil: tier.validUntil ? new Date(tier.validUntil).toISOString().substring(0, 16) : '',
    });
  }, [tier, reset]);

  const productType = watch('productType');
  const isFreeTicket = watch('isFree');

  const onSubmit: SubmitHandler<EditTicketTierFormInputs> = async (data) => {
    try {
      const payload = {
        ...data,
        // No es necesario calcular isFree aquí porque ya está en el estado del formulario
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
      };
      await api.patch(`/events/${eventId}/ticket-tiers/${tier.id}`, payload);
      toast.success("Tipo de entrada actualizado.");
      onTierUpdated();
      onClose();
    } catch (error: any) {
      const errorMessages = error.response?.data?.message;
      const displayError = Array.isArray(errorMessages) ? errorMessages.join(', ') : "Error al actualizar.";
      toast.error(displayError);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
        <input {...register('name')} id="name" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
      </div>
      <div>
        <label htmlFor="productType" className="block text-sm font-medium text-zinc-300 mb-1">Tipo de Producto</label>
        <select {...register('productType')} id="productType" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700">
          <option value={ProductType.TICKET}>Entrada (General/VIP)</option>
          <option value={ProductType.VIP_TABLE}>Mesa VIP</option>
          <option value={ProductType.VOUCHER}>Voucher de Consumo</option>
        </select>
      </div>

      {/* --- FIX: SECCIÓN DE CAMPOS PARA MESAS VIP --- */}
      {productType === ProductType.VIP_TABLE && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-dashed border-zinc-600 rounded-lg animate-in fade-in">
           <div>
            <label htmlFor="tableNumber" className="block text-sm font-medium text-zinc-300 mb-1">Nº Mesa</label>
            <input type="number" {...register('tableNumber')} id="tableNumber" placeholder="Ej: 1" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
          </div>
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-zinc-300 mb-1">Capacidad</label>
            <input type="number" {...register('capacity')} id="capacity" placeholder="Ej: 8" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-zinc-300 mb-1">Ubicación</label>
            <input type="text" {...register('location')} id="location" placeholder="Ej: Sector VIP" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input type="checkbox" id="isFree" {...register('isFree')} className="accent-pink-600" />
        <label htmlFor="isFree" className="text-sm font-medium text-zinc-300">Entrada sin Cargo</label>
      </div>

      {!isFreeTicket && (
        <div className="animate-in fade-in">
          <label htmlFor="price" className="block text-sm font-medium text-zinc-300 mb-1">Precio Total</label>
          <input {...register('price')} id="price" type="number" step="0.01" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
        </div>
      )}

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad Disponible</label>
        <input {...register('quantity')} id="quantity" type="number" className="w-full bg-zinc-800 rounded-md p-2 text-white" disabled={productType === ProductType.VIP_TABLE} />
      </div>
      
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onClose} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
        <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}