// frontend/src/app/rrpp/settings/rrpp-settings-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Link from 'next/link';

// 1. Esquema de validación para los campos del RRPP
const rrppSettingsSchema = z.object({
  mpAccessToken: z.string().optional().default(''),
  mpUserId: z.string().optional().default(''), // NUEVO: Campo para el ID de usuario de Mercado Pago
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

  // Al cargar el componente, obtenemos el token y el ID del usuario
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile/me');
        // 2. CORRECCIÓN: Usamos el nombre de propiedad 'mpAccessToken'
        if (response.data.mpAccessToken) {
          setValue('mpAccessToken', response.data.mpAccessToken);
        }
        // NUEVO: Obtenemos el mpUserId del perfil
        if (response.data.mpUserId) {
          setValue('mpUserId', response.data.mpUserId);
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
      // 3. CORRECCIÓN: Enviamos los datos con los nombres de propiedad correctos
      await api.patch('/users/profile/me', {
        mpAccessToken: data.mpAccessToken,
        mpUserId: data.mpUserId, // NUEVO: Enviamos el mpUserId
      });
      toast.success('¡Tu cuenta de Mercado Pago fue vinculada con éxito!');
    } catch (error) {
      toast.error('No se pudo vincular la cuenta. Verifica tus credenciales.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-xl font-semibold text-white">Vincular Mercado Pago</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Para recibir tus comisiones, debes vincular tu Access Token y tu ID de usuario de producción de Mercado Pago.
        </p>
        <div className="mt-4">
          <label htmlFor="mpAccessToken" className="block text-sm font-medium text-zinc-300">
            Access Token de Producción
          </label>
          <input
            id="mpAccessToken"
            type="password"
            {...register('mpAccessToken')}
            className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2 font-mono"
            placeholder="APP_USR-..."
          />
          {errors.mpAccessToken && <p className="text-xs text-red-500 mt-1">{errors.mpAccessToken.message}</p>}
          <p className="text-xs text-zinc-500 mt-2">
            Puedes encontrar tu Access Token en la sección{' '}
            <Link href="https://www.mercadopago.com.ar/developers/panel/credentials" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-500">
              Credenciales
            </Link>
            {' '}de tu cuenta de Mercado Pago.
          </p>
        </div>

        {/* NUEVO: Campo para el ID de usuario */}
        <div className="mt-4">
          <label htmlFor="mpUserId" className="block text-sm font-medium text-zinc-300">
            ID de Usuario de Producción
          </label>
          <input
            id="mpUserId"
            type="text"
            {...register('mpUserId')}
            className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2 font-mono"
            placeholder="Ej: 123456789"
          />
          {errors.mpUserId && <p className="text-xs text-red-500 mt-1">{errors.mpUserId.message}</p>}
          <p className="text-xs text-zinc-500 mt-2">
            Tu ID de usuario se encuentra en la URL de tu panel de Mercado Pago después de iniciar sesión.
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