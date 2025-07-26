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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const profileSchema = z.object({
  name: z.string().min(3, { message: 'El nombre es requerido.' }),
  instagramHandle: z.string().optional(),
  whatsappNumber: z.string().optional(),
  dateOfBirth: z.string().min(1, { message: 'La fecha de nacimiento es requerida.' }),
  profileImage: z.any().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

export function EditProfileForm({ user }: { user: User }) {
  const [preview, setPreview] = useState<string | null>(
    user.profileImageUrl ? `${API_URL}${user.profileImageUrl}` : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      instagramHandle: user.instagramHandle || '',
      whatsappNumber: user.whatsappNumber || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    }
  };
  
  const onSubmit = async (data: ProfileFormInputs) => {
    const formData = new FormData();
    
    // Añadimos los campos de texto
    formData.append('name', data.name);
    formData.append('instagramHandle', data.instagramHandle || '');
    formData.append('whatsappNumber', data.whatsappNumber || '');
    formData.append('dateOfBirth', data.dateOfBirth);
    
    // --- CORRECCIÓN CLAVE ---
    // Verificamos si el usuario seleccionó un archivo nuevo
    // y lo añadimos al FormData.
    if (data.profileImage && data.profileImage.length > 0) {
      formData.append('profileImage', data.profileImage[0]);
    }

    try {
      const response = await api.patch('/users/profile/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('¡Perfil actualizado!');
      if (response.data.profileImageUrl) {
        setPreview(`${API_URL}${response.data.profileImageUrl}`);
      }
    } catch (error) {
      toast.error('No se pudo actualizar el perfil.');
    }
  };

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
        <input id="profileImage" type="file" className="hidden" {...register('profileImage')} onChange={handleFileChange} accept="image/png, image/jpeg"/>
        <p className="text-sm text-zinc-400">Haz clic en el círculo para cambiar tu foto</p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
        <input {...register('name')} id="name" className="w-full bg-zinc-800 rounded-md p-2"/>
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
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
