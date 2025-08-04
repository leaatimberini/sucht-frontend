// frontend/src/components/forms/admin-settings-form.tsx
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

const adminSettingsSchema = z.object({
  adminServiceFee: z.coerce.number().min(0).max(100).optional(),
});
type AdminSettingsFormInputs = z.infer<typeof adminSettingsSchema>;

export function AdminSettingsForm() {
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  
  const [initialData, setInitialData] = useState<AdminSettingsFormInputs | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(adminSettingsSchema),
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
          adminServiceFee: configData.adminServiceFee ?? null,
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
  }, [reset, user, setValue, searchParams]);
  
  // 1. ESTA ES LA FUNCIÓN CORRECTA AHORA
  const handleConnect = async () => {
    try {
      // Usamos api.get (que envía el token) para obtener la URL
      const response = await api.get('/payments/connect/mercadopago');
      const { authUrl } = response.data;
      
      // Una vez que tenemos la URL, redirigimos el navegador
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (error) {
      toast.error('Error al generar el enlace de conexión.');
    }
  };

  const onSubmit = async (data: AdminSettingsFormInputs) => {
    try {
      const configPayload = {
        adminServiceFee: data.adminServiceFee,
      };
      
      await api.patch('/configuration', configPayload);
      toast.success('Comisión de servicio guardada.');
    } catch (error) {
      toast.error('No se pudo guardar la configuración.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-6">
        <h2 className="text-xl font-semibold text-white">Configuración de Administrador</h2>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-300">Vincular cuenta de Mercado Pago</label>
          <p className="text-xs text-zinc-400 mt-1">Este token se usará para recibir las comisiones del servicio.</p>
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
            // 2. VOLVEMOS A USAR UN BOTÓN CON onClick
            <button
              type="button"
              onClick={handleConnect}
              className="mt-4 inline-block bg-pink-600 hover-bg-pink-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Vincular mi cuenta de Mercado Pago
            </button>
          )}
        </div>

        <div>
          <label htmlFor="adminServiceFee" className="block text-sm font-medium text-zinc-300">
            Comisión por Servicio (%)
          </label>
          <input
            id="adminServiceFee"
            type="number"
            step="0.1"
            {...register('adminServiceFee')}
            className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2"
            placeholder="Ej: 2.5"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-pink-600 hover-bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}