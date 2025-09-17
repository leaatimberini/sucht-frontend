// src/components/forms/PaymentSettingsForm.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Users, DollarSign, Percent } from 'lucide-react';
import { User, UserRole } from '@/types/user.types';

const paymentSettingsSchema = z.object({
  paymentOwnerUserId: z.string().uuid().optional().or(z.literal('')),
  adminServiceFeePercentage: z.coerce.number().min(0).max(100).optional(),
  rrppCommissionEnabled: z.boolean().default(false),
  enabledPaymentMethods: z.array(z.string()).optional(),
});

type PaymentSettingsInputs = z.infer<typeof paymentSettingsSchema>;

export function PaymentSettingsForm() {
  const [owners, setOwners] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(paymentSettingsSchema),
  });

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const [configRes, usersRes] = await Promise.all([
        api.get('/configuration'),
        api.get('/users/staff?limit=1000'),
      ]);
      
      const ownerUsers = usersRes.data.data.filter((u: User) => u.roles.includes(UserRole.OWNER));
      setOwners(ownerUsers);
      
      reset(configRes.data);

    } catch (error) {
      toast.error('No se pudieron cargar las configuraciones de pago.');
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (data: PaymentSettingsInputs) => {
    try {
      await api.patch('/configuration', data);
      toast.success('Configuración de pagos actualizada.');
      fetchSettings();
    } catch (error) {
      toast.error('No se pudo guardar la configuración.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-pink-500"/></div>;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Configuración de Pagos y Comisiones</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          {/* --- LÍNEA CORREGIDA --- (se eliminó 'block') */}
          <label htmlFor="paymentOwnerUserId" className="text-sm font-medium text-zinc-300 mb-1 flex items-center gap-2">
            <Users size={16} /> Dueño Receptor de Pagos
          </label>
          <select {...register('paymentOwnerUserId')} id="paymentOwnerUserId" className="w-full bg-zinc-800 rounded-md p-2">
            <option value="">-- Seleccionar Dueño --</option>
            {owners.map(owner => (
              <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
            ))}
          </select>
          <p className="text-xs text-zinc-500 mt-1">Este usuario recibirá el monto principal de todas las ventas de entradas y mesas.</p>
        </div>

        <div>
          {/* --- LÍNEA CORREGIDA --- (se eliminó 'block') */}
          <label htmlFor="adminServiceFeePercentage" className="text-sm font-medium text-zinc-300 mb-1 flex items-center gap-2">
            <Percent size={16} /> Comisión por Servicio (Admin)
          </label>
          <input {...register('adminServiceFeePercentage')} id="adminServiceFeePercentage" type="number" step="0.1" className="w-full bg-zinc-800 rounded-md p-2" />
          <p className="text-xs text-zinc-500 mt-1">Porcentaje del total de la venta que se destinará a la cuenta del Admin.</p>
        </div>

        <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-md">
            <label htmlFor="rrppCommissionEnabled" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <DollarSign size={16} /> Habilitar Comisiones para RRPP y Organizadores
            </label>
            <Controller
                name="rrppCommissionEnabled"
                control={control}
                render={({ field }) => (
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
                )}
            />
        </div>
        
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={16}/> Guardar Cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
}