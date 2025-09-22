'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProductType, TicketTier } from '@/types/ticket.types';

// FIX: Esquema de validación reescrito para aceptar strings del formulario y transformarlos al final.
// Esto proporciona una inferencia de tipos limpia y robusta para react-hook-form.
const tierFormSchema = z.object({
  // Se definen los campos que pueden venir como string desde el input
  name: z.string().min(1, "El nombre es requerido."),
  price: z.string().or(z.number()).default("0"),
  quantity: z.string().or(z.number()).default("0"),
  partialPaymentPrice: z.string().or(z.number()).optional().nullable(),
  consumptionCredit: z.string().or(z.number()).optional().nullable(),
  tableNumber: z.string().or(z.number()).optional().nullable(),
  capacity: z.string().or(z.number()).optional().nullable(),
  
  // El resto de los campos
  productType: z.nativeEnum(ProductType),
  description: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  isVip: z.boolean().default(false),
  isPubliclyListed: z.boolean().default(true),
  allowPartialPayment: z.boolean().default(false),
  isBirthdayDefault: z.boolean().default(false),
  isBirthdayVipOffer: z.boolean().default(false),
  location: z.string().optional().nullable(),
}).transform(data => ({
    // Aquí convertimos los strings a números antes de que los datos se usen en el onSubmit
    ...data,
    price: parseFloat(String(data.price || 0)),
    quantity: parseInt(String(data.quantity || 0), 10),
    partialPaymentPrice: data.partialPaymentPrice ? parseFloat(String(data.partialPaymentPrice)) : null,
    consumptionCredit: data.consumptionCredit ? parseFloat(String(data.consumptionCredit)) : null,
    tableNumber: data.tableNumber ? parseInt(String(data.tableNumber), 10) : null,
    capacity: data.capacity ? parseInt(String(data.capacity), 10) : null,
}));


type TierFormData = z.infer<typeof tierFormSchema>;

interface EventTierFormProps {
  existingTier?: TicketTier;
  onSubmit: (data: Partial<TierFormData> & { isFree?: boolean }) => void;
  isLoading: boolean;
  onClose: () => void;
}

export const EventTierForm: React.FC<EventTierFormProps> = ({ existingTier, onSubmit, isLoading, onClose }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(tierFormSchema),
    defaultValues: {
      name: existingTier?.name || '',
      price: existingTier?.price || 0,
      quantity: existingTier?.quantity ?? 100,
      productType: existingTier?.productType || ProductType.TICKET,
      description: existingTier?.description || '',
      validUntil: existingTier?.validUntil ? new Date(existingTier.validUntil).toISOString().substring(0, 16) : '',
      isVip: existingTier?.isVip || false,
      isPubliclyListed: existingTier?.isPubliclyListed ?? true,
      allowPartialPayment: existingTier?.allowPartialPayment || false,
      partialPaymentPrice: existingTier?.partialPaymentPrice,
      isBirthdayDefault: existingTier?.isBirthdayDefault || false,
      isBirthdayVipOffer: existingTier?.isBirthdayVipOffer || false,
      consumptionCredit: existingTier?.consumptionCredit,
      tableNumber: existingTier?.tableNumber,
      capacity: existingTier?.capacity,
      location: existingTier?.location || '',
    },
  });

  const productType = watch('productType');
  const allowPartialPayment = watch('allowPartialPayment');

  const handleFormSubmit: SubmitHandler<TierFormData> = (data) => {
    const finalData: Partial<TierFormData> & { isFree?: boolean } = { ...data };
    finalData.isFree = data.price === 0;
    if (data.productType === ProductType.VIP_TABLE) finalData.quantity = 1;
    finalData.validUntil = data.validUntil ? new Date(data.validUntil).toISOString() : null;
    if (!data.allowPartialPayment) finalData.partialPaymentPrice = null;
    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-white">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
        <input {...register('name')} id="name" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="productType" className="block text-sm font-medium text-zinc-300 mb-1">Tipo de Producto</label>
        <select {...register('productType')} id="productType" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700">
          <option value={ProductType.TICKET}>Entrada (General, VIP, etc.)</option>
          <option value={ProductType.VIP_TABLE}>Mesa VIP</option>
          <option value={ProductType.VOUCHER}>Voucher de Consumo</option>
        </select>
      </div>

      {productType === ProductType.VIP_TABLE && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-dashed border-zinc-600 rounded-lg">
           <div>
            <label htmlFor="tableNumber" className="block text-sm font-medium text-zinc-300 mb-1">Nº Mesa</label>
            <input type="number" {...register('tableNumber')} id="tableNumber" placeholder="Ej: 1" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
            {errors.tableNumber && <p className="text-xs text-red-500 mt-1">{errors.tableNumber.message}</p>}
          </div>
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-zinc-300 mb-1">Capacidad</label>
            <input type="number" {...register('capacity')} id="capacity" placeholder="Ej: 6" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
            {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity.message}</p>}
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-zinc-300 mb-1">Ubicación</label>
            <input type="text" {...register('location')} id="location" placeholder="Ej: Sector VIP" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-zinc-300 mb-1">Precio Total (ARS)</label>
          <input {...register('price')} id="price" type="number" step="1" className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700" />
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad</label>
          <input {...register('quantity')} id="quantity" type="number" disabled={productType === ProductType.VIP_TABLE} className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700 disabled:opacity-50" />
          {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="isVip" {...register('isVip')} className="h-4 w-4 rounded accent-amber-500" />
        <label htmlFor="isVip" className="text-sm font-medium text-zinc-300">Marcar como VIP (Acceso preferencial)</label>
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

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onClose} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">
            Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
            {isLoading ? 'Guardando...' : (existingTier ? 'Guardar Cambios' : 'Crear Entrada')}
        </button>
      </div>
    </form>
  );
};