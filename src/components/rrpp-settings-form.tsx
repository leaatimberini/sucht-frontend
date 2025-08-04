// frontend/src/components/rrpp-settings-form.tsx
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
// 1. Importamos useRouter para poder refrescar los datos
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { User } from '@/types/user.types';
import { CheckCircle, Loader } from 'lucide-react';

export function RRPPSettingsForm() {
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const router = useRouter(); // 2. Inicializamos el router
  const [rrppCommissionRate, setRrppCommissionRate] = useState<number | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast.success('¡Tu cuenta de Mercado Pago fue vinculada con éxito!');
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.toString());
      // 3. Forzamos la recarga de los datos del servidor para esta página
      router.refresh();
    } else if (error) {
      toast.error('No se pudo vincular la cuenta. Por favor, inténtalo de nuevo.');
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [searchParams, router]); // 4. Añadimos router a las dependencias

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/users/profile/me');
        const userData: User = response.data;
        setIsLinked(!!userData.mpAccessToken && !!userData.mpUserId);
        setRrppCommissionRate(userData.rrppCommissionRate ?? null);
      } catch (error) {
        toast.error('No se pudo cargar tu configuración actual.');
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, [user, searchParams]);

  // 5. Corregimos handleConnect para usar la lógica final y robusta
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

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-xl font-semibold text-white">Vincular Mercado Pago</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Para recibir tus comisiones, debes vincular tu cuenta de Mercado Pago con la aplicación.
        </p>

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

      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-xl font-semibold text-white">Mi Comisión</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Tu tasa de comisión por ventas es del{' '}
          <span className="font-bold text-pink-500">
            {rrppCommissionRate !== null ? `${rrppCommissionRate}%` : 'Cargando...'}
          </span>
        </p>
      </div>
    </div>
  );
}