'use client';

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/user.types";

// 1. ESQUEMA ACTUALIZADO
const settingsSchema = z.object({
  // --- Campos de Admin ---
  adminServiceFee: z.coerce.number().min(0).max(100).optional(),
  paymentsEnabled: z.boolean().optional(),
  metaPixelId: z.string().trim().optional().default(''),
  googleAnalyticsId: z.string().trim().optional().default(''),

  // --- Campos de RRPP/Usuario ---
  mercadoPagoAccessToken: z.string().optional(),
});

type SettingsFormInputs = z.infer<typeof settingsSchema>;

export function SettingsManager() {
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch, // Importamos watch para la renderización condicional
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      paymentsEnabled: false, // Valor por defecto
      metaPixelId: '',
      googleAnalyticsId: ''
    }
  });
  
  const paymentsEnabled = watch('paymentsEnabled'); // Observamos el valor del switch

  // 2. LÓGICA DE CARGA DE DATOS REFACTORIZADA (MÁS EFICIENTE)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const promises = [];
        if (user?.roles.includes(UserRole.ADMIN)) {
          promises.push(api.get('/configuration'));
        }
        promises.push(api.get('/users/profile/me'));

        const [configResponse, profileResponse] = await Promise.all(promises);
        
        if (configResponse?.data) {
          const config = configResponse.data;
          if (config.adminServiceFee) setValue('adminServiceFee', parseFloat(config.adminServiceFee));
          if (config.paymentsEnabled) setValue('paymentsEnabled', config.paymentsEnabled === 'true');
          if (config.metaPixelId) setValue('metaPixelId', config.metaPixelId);
          if (config.googleAnalyticsId) setValue('googleAnalyticsId', config.googleAnalyticsId);
        }

        if (profileResponse?.data.mercadoPagoAccessToken) {
          setValue('mercadoPagoAccessToken', profileResponse.data.mercadoPagoAccessToken);
        }

      } catch (error) {
        console.error("Failed to load settings", error);
        toast.error("No se pudo cargar la configuración.");
      }
    };
    if (user) {
      loadSettings();
    }
  }, [user, setValue]);

  // 3. LÓGICA DE GUARDADO DE DATOS REFACTORIZADA (MÁS EFICIENTE)
  const onSubmit = async (data: SettingsFormInputs) => {
    try {
      const promises = [];
      
      if (user?.roles.includes(UserRole.ADMIN)) {
        const configPayload = {
          adminServiceFee: data.adminServiceFee?.toString() || '0',
          paymentsEnabled: data.paymentsEnabled?.toString(),
          metaPixelId: data.metaPixelId,
          googleAnalyticsId: data.googleAnalyticsId,
        };
        promises.push(api.patch('/configuration', configPayload));
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
      
      {/* SECCIÓN NUEVA DE MARKETING */}
      {user?.roles.includes(UserRole.ADMIN) && (
         <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Marketing y Seguimiento</h2>
          <p className="text-sm text-zinc-400 mt-1">IDs para la integración con plataformas de análisis y publicidad.</p>
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="metaPixelId" className="block text-sm font-medium text-zinc-300">Meta Pixel ID</label>
              <input
                id="metaPixelId"
                type="text"
                {...register('metaPixelId')}
                className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2"
                placeholder="Ej: 123456789012345"
              />
            </div>
            <div>
              <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-zinc-300">Google Analytics ID</label>
              <input
                id="googleAnalyticsId"
                type="text"
                {...register('googleAnalyticsId')}
                className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2"
                placeholder="Ej: G-XXXXXXXXXX"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN EXISTENTE DE PASARELA DE PAGOS */}
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

      {/* SECCIONES CONDICIONALES EXISTENTES */}
      {paymentsEnabled && (
        <>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-semibold text-white">Vincular Mercado Pago (RRPP)</h2>
            <p className="text-sm text-zinc-400 mt-1">Pega tu Access Token de Producción para recibir pagos.</p>
             {/* Aquí iría el campo para mercadoPagoAccessToken, si lo quieres visible */}
          </div>

          {user?.roles.includes(UserRole.ADMIN) && (
            <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold text-white">Configuración de Administrador</h2>
              <div>
              <label htmlFor="adminServiceFee" className="block text-sm font-medium text-zinc-300">Comisión por Venta (%)</label>
               <input
                id="adminServiceFee"
                type="number"
                step="0.1"
                {...register('adminServiceFee')}
                className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2"
                placeholder="Ej: 2.5"
              />
              </div>
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