import { AuthCheck } from "@/components/auth-check";
import { LogoutButton } from "@/components/logout-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ¡Nuestro guardia ahora pide credenciales de ADMIN!
    <AuthCheck allowedRoles={['ADMIN']}>
      <div className="flex min-h-screen">
        {/* Barra Lateral (Sidebar) */}
        <aside className="w-64 bg-zinc-900 p-4 border-r border-zinc-800 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">SUCHT</h1>
            <p className="text-sm text-pink-500">Panel de Control</p>
          </div>
          
          <nav className="flex-1">
            <ul>
              {/* Aquí irán los links de navegación */}
              <li className="text-zinc-300">Métricas</li>
              <li className="text-zinc-300">Eventos</li>
              <li className="text-zinc-300">Ventas</li>
            </ul>
          </nav>
          
          {/* Sección de Logout */}
          <div>
            <LogoutButton />
          </div>
        </aside>
        
        {/* Contenido Principal */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </AuthCheck>
  );
}