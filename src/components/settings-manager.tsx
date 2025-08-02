'use client';

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/user.types";
import Link from "next/link";

const settingsSchema = z.object({
  paymentsEnabled: z.boolean().optional(),
  rrppCommissionRate: z.coerce.number().min(0).max(100).optional(),
  adminServiceFee: z.coerce.number().min(0).max(100).optional(),
  metaPixelId: z.string().trim().optional().default(''),
  googleAnalyticsId: z.string().trim().optional().default(''),
  termsAndConditionsText: z.string().trim().optional().default(''),
  mercadoPagoAccessToken: z.string().optional(),
});

type SettingsFormInputs = z.infer<typeof settingsSchema>;

export function SettingsManager() {
  const { user } = useAuthStore();
  
  const isOwner = user?.roles.includes(UserRole.OWNER);
  const isAdmin = user?.roles.includes(UserRole.ADMIN);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      paymentsEnabled: false,
    }
  });
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const promises = [];
        if (isOwner || isAdmin) {
          promises.push(api.get('/configuration'));
        }
        promises.push(api.get('/users/profile/me'));

        const [configResponse, profileResponse] = await Promise.all(promises);
        
        if (configResponse?.data) {
          const config = configResponse.data;
          if (config.paymentsEnabled) setValue('paymentsEnabled', config.paymentsEnabled === 'true');
          if (isAdmin) {
            if (config.adminServiceFee) setValue('adminServiceFee', parseFloat(config.adminServiceFee));
            if (config.metaPixelId) setValue('metaPixelId', config.metaPixelId);
            if (config.googleAnalyticsId) setValue('googleAnalyticsId', config.googleAnalyticsId);
            if (config.termsAndConditionsText) setValue('termsAndConditionsText', config.termsAndConditionsText);
          }
          if (isOwner) {
            if (config.rrppCommissionRate) setValue('rrppCommissionRate', parseFloat(config.rrppCommissionRate));
          }
        }

        if (profileResponse?.data.mercadoPagoAccessToken) {
          setValue('mercadoPagoAccessToken', profileResponse.data.mercadoPagoAccessToken);
        }
      } catch (error) {
        toast.error("No se pudo cargar la configuración.");
      }
    };
    if (user) {
      loadSettings();
    }
  }, [user, setValue, isOwner, isAdmin]);

  const onSubmit = async (data: SettingsFormInputs) => {
    try {
      const promises = [];
      
      if (isOwner || isAdmin) {
        const configPayload: any = {
          paymentsEnabled: data.paymentsEnabled?.toString(),
        };
        if (isOwner) {
          configPayload.rrppCommissionRate = data.rrppCommissionRate?.toString() || '0';
        }
        if (isAdmin) {
          configPayload.adminServiceFee = data.adminServiceFee?.toString() || '0';
          configPayload.metaPixelId = data.metaPixelId;
          configPayload.googleAnalyticsId = data.googleAnalyticsId;
          configPayload.termsAndConditionsText = data.termsAndConditionsText;
        }
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
      
      {/* --- SECCIÓN DE PAGOS UNIFICADA --- */}
      {(isOwner || isAdmin) && (
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-6">
          <h2 className="text-xl font-semibold text-white">Vincular Mercado Pago</h2>
          <div>
            <label htmlFor="mercadoPagoAccessToken" className="block text-sm font-medium text-zinc-300">
              Access Token de Producción
            </label>
            <input 
              id="mercadoPagoAccessToken" 
              type="password" 
              {...register('mercadoPagoAccessToken')} 
              className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" 
              placeholder="APP_USR-..."
            />
            {/* Texto descriptivo dinámico según el rol */}
            {isOwner && <p className="text-xs text-zinc-500 mt-1">Como Dueño, este token se usará para recibir el dinero de todas las ventas.</p>}
            {isAdmin && !isOwner && <p className="text-xs text-zinc-500 mt-1">Como Admin, este token se usará para recibir la comisión por servicio.</p>}
          </div>
        </div>
      )}

      {/* --- SECCIONES ESPECÍFICAS DE DUEÑO (OWNER) --- */}
      {isOwner && (
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Configuración de Comisiones</h2>
          <div>
            <label htmlFor="rrppCommissionRate" className="block text-sm font-medium text-zinc-300">Comisión para RRPP (%)</label>
            <input id="rrppCommissionRate" type="number" step="0.1" {...register('rrppCommissionRate')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: 10"/>
          </div>
        </div>
      )}

      {/* --- SECCIONES ESPECÍFICAS DE ADMINISTRADOR (ADMIN) --- */}
      {isAdmin && (
        <>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-semibold text-white">Configuración de Administrador</h2>
            <div>
              <label htmlFor="adminServiceFee" className="block text-sm font-medium text-zinc-300">Comisión por Servicio (%)</label>
              <input id="adminServiceFee" type="number" step="0.1" {...register('adminServiceFee')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: 2.5"/>
            </div>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-semibold text-white">Términos y Condiciones</h2>
            <textarea id="termsAndConditionsText" {...register('termsAndConditionsText')} rows={15} className="mt-4 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2 font-mono"/>
          </div>
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
             <h2 className="text-xl font-semibold text-white">Marketing y Seguimiento</h2>
             <div className="space-y-4 mt-4">
               <div>
                 <label htmlFor="metaPixelId" className="block text-sm font-medium text-zinc-300">Meta Pixel ID</label>
                 <input id="metaPixelId" type="text" {...register('metaPixelId')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: 123456789012345"/>
               </div>
               <div>
                 <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-zinc-300">Google Analytics ID</label>
                 <input id="googleAnalyticsId" type="text" {...register('googleAnalyticsId')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: G-XXXXXXXXXX"/>
               </div>
             </div>
          </div>
        </>
      )}

      {/* SECCIÓN COMÚN */}
      {(isOwner || isAdmin) && (
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Pasarela de Pagos</h2>
          <div className="flex items-center justify-between mt-4">
            <div>
              <label htmlFor="paymentsEnabled" className="block text-sm font-medium text-zinc-300">Habilitar Pagos con Mercado Pago</label>
              <p className="text-xs text-zinc-500">Si está desactivado, todos los productos se emitirán como gratuitos.</p>
            </div>
            <label htmlFor="paymentsEnabled" className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="paymentsEnabled" className="sr-only peer" {...register('paymentsEnabled')} />
              <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  );
}