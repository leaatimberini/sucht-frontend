// frontend/src/app/dashboard/settings/forms/terms-and-conditions-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

// --- CORRECCIÓN CRÍTICA EN EL ESQUEMA ---
const schema = z.object({
  termsAndConditionsText: z.string().trim().min(1, 'El texto no puede estar vacío.'),
});
type FormInputs = z.infer<typeof schema>;

export function TermsAndConditionsForm() {
    const { register, handleSubmit, setValue, formState: { isSubmitting, errors } } = useForm<FormInputs>({ resolver: zodResolver(schema) });

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get('/configuration');
                if (res.data.termsAndConditionsText) {
                    setValue('termsAndConditionsText', res.data.termsAndConditionsText);
                }
            } catch (error) {
                console.error("Failed to load terms and conditions data", error);
                toast.error("Error al cargar los Términos y Condiciones.");
            }
        };
        loadData();
    }, [setValue]);

    const onSubmit = async (data: FormInputs) => {
        try {
            await api.patch('/configuration', { termsAndConditionsText: data.termsAndConditionsText });
            toast.success('Términos y Condiciones actualizados.');
        } catch (error) {
            console.error("Failed to save terms and conditions", error);
            toast.error('No se pudo guardar el texto.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-4">
            <h2 className="text-xl font-semibold text-white">Términos y Condiciones</h2>
            <textarea
              id="termsAndConditionsText"
              {...register('termsAndConditionsText')}
              rows={15}
              className="block w-full bg-zinc-800 border-zinc-700 rounded-md p-2 font-mono"
            />
            {errors.termsAndConditionsText && <p className="text-red-500 text-sm mt-1">{errors.termsAndConditionsText.message}</p>}
            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar Términos'}
                </button>
            </div>
        </form>
    );
}