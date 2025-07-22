import { LoginForm } from '@/components/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          Bienvenido
        </h1>
        <p className="text-zinc-400 mb-8">
          Inicia sesión para acceder a tu cuenta.
        </p>
      </div>

      {/* Aquí renderizamos nuestro componente de formulario */}
      <LoginForm />

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