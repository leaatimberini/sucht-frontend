// frontend/src/components/forms/points-settings-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Star } from 'lucide-react';

// Esquema de validación para los campos de puntos
const schema = z.object({
  points_attendance: z.coerce.number().min(0).optional(),
  points_no_show_penalty: z.coerce.number().min(0).optional(),
  points_social_share: z.coerce.number().min(0).optional(),
  points_successful_referral: z.coerce.number().min(0).optional(),
});
type FormInputs = z.infer<typeof schema>;

export function PointsSettingsForm() {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema) });

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get('/configuration');
                // Usamos 'reset' para popular el formulario con los datos cargados
                reset({
                  points_attendance: res.data.points_attendance,
                  points_no_show_penalty: res.data.points_no_show_penalty,
                  points_social_share: res.data.points_social_share,
                  points_successful_referral: res.data.points_successful_referral,
                });
            } catch (error) {
                console.error("Failed to load points settings", error);
            }
        };
        loadData();
    }, [reset]);

    const onSubmit = async (data: FormInputs) => {
        try {
            await api.patch('/configuration', data);
            toast.success('Configuración de Puntos guardada.');
        } catch (error) {
            toast.error('No se pudo guardar la configuración.');
        }
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Star className="text-pink-400" />
              Configuración del Sistema de Puntos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="points_attendance" className="block text-sm font-medium text-zinc-300">Puntos por Asistencia</label>
                <p className="text-xs text-zinc-500 mb-1">Puntos que gana un cliente al canjear su entrada.</p>
                <input id="points_attendance" type="number" {...register('points_attendance')} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: 100"/>
              </div>
              <div>
                <label htmlFor="points_successful_referral" className="block text-sm font-medium text-zinc-300">Puntos por Referido Exitoso</label>
                <p className="text-xs text-zinc-500 mb-1">Puntos que gana un RRPP cuando su invitado asiste.</p>
                <input id="points_successful_referral" type="number" {...register('points_successful_referral')} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: 50"/>
              </div>
              <div>
                <label htmlFor="points_social_share" className="block text-sm font-medium text-zinc-300">Puntos por Compartir en Redes</label>
                <p className="text-xs text-zinc-500 mb-1">Puntos por hacer clic en el botón de compartir evento.</p>
                <input id="points_social_share" type="number" {...register('points_social_share')} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: 10"/>
              </div>
              <div>
                <label htmlFor="points_no_show_penalty" className="block text-sm font-medium text-zinc-300">Penalización por Inasistencia (No-Show)</label>
                <p className="text-xs text-zinc-500 mb-1">Puntos que se restan si no se asiste a un evento (0 para desactivar).</p>
                <input id="points_no_show_penalty" type="number" {...register('points_no_show_penalty')} className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2" placeholder="Ej: 50"/>
              </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar Puntos'}
                </button>
            </div>
        </form>
    );
}