'use client';

import { AuthCheck } from "@/components/auth-check";
import { LogoutButton } from "@/components/logout-button";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/user.types";
import Link from "next/link";
import { LayoutGrid, QrCode, BarChartHorizontal, Settings, Cake } from "lucide-react";
import { useEffect, useState } from "react";

export default function RRPPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const [isVerifier, setIsVerifier] = useState(false);

  useEffect(() => {
    setIsVerifier(user?.roles.includes(UserRole.VERIFIER) || false);
  }, [user]);

  return (
    <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.RRPP]}>
      <div className="flex min-h-screen">
        <aside className="w-64 bg-zinc-900 p-4 border-r border-zinc-800 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">SUCHT</h1>
            <p className="text-sm text-pink-500">Panel RRPP</p>
          </div>
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link href="/rrpp" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Mis Eventos</span>
                </Link>
              </li>
              <li>
                <Link href="/rrpp/stats" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <BarChartHorizontal className="h-4 w-4" />
                  <span>Mis Estadísticas</span>
                </Link>
              </li>
              <li>
                <Link href="/rrpp/birthdays" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <Cake className="h-4 w-4" />
                  <span>Cumpleaños</span>
                </Link>
              </li>
              
              {isVerifier && (
                <li className="border-t border-zinc-700 pt-2 mt-2">
                  {/* --- CORRECCIÓN AQUÍ --- */}
                  <Link href="/verifier" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                    <QrCode className="h-4 w-4" />
                    <span>Verificar Acceso</span>
                  </Link>
                </li>
              )}

               <li className="border-t border-zinc-700 pt-2 mt-2">
                <Link href="/rrpp/settings" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
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
