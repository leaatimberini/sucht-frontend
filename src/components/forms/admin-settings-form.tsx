// frontend/src/components/forms/admin-settings-form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader, XCircle } from 'lucide-react'; // <-- Se importa XCircle
import { useAuthStore } from '@/stores/auth-store';

const adminSettingsSchema = z.object({
  adminServiceFee: z.coerce.number().min(0).max(100).optional(),
});
type AdminSettingsFormInputs = z.infer<typeof adminSettingsSchema>;

export function AdminSettingsForm() {
  // El estado ahora depende directamente del usuario en el store de Zustand
  const { user, fetchUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AdminSettingsFormInputs>();

  // Efecto para manejar los callbacks de la vinculación de MP
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    if (success) {
      toast.success('¡Tu cuenta de Mercado Pago fue vinculada con éxito!');
      fetchUser(); // Refrescamos los datos del usuario para obtener el nuevo estado
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.toString());
    } else if (error) {
      toast.error('No se pudo vincular la cuenta. Por favor, inténtalo de nuevo.');
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [searchParams, fetchUser, router]);

  // Efecto para cargar la configuración inicial del formulario
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/configuration');
        const configData = response.data;
        const dataForForm = {
          adminServiceFee: configData.adminServiceFee ?? 0,
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
  
  // Función para iniciar la vinculación
  const handleConnect = async () => {
    try {
      const response = await api.get('/payments/connect/mercadopago');
      const { authUrl } = response.data;
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (error) {
      toast.error('Error al generar el enlace de conexión.');
    }
  };

  // ==========================================================
  // ===== NUEVA FUNCIÓN PARA DESVINCULAR LA CUENTA MP ======
  // ==========================================================
  const handleUnlink = async () => {
    if (!window.confirm('¿Estás seguro de que deseas desvincular tu cuenta de Mercado Pago?')) {
      return;
    }
    try {
      toast.loading('Desvinculando...');
      await api.delete('/payments/connect/mercadopago');
      toast.dismiss();
      toast.success('Cuenta desvinculada exitosamente.');
      // Forzamos la recarga de los datos del usuario para actualizar el estado
      fetchUser();
    } catch (error) {
      toast.dismiss();
      toast.error('No se pudo desvincular la cuenta.');
    }
  };

  const onSubmit = async (data: AdminSettingsFormInputs) => {
    try {
      await api.patch('/configuration', { adminServiceFee: data.adminServiceFee });
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
          ) : user?.isMpLinked ? (
            // ===== NUEVA UI PARA CUANDO LA CUENTA ESTÁ VINCULADA =====
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-green-500 bg-green-900/50 px-3 py-1 rounded-full">
                <CheckCircle className="h-5 w-5" />
                <p className="font-semibold text-sm">Cuenta Vinculada</p>
              </div>
              <button
                type="button"
                onClick={handleUnlink}
                disabled={isSubmitting}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm font-semibold disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Desvincular</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              className="mt-4 inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg"
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
            className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white"
            placeholder="Ej: 2.5"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}