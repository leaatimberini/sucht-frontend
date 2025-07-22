'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z
    .string()
    .min(1, { message: 'La contraseña no puede estar vacía.' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore(); // Obtenemos la acción de login de nuestro store

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login(data);
      toast.success('¡Login exitoso!');

      // Lógica de redirección por rol
      // Usamos un pequeño delay para que el estado de Zustand se actualice
      setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.role === 'ADMIN') {
          router.push('/dashboard');
        } else {
          // Por defecto, cualquier otro rol va a su cuenta
          router.push('/mi-cuenta');
        }
      }, 50); // 50ms es suficiente

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Campo de Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-zinc-300"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-12 pr-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Campo de Contraseña */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-300"
          >
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-12 pr-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-zinc-400">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-semibold text-pink-500 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}