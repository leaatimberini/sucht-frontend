import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          Bienvenido
        </h1>
        <p className="text-zinc-400">
          Inicia sesión para acceder a tu cuenta.
        </p>
      </div>

      {/* Renderizamos nuestro componente de formulario, que ahora contiene todo */}
      <LoginForm />

      {/* El div que estaba aquí ha sido eliminado */}
    </div>
  );
}