// frontend/src/app/dashboard/settings/forms/admin-settings-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

// 1. DTO de respuesta del backend para la configuración
const configSchema = z.object({
  adminServiceFee: z.coerce.number().min(0).max(100).optional(),
});

// 2. DTO de respuesta del backend para el perfil de usuario
const userProfileSchema = z.object({
  mercadoPagoAccessToken: z.string().optional().default(''),
});

// 3. Unimos los esquemas para el formulario
const formSchema = z.intersection(configSchema, userProfileSchema);
type FormInputs = z.infer<typeof formSchema>;

export function AdminSettingsForm() {
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtenemos toda la configuración de una vez
        const configRes = await api.get('/configuration');
        // Obtenemos el perfil del usuario
        const profileRes = await api.get('/users/profile/me');
        
        // Asignamos los valores al formulario
        // Aseguramos que los valores existan antes de asignarlos
        if (configRes.data.adminServiceFee) {
          setValue('adminServiceFee', parseFloat(configRes.data.adminServiceFee));
        }
        if (profileRes.data.mpAccessToken) {
          // El nombre de la propiedad en el backend es 'mpAccessToken'
          setValue('mercadoPagoAccessToken', profileRes.data.mpAccessToken);
        }

      } catch (error) {
        console.error("Failed to load initial data", error);
        toast.error("Error al cargar la configuración inicial.");
      }
    };
    loadData();
  }, [setValue]);

  const onSubmit = async (data: FormInputs) => {
    try {
      // 4. Corrección CRÍTICA: Enviar el número directamente al backend
      // El backend ahora espera un número (`number`), no un string
      const configUpdate = {
        adminServiceFee: data.adminServiceFee,
      };

      // 5. Enviar el token de acceso al perfil del usuario
      const userProfileUpdate = {
        mpAccessToken: data.mercadoPagoAccessToken,
      };

      await Promise.all([
        api.patch('/configuration', configUpdate),
        api.patch('/users/profile/me', userProfileUpdate),
      ]);

      toast.success('Configuración de Admin guardada.');
    } catch (error) {
      console.error("Failed to save settings", error);
      toast.error('No se pudo guardar la configuración.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-6">
      <h2 className="text-xl font-semibold text-white">Configuración de Administrador</h2>
      <div>
        <label htmlFor="admin-mp" className="block text-sm font-medium text-zinc-300">Access Token de MP (Comisión de Servicio)</label>
        <input 
          id="admin-mp" 
          type="password" 
          {...register('mercadoPagoAccessToken')} 
          className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" 
          placeholder="APP_USR-..."/>
        <p className="text-xs text-zinc-500 mt-1">Token de la cuenta que recibirá la comisión por servicio.</p>
      </div>
      <div>
        <label htmlFor="adminServiceFee" className="block text-sm font-medium text-zinc-300">Comisión por Servicio (%)</label>
        <input 
          id="adminServiceFee" 
          type="number" 
          step="0.1" 
          {...register('adminServiceFee')} 
          className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" 
          placeholder="Ej: 2.5"/>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}