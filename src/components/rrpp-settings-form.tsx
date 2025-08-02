'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Link from 'next/link';

// Esquema de validación simple para un solo campo
const rrppSettingsSchema = z.object({
  mercadoPagoAccessToken: z.string().optional().default(''),
});

type RRPPSettingsFormInputs = z.infer<typeof rrppSettingsSchema>;

export function RRPPSettingsForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(rrppSettingsSchema),
  });

  // Al cargar el componente, obtenemos el token actual del usuario
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile/me');
        if (response.data.mercadoPagoAccessToken) {
          setValue('mercadoPagoAccessToken', response.data.mercadoPagoAccessToken);
        }
      } catch (error) {
        toast.error('No se pudo cargar tu configuración actual.');
      }
    };
    fetchProfile();
  }, [setValue]);

  // Al enviar el formulario, actualizamos el perfil
  const onSubmit = async (data: RRPPSettingsFormInputs) => {
    try {
      await api.patch('/users/profile/me', {
        mercadoPagoAccessToken: data.mercadoPagoAccessToken,
      });
      toast.success('¡Tu cuenta de Mercado Pago fue vinculada con éxito!');
    } catch (error) {
      toast.error('No se pudo vincular la cuenta. Verifica tu Access Token.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
       <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Vincular Mercado Pago</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Para recibir tus comisiones, debes vincular tu Access Token de producción de Mercado Pago.
          </p>
          <div className="mt-4">
            <label htmlFor="mercadoPagoAccessToken" className="block text-sm font-medium text-zinc-300">
              Access Token de Producción
            </label>
            <input
              id="mercadoPagoAccessToken"
              type="password"
              {...register('mercadoPagoAccessToken')}
              className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2 font-mono"
              placeholder="APP_USR-..."
            />
             <p className="text-xs text-zinc-500 mt-2">
              Puedes encontrar tu Access Token en la sección{' '}
              <Link href="https://www.mercadopago.com.ar/developers/panel/credentials" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-500">
                Credenciales
              </Link>
              {' '}de tu cuenta de Mercado Pago.
            </p>
          </div>
        </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  );
}