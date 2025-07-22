import { AuthCheck } from "@/components/auth-check";

export default function MiCuentaPage() {
  return (
    // También protegemos esta página. Por defecto, AuthCheck solo requiere estar logueado.
    <AuthCheck>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
        <p className="mt-2 text-zinc-400">
          Aquí verás tus entradas, historial y más.
        </p>
      </div>
    </AuthCheck>
  );
}