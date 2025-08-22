'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    try {
      await api.post('/auth/forgot-password', data);
      setIsSubmitted(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'No se pudo procesar la solicitud.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="w-full max-w-md text-center bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold mt-4">Correo Enviado</h1>
            <p className="text-zinc-400 mt-2">
                Si existe una cuenta con ese email, recibirás un correo con las instrucciones para restablecer tu contraseña.
            </p>
            <Link href="/login" className="mt-6 inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg">
                Volver a Iniciar Sesión
            </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Recuperar Contraseña</h1>
          <p className="text-zinc-400 mt-2">
            Ingresa tu email y te enviaremos un enlace para restablecerla.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
              Email
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-zinc-400" />
              </span>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="block w-full bg-zinc-800 border-zinc-700 rounded-md p-3 pl-10 focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enviar Enlace de Recuperación'}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-pink-400">
            ¿Recordaste tu contraseña? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}