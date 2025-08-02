// frontend/src/app/dashboard/settings/forms/owner-settings-form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader } from 'lucide-react';
import { User } from '@/types/user.types';
import { useAuthStore } from '@/stores/auth-store';

const ownerSettingsSchema = z.object({
  rrppCommissionRate: z.coerce.number().min(0).max(100).optional(),
  paymentsEnabled: z.boolean().optional(),
});
type OwnerSettingsFormInputs = z.infer<typeof ownerSettingsSchema>;

export function OwnerSettingsForm() {
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [initialData, setInitialData] = useState<OwnerSettingsFormInputs | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(ownerSettingsSchema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    if (success) {
      toast.success('¡Tu cuenta de Mercado Pago fue vinculada con éxito!');
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.toString());
    } else if (error) {
      toast.error('No se pudo vincular la cuenta. Por favor, inténtalo de nuevo.');
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, profileRes] = await Promise.all([
          api.get('/configuration'),
          api.get('/users/profile/me'),
        ]);

        const configData = configRes.data;
        const profileData: User = profileRes.data;

        const dataForForm = {
          rrppCommissionRate: configData.rrppCommissionRate ?? null,
          paymentsEnabled: configData.paymentsEnabled === 'true',
        };

        setInitialData(dataForForm);
        reset(dataForForm);
        setIsLinked(!!profileData.mpAccessToken);
      } catch (error) {
        toast.error('No se pudo cargar la configuración.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [reset, user]);
  
  const handleConnect = async () => {
    try {
      const response = await api.get('/payments/connect/mercadopago');
      window.location.href = response.data;
    } catch (error) {
      toast.error('Error al generar el enlace de conexión.');
    }
  };

  const onSubmit = async (data: OwnerSettingsFormInputs) => {
    try {
      const configPayload = {
        rrppCommissionRate: data.rrppCommissionRate,
        paymentsEnabled: data.paymentsEnabled,
      };
      
      await api.patch('/configuration', configPayload);
      toast.success('Configuración de pagos guardada.');

    } catch (error) {
      toast.error('No se pudo guardar la configuración.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-6">
        <h2 className="text-xl font-semibold text-white">Configuración de Pagos</h2>
        
        {/* Lógica de vinculación por enlace */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-300">Vincular cuenta de Mercado Pago</label>
          <p className="text-xs text-zinc-400 mt-1">Este token se usará para recibir el dinero de todas las ventas.</p>
          {isLoading ? (
            <div className="flex items-center space-x-2 mt-4 text-zinc-500">
              <Loader className="h-4 w-4 animate-spin" />
              <p>Cargando estado...</p>
            </div>
          ) : isLinked ? (
            <div className="mt-4 flex items-center space-x-2 text-green-500">
              <CheckCircle className="h-6 w-6" />
              <p className="font-semibold">Cuenta de Mercado Pago vinculada.</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Vincular mi cuenta de Mercado Pago
            </button>
          )}
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
    </div>
  );
}