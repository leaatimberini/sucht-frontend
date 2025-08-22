'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error("Token de restablecimiento no encontrado.");
      router.push('/login');
    }
  }, [searchParams, router]);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    if (!token) {
      toast.error("Falta el token de seguridad.");
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'No se pudo restablecer la contraseña.');
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="w-full max-w-md text-center bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold mt-4">Contraseña Actualizada</h1>
            <p className="text-zinc-400 mt-2">
                Tu contraseña ha sido restablecida con éxito. Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link href="/login" className="mt-6 inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg">
                Ir a Iniciar Sesión
            </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Restablecer Contraseña</h1>
          <p className="text-zinc-400 mt-2">
            Ingresa tu nueva contraseña.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
              Nueva Contraseña
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-zinc-400" />
              </span>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="block w-full bg-zinc-800 border-zinc-700 rounded-md p-3 pl-10 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
              Confirmar Nueva Contraseña
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-zinc-400" />
              </span>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="block w-full bg-zinc-800 border-zinc-700 rounded-md p-3 pl-10 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-2">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full flex justify-center items-center bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar Nueva Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}