'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Calendar } from 'lucide-react'; // <-- Importar Calendar
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

// Esquema de validación actualizado con dateOfBirth
const registerSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
  dateOfBirth: z.string().min(1, { message: 'La fecha de nacimiento es requerida.' }),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      await api.post('/auth/register', data);
      toast.success('¡Cuenta creada exitosamente! Por favor, inicia sesión.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Hubo un error al crear la cuenta.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-sm">
      {/* Campo de Nombre */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-300">Nombre</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            id="name"
            type="text"
            placeholder="Tu nombre y apellido"
            {...register('name')}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-12 pr-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {errors.name && (<p className="text-xs text-red-500 mt-1">{errors.name.message}</p>)}
      </div>

      {/* Campo de Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            {...register('email')}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-12 pr-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {errors.email && (<p className="text-xs text-red-500 mt-1">{errors.email.message}</p>)}
      </div>

      {/* Campo de Contraseña */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-300">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            {...register('password')}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-12 pr-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {errors.password && (<p className="text-xs text-red-500 mt-1">{errors.password.message}</p>)}
      </div>

      {/* Campo de Fecha de Nacimiento */}
      <div className="space-y-2">
        <label htmlFor="dateOfBirth" className="text-sm font-medium text-zinc-300">Fecha de Nacimiento</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-12 pr-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {errors.dateOfBirth && (<p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message}</p>)}
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-500/50 transition-all duration-300 disabled:opacity-50"
      >
        {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>
    </form>
  );
}
