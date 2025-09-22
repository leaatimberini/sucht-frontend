'use client';

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { type TicketTier, ProductType } from '@/types/ticket.types';
import { useEffect } from "react";

const editTicketTierSchema = z.object({
  name: z.string().min(3, { message: "El nombre es requerido." }),
  isFree: z.boolean(), // FIX: Se reintroduce el campo 'isFree' que faltaba.
  price: z.coerce.number().min(0, "El precio no puede ser negativo.").optional(),
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
}).refine(data => {
  if (!data.isFree && (!data.price || data.price <= 0)) {
    return false;
  }
  return true;
}, {
  message: "El precio es requerido si la entrada no es gratuita.",
  path: ['price'],
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
    reset({
      ...tier,
      validUntil: tier.validUntil ? new Date(tier.validUntil).toISOString().substring(0, 16) : '',
    });
  }, [tier, reset]);

  const allowPartialPayment = watch('allowPartialPayment');
  const productType = watch('productType');
  const isFreeTicket = watch('isFree');

  const onSubmit: SubmitHandler<EditTicketTierFormInputs> = async (data) => {
    try {
      const payload = {
        ...data,
        // Ya no necesitamos calcular 'isFree' aquí porque viene del formulario
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
        partialPaymentPrice: data.allowPartialPayment ? data.partialPaymentPrice : null,
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
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="productType" className="block text-sm font-medium text-zinc-300 mb-1">Tipo de Producto</label>
        <select {...register('productType')} id="productType" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700">
          <option value={ProductType.TICKET}>Entrada General</option>
          <option value={ProductType.VIP_TABLE}>Mesa VIP</option>
          <option value={ProductType.VOUCHER}>Voucher de Consumo</option>
        </select>
      </div>

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
        <input {...register('quantity')} id="quantity" type="number" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
        {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
      </div>
      
      {/* ... (Puedes añadir aquí el resto de los campos del formulario de edición, como cumpleaños, seña, etc.) */}
      
      <div className="flex justify-end pt-4">
        <button type="button" onClick={onClose} className="bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg mr-2">Cancelar</button>
        <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}