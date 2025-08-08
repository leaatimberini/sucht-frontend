// frontend/src/components/edit-profile-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from '@/types/user.types';
import { useState } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { UploadCloud } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const profileSchema = z.object({
  name: z.string().min(3, { message: 'El nombre es requerido.' }),
  username: z.string().min(3, { message: 'El nombre de usuario es requerido.' }).regex(/^[a-zA-Z0-9_.]+$/, { message: 'Solo letras, números, _ o .' }),
  instagramHandle: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().min(1, { message: 'La fecha de nacimiento es requerida.' }).optional().nullable(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const formatDateToInput = (date?: Date | string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

interface EditProfileFormProps {
  user: User;
  onProfileUpdated?: () => void;
  isUsernameSetupMode?: boolean;
}

export function EditProfileForm({ user, onProfileUpdated, isUsernameSetupMode = false }: EditProfileFormProps) {
  const [preview, setPreview] = useState<string | null>(user.profileImageUrl ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { fetchUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      username: user.username || '',
      instagramHandle: user.instagramHandle || '',
      whatsappNumber: user.whatsappNumber || '',
      dateOfBirth: formatDateToInput(user.dateOfBirth),
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  
  const onSubmit = async (data: ProfileFormInputs) => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    if (selectedFile) {
      formData.append('profileImage', selectedFile);
    }

    try {
      await api.patch('/users/profile/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('¡Perfil actualizado!');
      await fetchUser(); // Actualizamos el estado global del usuario
      if (onProfileUpdated) {
        onProfileUpdated(); // Llamamos al callback si existe (para cerrar el modal)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'No se pudo actualizar el perfil.');
    }
  };

  // Vista simplificada para la creación del username
  if (isUsernameSetupMode) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name-setup" className="block text-sm font-medium text-zinc-300 mb-1">Nombre y Apellido</label>
          <input {...register('name')} id="name-setup" className="w-full bg-zinc-800 rounded-md p-2"/>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="username-setup" className="block text-sm font-medium text-zinc-300 mb-1">Nombre de Usuario (para tu link)</label>
          <input {...register('username')} id="username-setup" className="w-full bg-zinc-800 rounded-md p-2"/>
          {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : 'Guardar y Activar Link'}
        </button>
      </form>
    )
  }

  // Vista completa del formulario de edición
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
      <div className="flex flex-col items-center space-y-4">
        <label htmlFor="profileImage" className="cursor-pointer">
          <div className="w-32 h-32 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-600 flex items-center justify-center text-zinc-500 hover:bg-zinc-700 hover:border-pink-500 transition-all">
            {preview ? (
              <Image src={preview} alt="Vista previa" width={128} height={128} className="rounded-full object-cover w-full h-full" />
            ) : (
              <UploadCloud className="w-12 h-12" />
            )}
          </div>
        </label>
        <input id="profileImage" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg"/>
        <p className="text-sm text-zinc-400">Haz clic en el círculo para cambiar tu foto</p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
        <input {...register('name')} id="name" className="w-full bg-zinc-800 rounded-md p-2"/>
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-1">Nombre de Usuario (para tu link)</label>
        <input {...register('username')} id="username" className="w-full bg-zinc-800 rounded-md p-2"/>
        {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
      </div>
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-zinc-300 mb-1">Fecha de Nacimiento</label>
        <input {...register('dateOfBirth')} id="dateOfBirth" type="date" className="w-full bg-zinc-800 rounded-md p-2"/>
        {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message}</p>}
      </div>
      <div>
        <label htmlFor="instagramHandle" className="block text-sm font-medium text-zinc-300 mb-1">Instagram (usuario sin @)</label>
        <input {...register('instagramHandle')} id="instagramHandle" placeholder="tu.usuario" className="w-full bg-zinc-800 rounded-md p-2"/>
      </div>
      <div>
        <label htmlFor="whatsappNumber" className="block text-sm font-medium text-zinc-300 mb-1">WhatsApp (con cód. de país)</label>
        <input {...register('whatsappNumber')} id="whatsappNumber" placeholder="+541122334455" className="w-full bg-zinc-800 rounded-md p-2"/>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
}