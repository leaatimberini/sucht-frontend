import { RegisterForm } from '@/components/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          Crea tu Cuenta
        </h1>
        <p className="text-zinc-400">
          Únete a la comunidad de SUCHT.
        </p>
      </div>

      <RegisterForm />

      <div className="mt-6 text-center">
        <p className="text-sm text-zinc-400">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-semibold text-pink-500 hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}