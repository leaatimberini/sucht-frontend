'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const schema = z.object({
  mercadoPagoAccessToken: z.string().optional().default(''),
  adminServiceFee: z.coerce.number().min(0).max(100).optional(),
});
type FormInputs = z.infer<typeof schema>;

export function AdminSettingsForm() {
    const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema) });

    useEffect(() => {
        const loadData = async () => {
            const [configRes, profileRes] = await Promise.all([api.get('/configuration'), api.get('/users/profile/me')]);
            if (configRes.data.adminServiceFee) setValue('adminServiceFee', parseFloat(configRes.data.adminServiceFee));
            if (profileRes.data.mercadoPagoAccessToken) setValue('mercadoPagoAccessToken', profileRes.data.mercadoPagoAccessToken);
        };
        loadData();
    }, [setValue]);

    const onSubmit = async (data: FormInputs) => {
        try {
            await Promise.all([
                api.patch('/configuration', { adminServiceFee: data.adminServiceFee?.toString() || '0' }),
                api.patch('/users/profile/me', { mercadoPagoAccessToken: data.mercadoPagoAccessToken })
            ]);
            toast.success('Configuración de Admin guardada.');
        } catch (error) {
            toast.error('No se pudo guardar la configuración.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-6">
            <h2 className="text-xl font-semibold text-white">Configuración de Administrador</h2>
            <div>
              <label htmlFor="admin-mp" className="block text-sm font-medium text-zinc-300">Access Token de MP (Comisión de Servicio)</label>
              <input id="admin-mp" type="password" {...register('mercadoPagoAccessToken')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="APP_USR-..."/>
              <p className="text-xs text-zinc-500 mt-1">Token de la cuenta que recibirá la comisión por servicio.</p>
            </div>
            <div>
              <label htmlFor="adminServiceFee" className="block text-sm font-medium text-zinc-300">Comisión por Servicio (%)</label>
              <input id="adminServiceFee" type="number" step="0.1" {...register('adminServiceFee')} className="mt-1 block w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: 2.5"/>
            </div>
             <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
}