'use client';

import { AuthCheck } from "@/components/auth-check";
import { LogoutButton } from "@/components/logout-button";
import { UserRole } from "@/types/user.types";
import Link from "next/link";
import { Calendar, LayoutGrid, BarChart3, Users, QrCode, UserSquare, BarChartHorizontal, Settings, Bell } from "lucide-react"; // 1. IMPORTAR ICONO BELL

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 2. AÑADIMOS EL ROL 'OWNER' A LOS PERMITIDOS
    <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER]}> 
      <div className="flex min-h-screen">
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
              <li>
                <Link href="/dashboard/staff" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <Users className="h-4 w-4" />
                  <span>Staff</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/clients" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <UserSquare className="h-4 w-4" />
                  <span>Clientes</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/rrpp-stats" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <BarChartHorizontal className="h-4 w-4" />
                  <span>Rendimiento RRPP</span>
                </Link>
              </li>
              <li className="border-t border-zinc-700 pt-2 mt-2">
                <Link href="/verifier" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <QrCode className="h-4 w-4" />
                  <span>Verificar Acceso</span>
                </Link>
              </li>
              {/* --- 3. NUEVO LINK AÑADIDO --- */}
              <li>
                <Link href="/dashboard/notifications" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <Bell className="h-4 w-4" />
                  <span>Notificaciones</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Configuración</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          <div>
            <LogoutButton />
          </div>
        </aside>
        
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </AuthCheck>
  );
}
