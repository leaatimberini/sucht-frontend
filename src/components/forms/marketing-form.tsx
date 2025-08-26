// src/components/forms/feature-settings-form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const schema = z.object({
  metaPixelId: z.string().trim().optional(),
  googleAnalyticsId: z.string().trim().optional(),
});
type FormInputs = z.infer<typeof schema>;

export function MarketingForm() {
    const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<FormInputs>({ resolver: zodResolver(schema) });

    useEffect(() => {
        const loadData = async () => {
            const res = await api.get('/configuration');
            if (res.data.metaPixelId) setValue('metaPixelId', res.data.metaPixelId);
            if (res.data.googleAnalyticsId) setValue('googleAnalyticsId', res.data.googleAnalyticsId);
        };
        loadData();
    }, [setValue]);

    const onSubmit = async (data: FormInputs) => {
        try {
            await api.patch('/configuration', data);
            toast.success('Configuración de Marketing guardada.');
        } catch (error) {
            toast.error('No se pudo guardar la configuración.');
        }
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-4">
            <h2 className="text-xl font-semibold text-white">Marketing y Seguimiento</h2>
            <div>
              <label htmlFor="metaPixelId" className="block text-sm font-medium text-zinc-300">Meta Pixel ID</label>
              <input id="metaPixelId" type="text" {...register('metaPixelId')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: 123456789012345"/>
            </div>
            <div>
              <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-zinc-300">Google Analytics ID</label>
              <input id="googleAnalyticsId" type="text" {...register('googleAnalyticsId')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: G-XXXXXXXXXX"/>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar IDs'}
                </button>
            </div>
        </form>
    );
}