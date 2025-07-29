'use client';

import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { LogIn, Ticket, User, ChevronDown, LogOut } from 'lucide-react';
import { UserRole } from '@/types/user.types';
import { useEffect, useState } from 'react';

export function Header() {
  const { user, logout } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const toggleMenu = () => setShowMenu(!showMenu);
  const handleLogout = () => {
    logout();
    setShowMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-white">
          SUCHT
        </Link>

        <nav className="relative flex items-center space-x-6 text-sm font-medium text-zinc-300">
          <Link href="/eventos" className="hover:text-white transition-colors">
            Eventos
          </Link>

          {hasMounted && user ? (
            <>
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-full transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Mi cuenta</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="absolute top-16 right-0 bg-zinc-900 shadow-lg rounded-lg overflow-hidden text-white w-52 z-50 border border-zinc-700">
                  <Link
                    href="/mi-cuenta"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-3 hover:bg-zinc-800"
                  >
                    Mis Entradas
                  </Link>
                  {user.roles.includes(UserRole.RRPP) && (
                    <Link
                      href="/rrpp"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 hover:bg-zinc-800"
                    >
                      Panel RRPP
                    </Link>
                  )}
                  {user.roles.includes(UserRole.ADMIN) && (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setShowMenu(false)}
                        className="block px-4 py-3 hover:bg-zinc-800"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/verificar"
                        onClick={() => setShowMenu(false)}
                        className="block px-4 py-3 hover:bg-zinc-800"
                      >
                        Verificar Entradas
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-red-600 transition-colors"
                  >
                    <LogOut className="inline-block mr-2 h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </>
          ) : hasMounted && !user ? (
            <>
              <Link
                href="/login"
                className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Ingresar</span>
              </Link>
              <Link
                href="/register"
                className="hidden sm:block hover:text-white transition-colors"
              >
                Crear Cuenta
              </Link>
            </>
          ) : (
            <div className="h-9 w-24 bg-zinc-800 rounded-full animate-pulse"></div>
          )}
        </nav>
      </div>
    </header>
  );
}
