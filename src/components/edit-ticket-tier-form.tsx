// src/components/edit-ticket-tier-form.tsx
'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { type TicketTier, ProductType } from '@/types/ticket.types';
import { useEffect } from "react";

// 1. AÑADIMOS LOS NUEVOS CAMPOS AL ESQUEMA DE VALIDACIÓN
const editTicketTierSchema = z.object({
  name: z.string().min(3, { message: "El nombre es requerido." }),
  isFree: z.boolean(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo.").optional(),
  quantity: z.coerce.number().int().min(0, "La cantidad no puede ser negativa."),
  validUntil: z.string().optional(),
  productType: z.nativeEnum(ProductType),
  allowPartialPayment: z.boolean(),
  partialPaymentPrice: z.coerce.number().min(0).optional().nullable(),
  // --- Nuevos campos de cumpleaños ---
  isBirthdayDefault: z.boolean().optional(),
  isBirthdayVipOffer: z.boolean().optional(),
  consumptionCredit: z.coerce.number().min(0).optional().nullable(),
}).refine(data => {
  if (!data.isFree && (!data.price || data.price <= 0)) {
    return false;
  }
  return true;
}, {
  message: "El precio es requerido y debe ser mayor a cero para entradas de pago.",
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

  // 2. INCLUIMOS LOS NUEVOS CAMPOS EN LOS VALORES POR DEFECTO DEL FORMULARIO
  useEffect(() => {
    reset({
      name: tier.name,
      isFree: tier.isFree,
      price: tier.price,
      quantity: tier.quantity,
      validUntil: tier.validUntil ? new Date(tier.validUntil).toISOString().substring(0, 16) : '',
      productType: tier.productType,
      allowPartialPayment: tier.allowPartialPayment,
      partialPaymentPrice: tier.partialPaymentPrice,
      isBirthdayDefault: tier.isBirthdayDefault,
      isBirthdayVipOffer: tier.isBirthdayVipOffer,
      consumptionCredit: tier.consumptionCredit,
    });
  }, [tier, reset]);

  const allowPartialPayment = watch('allowPartialPayment');
  const isFreeTicket = watch('isFree');
  const productType = watch('productType');

  const onSubmit = async (data: EditTicketTierFormInputs) => {
    try {
      // 3. ASEGURAMOS QUE LOS NUEVOS CAMPOS SE ENVÍEN EN EL PAYLOAD
      const payload = {
        ...data,
        price: data.isFree ? 0 : data.price,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
        partialPaymentPrice: data.allowPartialPayment ? data.partialPaymentPrice : null,
      };
      await api.patch(`/events/${eventId}/ticket-tiers/${tier.id}`, payload);
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
        <label htmlFor="productType" className="block text-sm font-medium text-zinc-300 mb-1">Tipo de Producto</label>
        <select {...register('productType')} id="productType" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700">
          <option value={ProductType.TICKET}>Entrada General</option>
          <option value={ProductType.VIP_TABLE}>Mesa VIP</option>
          <option value={ProductType.VOUCHER}>Voucher de Consumo</option>
        </select>
      </div>
      
      {/* --- SECCIÓN DE CONFIGURACIÓN DE CUMPLEAÑOS --- */}
      <div className="space-y-3 rounded-lg border border-pink-500/30 bg-pink-500/10 p-4">
        <h4 className="font-semibold text-white">Configuración de Cumpleaños</h4>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="isBirthdayDefault" {...register('isBirthdayDefault')} className="h-4 w-4 rounded accent-pink-600" />
          <label htmlFor="isBirthdayDefault" className="text-sm font-medium text-zinc-300">Usar como entrada gratuita de cumpleaños</label>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="isBirthdayVipOffer" {...register('isBirthdayVipOffer')} className="h-4 w-4 rounded accent-amber-500" />
          <label htmlFor="isBirthdayVipOffer" className="text-sm font-medium text-zinc-300">Usar como oferta VIP de cumpleaños</label>
        </div>
        {productType === ProductType.VIP_TABLE && (
            <div className="animate-in fade-in pt-2">
              <label htmlFor="consumptionCredit" className="block text-sm font-medium text-zinc-300 mb-1">Crédito en Consumo ($)</label>
              <input {...register('consumptionCredit')} id="consumptionCredit" type="number" step="1" placeholder="200000" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
              <p className="text-xs text-zinc-500 mt-1">Define el valor en consumo que incluye esta mesa.</p>
            </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" id="isFree" {...register('isFree')} className="accent-pink-600" />
        <label htmlFor="isFree" className="text-sm font-medium text-zinc-300">Entrada sin Cargo</label>
      </div>

      <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-md">
        <label htmlFor="allowPartialPayment" className="text-sm font-medium text-zinc-300">Permitir Seña</label>
        <label htmlFor="allowPartialPayment" className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="allowPartialPayment" className="sr-only peer" {...register('allowPartialPayment')} />
          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
        </label>
      </div>

      {allowPartialPayment && (
        <div className="animate-in fade-in">
          <label htmlFor="partialPaymentPrice" className="block text-sm font-medium text-zinc-300 mb-1">Precio de la Seña</label>
          <input {...register('partialPaymentPrice')} id="partialPaymentPrice" type="number" step="0.01" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
          {errors.partialPaymentPrice && <p className="text-xs text-red-500 mt-1">{errors.partialPaymentPrice.message}</p>}
        </div>
      )}

      {!isFreeTicket && (
        <div>
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

      <div>
        <label htmlFor="validUntil" className="block text-sm font-medium text-zinc-300 mb-1">Válido Hasta (Opcional)</label>
        <input id="validUntil" type="datetime-local" {...register('validUntil')} className="w-full bg-zinc-800 rounded-md p-2 text-white"/>
      </div>
      
      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}