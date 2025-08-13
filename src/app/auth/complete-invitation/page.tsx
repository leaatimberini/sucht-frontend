'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, Suspense } from 'react'; // 1. Importar Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const completeInvitationSchema = z.object({
  name: z.string().min(3, { message: 'El nombre es requerido.' }),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Debes introducir tu fecha de nacimiento.',
  }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type FormInputs = z.infer<typeof completeInvitationSchema>;

// 2. Creamos un componente interno para el formulario
function InvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: zodResolver(completeInvitationSchema),
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Token de invitación no encontrado o inválido.');
    }
  }, [searchParams]);

  const onSubmit = async (data: FormInputs) => {
    if (!token) {
      toast.error('Falta el token de invitación.');
      return;
    }
    try {
      await api.post('/users/complete-invitation', {
        token,
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        password: data.password,
      });
      toast.success('¡Tu cuenta ha sido creada con éxito! Ya puedes iniciar sesión.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hubo un error al crear tu cuenta.');
      console.error(err);
    }
  };
  
  if (error) {
    return (
        <div className="text-center py-20 text-white">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
            <p className="text-zinc-400">{error}</p>
            <Link href="/" className="mt-6 inline-block text-pink-400 hover:underline">Volver al inicio</Link>
        </div>
    )
  }
  
  if (!token) {
    return <div className="text-center py-20"><Loader2 className="animate-spin text-pink-500 mx-auto" /></div>
  }

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-8 space-y-6">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Finaliza tu Registro</h1>
            <p className="text-zinc-400 mt-2">Completa tus datos para activar tu cuenta de invitado.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Nombre y Apellido</label>
            <input {...register('name')} id="name" className="w-full bg-zinc-800 rounded-md p-2" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-zinc-300 mb-1">Fecha de Nacimiento</label>
            <input {...register('dateOfBirth')} id="dateOfBirth" type="date" className="w-full bg-zinc-800 rounded-md p-2" />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-zinc-300 mb-1">Crea tu Contraseña</label>
            <input {...register('password')} id="password" type="password" className="w-full bg-zinc-800 rounded-md p-2" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword"  className="block text-sm font-medium text-zinc-300 mb-1">Confirma tu Contraseña</label>
            <input {...register('confirmPassword')} id="confirmPassword" type="password" className="w-full bg-zinc-800 rounded-md p-2" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
            {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Crear Cuenta'}
          </button>
        </form>
    </div>
  );
}

// 3. La página ahora envuelve el formulario en <Suspense>
export default function CompleteInvitationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Suspense fallback={<div className="text-center py-20"><Loader2 className="animate-spin text-pink-500 mx-auto" /></div>}>
        <InvitationForm />
      </Suspense>
    </div>
  );
}