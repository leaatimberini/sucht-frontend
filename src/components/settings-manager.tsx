'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/user.types";

const settingsSchema = z.object({
  adminServiceFee: z.coerce.number().min(0).max(100).optional(),
  mercadoPagoToken: z.string().optional(),
});

type SettingsFormInputs = z.infer<typeof settingsSchema>;

export function SettingsManager() {
  const user = useAuthStore((state) => state.user);
  const [currentFee, setCurrentFee] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
  });

  // Cargar la configuración actual al iniciar el componente
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/configuration/adminServiceFee');
        if (response.data) {
          setValue('adminServiceFee', response.data);
          setCurrentFee(response.data);
        }
      } catch (error) {
        // No hacer nada si no se encuentra, es la primera vez que se configura
      }
    };
    if (user?.roles.includes(UserRole.ADMIN)) {
      fetchConfig();
    }
  }, [user, setValue]);

  const onSaveSettings = async (data: SettingsFormInputs) => {
    try {
      if (data.adminServiceFee !== undefined) {
        await api.post('/configuration', { key: 'adminServiceFee', value: data.adminServiceFee.toString() });
      }
      if (data.mercadoPagoToken) {
        // Este endpoint actualiza el MP token del usuario logueado
        await api.patch('/users/profile/me', { mercadoPagoAccessToken: data.mercadoPagoToken });
      }
      toast.success("Configuración guardada con éxito.");
    } catch (error) {
      toast.error("No se pudo guardar la configuración.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSaveSettings)} className="space-y-8 max-w-2xl">
      {/* Sección solo para Admins/Dueños */}
      {user?.roles.includes(UserRole.ADMIN) && (
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Configuración de Administrador</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="adminServiceFee" className="block text-sm font-medium text-zinc-300 mb-1">Costo del Servicio (%)</label>
              <p className="text-xs text-zinc-500 mb-2">Porcentaje que recibirá el administrador por cada venta.</p>
              <input 
                {...register('adminServiceFee')} 
                id="adminServiceFee" 
                type="number" 
                step="0.1"
                placeholder="Ej: 2.5"
                className="w-full bg-zinc-800 rounded-md p-2" 
              />
              {errors.adminServiceFee && <p className="text-xs text-red-500 mt-1">{errors.adminServiceFee.message}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Sección para vincular Mercado Pago (Dueño, Admin, RRPP) */}
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-xl font-semibold text-white">Vincular Mercado Pago</h2>
        <p className="text-xs text-zinc-500 mt-2 mb-4">Pega tu "Access Token" de producción de Mercado Pago para recibir los pagos de las ventas de entradas. Puedes encontrarlo en <a href="https://www.mercadopago.com.ar/developers/panel/credentials" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">tus credenciales de desarrollador</a>.</p>
        <div>
          <label htmlFor="mercadoPagoToken" className="block text-sm font-medium text-zinc-300 mb-1">Access Token</label>
          <input 
            {...register('mercadoPagoToken')} 
            id="mercadoPagoToken" 
            type="password"
            placeholder="APP_USR-..."
            className="w-full bg-zinc-800 rounded-md p-2" 
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  );
}
