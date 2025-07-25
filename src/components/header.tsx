'use client';

import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { User, LogIn, Ticket } from "lucide-react";
import { UserRole } from "@/types/user.types";

export function Header() {
  const { isLoggedIn, user, token } = useAuthStore();
  
  // Pequeño truco para forzar la re-renderización del componente cuando el estado cambia
  // ya que a veces el estado de zustand puede no actualizar los componentes de servidor inmediatamente
  const isUserLoggedIn = isLoggedIn();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-white">
          SUCHT
        </Link>

        <nav className="flex items-center space-x-6 text-sm font-medium text-zinc-300">
          <Link href="/eventos" className="hover:text-white transition-colors">
            Eventos
          </Link>

          {isUserLoggedIn ? (
            <>
              {/* Menú para usuarios logueados */}
              {user?.roles.includes(UserRole.ADMIN) && (
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              )}
              {user?.roles.includes(UserRole.RRPP) && (
                <Link href="/rrpp" className="hover:text-white transition-colors">
                  Panel RRPP
                </Link>
              )}
              <Link href="/mi-cuenta" className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-full transition-colors">
                <Ticket className="h-4 w-4" />
                <span>Mis Entradas</span>
              </Link>
            </>
          ) : (
            <>
              {/* Menú para visitantes */}
              <Link href="/login" className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full transition-colors">
                <LogIn className="h-4 w-4" />
                <span>Ingresar</span>
              </Link>
              <Link href="/register" className="hidden sm:block hover:text-white transition-colors">
                Crear Cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}