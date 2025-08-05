// frontend/src/components/rrpp-settings-form.tsx
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { CheckCircle, Loader, XCircle } from 'lucide-react'; // <-- Se importa XCircle

export function RRPPSettingsForm() {
  // El estado ahora depende directamente del usuario en el store de Zustand
  const { user, fetchUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Efecto para manejar los callbacks de la vinculación de MP
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast.success('¡Tu cuenta de Mercado Pago fue vinculada con éxito!');
      fetchUser(); // Refrescamos los datos del usuario para obtener el nuevo estado
      // Limpiamos la URL
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

  // Función para iniciar la vinculación
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/payments/connect/mercadopago');
      const { authUrl } = response.data;

      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (error) {
      toast.error('Error al generar el enlace de conexión.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ==========================================================
  // ===== NUEVA FUNCIÓN PARA DESVINCULAR LA CUENTA MP ======
  // ==========================================================
  const handleUnlink = async () => {
    if (!window.confirm('¿Estás seguro de que deseas desvincular tu cuenta de Mercado Pago? No podrás recibir comisiones hasta que la vuelvas a vincular.')) {
      return;
    }
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-xl font-semibold text-white">Vincular Mercado Pago</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Para recibir tus comisiones, debes vincular tu cuenta de Mercado Pago con la aplicación.
        </p>

        {/* El estado de carga y vinculación ahora depende del objeto 'user' del store */}
        {!user ? (
          <div className="flex items-center space-x-2 mt-4 text-zinc-500">
            <Loader className="h-4 w-4 animate-spin" />
            <p>Cargando estado...</p>
          </div>
        ) : user.isMpLinked ? (
          // ===== NUEVA UI PARA CUANDO LA CUENTA ESTÁ VINCULADA =====
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2 text-green-500 bg-green-900/50 px-3 py-1 rounded-full">
              <CheckCircle className="h-5 w-5" />
              <p className="font-semibold text-sm">Cuenta Vinculada</p>
            </div>
            <button
              type="button"
              onClick={handleUnlink}
              disabled={isLoading}
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
            disabled={isLoading}
            className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : 'Vincular mi cuenta de Mercado Pago'}
          </button>
        )}
      </div>

      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-xl font-semibold text-white">Mi Comisión</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Tu tasa de comisión por ventas es del{' '}
          <span className="font-bold text-pink-500">
            {/* Leemos la comisión directamente del objeto 'user' del store */}
            {user?.rrppCommissionRate !== null && user?.rrppCommissionRate !== undefined ? `${user.rrppCommissionRate}%` : 'No definida'}
          </span>
        </p>
      </div>
    </div>
  );
}