'use client';

import { AuthCheck } from "@/components/auth-check";
import { LogoutButton } from "@/components/logout-button";
import { UserRole } from "@/types/user.types";
import Link from "next/link";
import { 
  LayoutGrid, 
  Users, 
  UserSquare, 
  Settings, 
  CreditCard,
  BarChartHorizontal,
  Cake // 1. ÍCONO AÑADIDO
} from "lucide-react";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Aseguramos que solo el OWNER pueda ver este layout
    <AuthCheck allowedRoles={[UserRole.OWNER]}> 
      <div className="flex min-h-screen">
        <aside className="w-64 bg-zinc-900 p-4 border-r border-zinc-800 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">SUCHT</h1>
            <p className="text-sm text-amber-500">Panel de Dueño</p>
          </div>
          
          <nav className="flex-1">
            {/* 2. MENÚ CORREGIDO Y ACTUALIZADO PARA EL DUEÑO */}
            <ul className="space-y-2">
              <li>
                <Link href="/owner" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Métricas</span>
                </Link>
              </li>
              <li>
                <Link href="/owner/sales" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <CreditCard className="h-4 w-4" />
                  <span>Ventas</span>
                </Link>
              </li>
               <li>
                <Link href="/owner/rrpp-stats" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <BarChartHorizontal className="h-4 w-4" />
                  <span>Rendimiento RRPP</span>
                </Link>
              </li>
              <li>
                <Link href="/owner/staff" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <Users className="h-4 w-4" />
                  <span>Staff</span>
                </Link>
              </li>
              <li>
                <Link href="/owner/clients" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <UserSquare className="h-4 w-4" />
                  <span>Clientes</span>
                </Link>
              </li>
              <li>
                <Link href="/owner/birthdays" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <Cake className="h-4 w-4" />
                  <span>Cumpleaños</span>
                </Link>
              </li>
              <li className="border-t border-zinc-700 pt-2 mt-2">
                <Link href="/owner/settings" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
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