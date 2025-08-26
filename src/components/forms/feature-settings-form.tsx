// src/components/forms/feature-settings-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const schema = z.object({
  isRewardsStoreEnabled: z.boolean().optional(),
});
type FormInputs = z.infer<typeof schema>;

export function FeatureSettingsForm() {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormInputs>({ resolver: zodResolver(schema) });

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get('/configuration');
                reset({
                  isRewardsStoreEnabled: res.data.isRewardsStoreEnabled === 'true'
                });
            } catch (error) {
                console.error("Failed to load feature settings", error);
            }
        };
        loadData();
    }, [reset]);

    const onSubmit = async (data: FormInputs) => {
        try {
            await api.patch('/configuration', data);
            toast.success('Configuración de funcionalidades guardada.');
        } catch (error) {
            toast.error('No se pudo guardar la configuración.');
        }
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-4">
            <h2 className="text-xl font-semibold text-white">Habilitar Funcionalidades</h2>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="isRewardsStoreEnabled" className="block text-sm font-medium text-zinc-300">Tienda de Canje de Puntos</label>
                {/* ===== CORRECCIÓN: Se cambian las comillas dobles por simples ===== */}
                <p className="text-xs text-zinc-500">Si está activado, los clientes verán la pestaña Premios en su panel.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="isRewardsStoreEnabled" className="sr-only peer" {...register('isRewardsStoreEnabled')} />
                <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
}