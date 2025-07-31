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
  mercadoPagoAccessToken: z.string().optional(),
  paymentsEnabled: z.boolean(), // <-- 1. AÑADIR AL ESQUEMA
});

type SettingsFormInputs = z.infer<typeof settingsSchema>;

export function SettingsManager() {
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch, // <-- 2. Importar 'watch' para observar cambios
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      paymentsEnabled: false, // Valor por defecto
    }
  });

  const paymentsEnabled = watch('paymentsEnabled'); // Observamos el valor del switch

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (user?.roles.includes(UserRole.ADMIN)) {
          const [feeRes, paymentsRes] = await Promise.all([
            api.get('/configuration/adminServiceFee'),
            api.get('/configuration/paymentsEnabled'),
          ]);
          if (feeRes.data?.value) setValue('adminServiceFee', parseFloat(feeRes.data.value));
          if (paymentsRes.data?.value) setValue('paymentsEnabled', paymentsRes.data.value === 'true');
        }
        const profileResponse = await api.get('/users/profile/me');
        if (profileResponse.data.mercadoPagoAccessToken) {
          setValue('mercadoPagoAccessToken', profileResponse.data.mercadoPagoAccessToken);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };
    if (user) {
      loadSettings();
    }
  }, [user, setValue]);

  const onSubmit = async (data: SettingsFormInputs) => {
    try {
      const promises = [];
      if (user?.roles.includes(UserRole.ADMIN)) {
        promises.push(api.post('/configuration', { key: 'adminServiceFee', value: data.adminServiceFee?.toString() || '0' }));
        promises.push(api.post('/configuration', { key: 'paymentsEnabled', value: data.paymentsEnabled.toString() }));
      }
      if (data.mercadoPagoAccessToken !== undefined) {
        promises.push(api.patch('/users/profile/me', { mercadoPagoAccessToken: data.mercadoPagoAccessToken }));
      }
      await Promise.all(promises);
      toast.success("Configuración guardada con éxito.");
    } catch (error) {
      toast.error("No se pudo guardar la configuración.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {/* --- NUEVA SECCIÓN --- */}
      {user?.roles.includes(UserRole.ADMIN) && (
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Pasarela de Pagos</h2>
          <div className="flex items-center justify-between mt-4">
            <div>
              <label htmlFor="paymentsEnabled" className="block text-sm font-medium text-zinc-300">Habilitar Pagos con Mercado Pago</label>
              <p className="text-xs text-zinc-500">Si está desactivado, todas las entradas se emitirán como gratuitas.</p>
            </div>
            <label htmlFor="paymentsEnabled" className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="paymentsEnabled" className="sr-only peer" {...register('paymentsEnabled')} />
              <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>
        </div>
      )}

      {/* El resto del formulario no cambia, pero se mostrará condicionalmente */}
      {paymentsEnabled && (
        <>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-semibold text-white">Vincular Mercado Pago</h2>
            {/* ... resto del formulario de MP ... */}
          </div>
          {user?.roles.includes(UserRole.ADMIN) && (
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Configuración de Administrador</h2>
              {/* ... resto del formulario de admin ... */}
            </div>
          )}
        </>
      )}
      
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  );
}
