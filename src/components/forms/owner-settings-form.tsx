'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Link from 'next/link';

const schema = z.object({
  mercadoPagoAccessToken: z.string().optional().default(''),
  rrppCommissionRate: z.coerce.number().min(0).max(100).optional(),
  paymentsEnabled: z.boolean().optional(),
});
type FormInputs = z.infer<typeof schema>;

export function OwnerSettingsForm() {
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    const loadData = async () => {
      const [configRes, profileRes] = await Promise.all([api.get('/configuration'), api.get('/users/profile/me')]);
      if (configRes.data.rrppCommissionRate) setValue('rrppCommissionRate', parseFloat(configRes.data.rrppCommissionRate));
      if (configRes.data.paymentsEnabled) setValue('paymentsEnabled', configRes.data.paymentsEnabled === 'true');
      if (profileRes.data.mercadoPagoAccessToken) setValue('mercadoPagoAccessToken', profileRes.data.mercadoPagoAccessToken);
    };
    loadData();
  }, [setValue]);

  const onSubmit = async (data: FormInputs) => {
    try {
      const configPayload = {
        rrppCommissionRate: data.rrppCommissionRate?.toString() || '0',
        paymentsEnabled: data.paymentsEnabled?.toString(),
      };
      const profilePayload = {
        mercadoPagoAccessToken: data.mercadoPagoAccessToken,
      };
      await Promise.all([
        api.patch('/configuration', configPayload),
        api.patch('/users/profile/me', profilePayload)
      ]);
      toast.success('Configuración de Dueño guardada.');
    } catch (error) {
      toast.error('No se pudo guardar la configuración.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-6">
      <h2 className="text-xl font-semibold text-white">Configuración de Dueño</h2>
      <div>
        <label htmlFor="mercadoPagoAccessToken" className="block text-sm font-medium text-zinc-300">Access Token de Mercado Pago (Cuenta Principal)</label>
        <input id="mercadoPagoAccessToken" type="password" {...register('mercadoPagoAccessToken')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="APP_USR-..."/>
        <p className="text-xs text-zinc-500 mt-1">Este token se usará para recibir el dinero de todas las ventas.</p>
      </div>
      <div>
        <label htmlFor="rrppCommissionRate" className="block text-sm font-medium text-zinc-300">Comisión para RRPP (%)</label>
        <input id="rrppCommissionRate" type="number" step="0.1" {...register('rrppCommissionRate')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: 10"/>
      </div>
       <div className="flex items-center justify-between">
        <div>
          <label htmlFor="paymentsEnabled" className="block text-sm font-medium text-zinc-300">Habilitar Pagos</label>
          <p className="text-xs text-zinc-500">Si está desactivado, todos los productos se emitirán como gratuitos.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="paymentsEnabled" className="sr-only peer" {...register('paymentsEnabled')} />
          <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
        </label>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}