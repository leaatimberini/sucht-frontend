'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { UserRole } from '@/types/user.types';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z
    .string()
    .min(1, { message: 'La contraseña no puede estar vacía.' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();

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

      setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        
        if (currentUser?.roles.includes(UserRole.ADMIN)) {
          router.push('/dashboard');
        } else if (currentUser?.roles.includes(UserRole.OWNER)) {
          router.push('/dashboard/owner');
        } else if (currentUser?.roles.includes(UserRole.ORGANIZER)) {
          router.push('/dashboard/organizer');
        } else if (currentUser?.roles.includes(UserRole.RRPP)) {
          router.push('/rrpp');
        } else {
          router.push('/mi-cuenta');
        }
      }, 50);

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input id="email" type="email" placeholder="tu@email.com" {...register('email')} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-12 pr-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"/>
          </div>
          {errors.email && (<p className="text-xs text-red-500 mt-1">{errors.email.message}</p>)}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-medium text-zinc-300">Contraseña</label>
            {/* --- ENLACE AÑADIDO --- */}
            <Link href="/auth/forgot-password" tabIndex={-1} className="text-xs text-zinc-500 hover:text-pink-400">¿Olvidaste tu contraseña?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input id="password" type="password" placeholder="••••••••" {...register('password')} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-12 pr-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"/>
          </div>
          {errors.password && (<p className="text-xs text-red-500 mt-1">{errors.password.message}</p>)}
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-zinc-400">¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-semibold text-pink-500 hover:underline">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}