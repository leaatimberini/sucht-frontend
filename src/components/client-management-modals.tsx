'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { User } from '@/types/user.types';
import { X, Save, Key, AlertTriangle } from 'lucide-react';

// --- EDIT MODAL ---

const editSchema = z.object({
    name: z.string().min(2, "El nombre es muy corto"),
    email: z.string().email("Email inválido"),
    username: z.string().optional().or(z.literal('')),
    dateOfBirth: z.string().optional().or(z.literal('')),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditClientModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditClientModal({ user, isOpen, onClose, onSuccess }: EditClientModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<EditFormValues>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            name: user.name || '',
            email: user.email,
            username: user.username || '',
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        }
    });

    // Reset form when user changes
    useEffect(() => {
        if (user) {
            reset({
                name: user.name || '',
                email: user.email,
                username: user.username || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: EditFormValues) => {
        setIsSubmitting(true);
        try {
            await api.patch(`/users/${user.id}`, data);
            toast.success('Cliente actualizado correctamente');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error al actualizar cliente');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold text-white mb-4">Editar Cliente</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre</label>
                        <input
                            {...register('name')}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                        <input
                            {...register('email')}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Usuario (Opcional)</label>
                        <input
                            {...register('username')}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Fecha de Nacimiento</label>
                        <input
                            type="date"
                            {...register('dateOfBirth')}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Guardando...' : <><Save className="h-4 w-4" /> Guardar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- PASSWORD MODAL ---

interface ResetPasswordModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

export function ResetPasswordModal({ user, isOpen, onClose }: ResetPasswordModalProps) {
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.patch(`/users/${user.id}/force-password`, { password });
            toast.success('Contraseña actualizada correctamente');
            setPassword('');
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error('Error al cambiar la contraseña');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Key className="h-5 w-5 text-yellow-500" />
                    Cambiar Contraseña
                </h2>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 mb-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-200">
                        Esta acción sobrescribirá la contraseña actual del usuario <strong>{user.email}</strong> inmediatamente.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Nueva Contraseña</label>
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Escribe la nueva contraseña..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
