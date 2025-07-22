import { AuthCheck } from "@/components/auth-check";
import { LogoutButton } from "@/components/logout-button";
import { UserRole } from "@/types/user.types";
import Link from "next/link";
import { Calendar, LayoutGrid, BarChart3, Users } from "lucide-react"; // <-- Importar icono Users

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCheck allowedRoles={[UserRole.ADMIN]}> 
      <div className="flex min-h-screen">
        {/* Barra Lateral (Sidebar) */}
        <aside className="w-64 bg-zinc-900 p-4 border-r border-zinc-800 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">SUCHT</h1>
            <p className="text-sm text-pink-500">Panel de Control</p>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Métricas</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/events" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <Calendar className="h-4 w-4" />
                  <span>Eventos</span>
                </Link>
              </li>
              {/* NUEVO LINK DE STAFF */}
              <li>
                <Link href="/dashboard/staff" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <Users className="h-4 w-4" />
                  <span>Staff</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>Ventas</span>
                </Link>
              </li>
            </ul>
          </nav>
          
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