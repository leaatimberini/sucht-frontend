'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Users, DollarSign, Percent, CreditCard, CheckCircle, XCircle, Star, Settings as SettingsIcon, Share2, FileText } from 'lucide-react';
import { User, UserRole } from '@/types/user.types';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter, useSearchParams } from 'next/navigation';

// --- Esquema de Validación Unificado y Completo ---
const settingsSchema = z.object({
  paymentOwnerUserId: z.string().uuid("Debes seleccionar un dueño válido.").optional().or(z.literal('')),
  adminServiceFeePercentage: z.coerce.number().min(0).max(100).optional(),
  rrppCommissionEnabled: z.boolean().optional(),
  enabledPaymentMethods: z.array(z.string()).optional(),
  paymentsEnabled: z.boolean().optional(),
  points_attendance: z.coerce.number().min(0).optional(),
  points_successful_referral: z.coerce.number().min(0).optional(),
  points_social_share: z.coerce.number().min(0).optional(),
  isRewardsStoreEnabled: z.boolean().optional(),
  metaPixelId: z.string().trim().optional(),
  googleAnalyticsId: z.string().trim().optional(),
  termsAndConditionsText: z.string().optional(),
});

type SettingsFormInputs = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const { user, fetchUser } = useAuthStore();
  const [owners, setOwners] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAdmin = user?.roles.includes(UserRole.ADMIN);
  const isOwner = user?.roles.includes(UserRole.OWNER);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
        enabledPaymentMethods: [],
        rrppCommissionEnabled: false,
        paymentsEnabled: false,
        isRewardsStoreEnabled: false,
    }
  });
  
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    if (success) {
      toast.success('¡Tu cuenta de Mercado Pago fue vinculada con éxito!');
      fetchUser();
      router.replace('/dashboard/settings');
    } else if (error) {
      toast.error('No se pudo vincular la cuenta.');
      router.replace('/dashboard/settings');
    }
  }, [searchParams, fetchUser, router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [configRes, usersRes] = await Promise.all([
        api.get('/configuration'),
        api.get('/users/staff?limit=1000'),
      ]);
      const ownerUsers = usersRes.data.data.filter((u: User) => u.roles.includes(UserRole.OWNER));
      setOwners(ownerUsers);
      reset(configRes.data);
    } catch (error) {
      toast.error('No se pudieron cargar las configuraciones.');
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data: SettingsFormInputs) => {
    try {
      await api.patch('/configuration', data);
      toast.success('Configuración guardada con éxito.');
      fetchData();
    } catch (error) {
      toast.error('No se pudo guardar la configuración.');
    }
  };

  const handleConnectMP = async () => {
    try {
      const response = await api.get('/payments/connect/mercadopago');
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      toast.error('Error al generar el enlace de conexión.');
    }
  };

  const handleUnlinkMP = async () => {
    if (!window.confirm('¿Estás seguro de que deseas desvincular tu cuenta de Mercado Pago?')) return;
    try {
      toast.loading('Desvinculando...');
      await api.delete('/payments/connect/mercadopago');
      toast.dismiss();
      toast.success('Cuenta desvinculada exitosamente.');
      fetchUser();
    } catch (error) {
      toast.dismiss();
      toast.error('No se pudo desvincular la cuenta.');
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-pink-500"/></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Configuración de la Plataforma</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {isAdmin && (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><CreditCard size={20}/> Configuración de Pagos</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="paymentOwnerUserId" className="block text-sm font-medium text-zinc-300 mb-1">Dueño Receptor de Pagos</label>
                  <select {...register('paymentOwnerUserId')} id="paymentOwnerUserId" className="w-full bg-zinc-800 rounded-md p-2">
                    <option value="">-- Seleccionar Dueño --</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
                  </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Métodos de Pago Habilitados</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...register('enabledPaymentMethods')} value="mercadopago" className="accent-pink-600"/>
                            Mercado Pago
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...register('enabledPaymentMethods')} value="talo" className="accent-pink-600"/>
                            Talo
                        </label>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="paymentsEnabled" className="text-sm font-medium text-zinc-300">Habilitar Cobro de Entradas</label>
                    <Controller name="paymentsEnabled" control={control} render={({ field }) => (
                       <input type="checkbox" checked={field.value} onChange={field.onChange} className="toggle toggle-pink" />
                    )}/>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Percent size={20}/> Configuración de Comisiones</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="adminServiceFeePercentage" className="block text-sm font-medium text-zinc-300 mb-1">Comisión por Servicio (Admin %)</label>
                        <input {...register('adminServiceFeePercentage')} id="adminServiceFeePercentage" type="number" step="0.1" className="w-full bg-zinc-800 rounded-md p-2" />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="rrppCommissionEnabled" className="text-sm font-medium text-zinc-300">Habilitar Comisiones para RRPP</label>
                        <Controller name="rrppCommissionEnabled" control={control} render={({ field }) => (
                            <input type="checkbox" checked={field.value} onChange={field.onChange} className="toggle toggle-pink" />
                        )}/>
                    </div>
                </div>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Vincular Cuenta (Admin)</h2>
                <p className="text-sm text-zinc-400 mb-4">Conecta tu cuenta de Mercado Pago para recibir la comisión por servicio de las ventas.</p>
                {user?.isMpLinked ? (
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 text-green-400 font-semibold"><CheckCircle size={16}/> Cuenta Vinculada</span>
                        <button type="button" onClick={handleUnlinkMP} className="text-red-500 hover:underline text-sm font-semibold">Desvincular</button>
                    </div>
                ) : (
                    <button type="button" onClick={handleConnectMP} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Vincular Mercado Pago</button>
                )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Star size={20}/> Sistema de Puntos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="points_attendance" className="block text-sm font-medium text-zinc-300">Puntos por Asistencia</label>
                      <input id="points_attendance" type="number" {...register('points_attendance')} className="w-full mt-1 bg-zinc-800 rounded-md p-2" />
                  </div>
                  <div>
                      <label htmlFor="points_successful_referral" className="block text-sm font-medium text-zinc-300">Puntos por Referido Exitoso</label>
                      <input id="points_successful_referral" type="number" {...register('points_successful_referral')} className="w-full mt-1 bg-zinc-800 rounded-md p-2" />
                  </div>
                  <div>
                      <label htmlFor="points_social_share" className="block text-sm font-medium text-zinc-300">Puntos por Compartir</label>
                      <input id="points_social_share" type="number" {...register('points_social_share')} className="w-full mt-1 bg-zinc-800 rounded-md p-2" />
                  </div>
              </div>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><SettingsIcon size={20}/> Habilitar Funcionalidades</h2>
                <div className="flex items-center justify-between">
                    <label htmlFor="isRewardsStoreEnabled" className="text-sm font-medium text-zinc-300">Tienda de Canje de Puntos</label>
                    <Controller name="isRewardsStoreEnabled" control={control} render={({ field }) => (
                       <input type="checkbox" checked={field.value} onChange={field.onChange} className="toggle toggle-pink" />
                    )}/>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Share2 size={20}/> Marketing y Seguimiento</h2>
                <div>
                  <label htmlFor="metaPixelId" className="block text-sm font-medium text-zinc-300">Meta Pixel ID</label>
                  <input id="metaPixelId" type="text" {...register('metaPixelId')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2"/>
                </div>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><FileText size={20}/> Términos y Condiciones</h2>
                <textarea {...register('termsAndConditionsText')} rows={10} className="w-full bg-zinc-800 rounded-md p-2"></textarea>
            </div>
          </>
        )}

        {isOwner && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Vincular Cuenta de Pagos (Dueño)</h2>
                <p className="text-sm text-zinc-400 mb-4">Conecta tu cuenta de Mercado Pago para recibir el dinero de las ventas de entradas y mesas.</p>
                {user?.isMpLinked ? (
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 text-green-400 font-semibold"><CheckCircle size={16}/> Cuenta Vinculada</span>
                        <button type="button" onClick={handleUnlinkMP} className="text-red-500 hover:underline text-sm font-semibold">Desvincular</button>
                    </div>
                ) : (
                    <button type="button" onClick={handleConnectMP} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Vincular Mercado Pago</button>
                )}
            </div>
        )}
        
        <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 text-lg disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20}/> Guardar Toda la Configuración</>}
            </button>
        </div>
      </form>
    </div>
  );
}