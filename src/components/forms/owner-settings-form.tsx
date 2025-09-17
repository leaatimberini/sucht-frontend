// frontend/src/app/dashboard/settings/forms/owner-settings-form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const ownerSettingsSchema = z.object({
  rrppCommissionRate: z.coerce.number().min(0).max(100).optional(),
  paymentsEnabled: z.boolean().optional(),
});
type OwnerSettingsFormInputs = z.infer<typeof ownerSettingsSchema>;

export function OwnerSettingsForm() {
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<OwnerSettingsFormInputs>();

  // Efecto para cargar la configuración inicial del formulario
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/configuration');
        const configData = response.data;
        const dataForForm = {
          rrppCommissionRate: configData.rrppCommissionRate ?? 0,
          paymentsEnabled: configData.paymentsEnabled === 'true',
        };
        reset(dataForForm);
      } catch (error) {
        toast.error('No se pudo cargar la configuración.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [reset]);

  const onSubmit = async (data: OwnerSettingsFormInputs) => {
    try {
      await api.patch('/configuration', data);
      toast.success('Configuración guardada.');
    } catch (error) {
      toast.error('No se pudo guardar la configuración.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-6">
        <h2 className="text-xl font-semibold text-white">Configuración General</h2>
        
        {/* SECCIÓN DE VINCULACIÓN DE MERCADO PAGO ELIMINADA */}

        <div>
          <label htmlFor="rrppCommissionRate" className="block text-sm font-medium text-zinc-300">Comisión por defecto para RRPP (%)</label>
          <input id="rrppCommissionRate" type="number" step="0.1" {...register('rrppCommissionRate')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white" placeholder="Ej: 10"/>
           <p className="text-xs text-zinc-500 mt-1">Esta será la comisión asignada a los nuevos RRPP. Puede ser modificada individualmente.</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="paymentsEnabled" className="block text-sm font-medium text-zinc-300">Habilitar Pagos en la Plataforma</label>
            <p className="text-xs text-zinc-500">Si está desactivado, todos los productos se emitirán como gratuitos.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="paymentsEnabled" className="sr-only peer" {...register('paymentsEnabled')} />
            <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting || isLoading} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}