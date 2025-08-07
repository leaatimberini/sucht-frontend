'use client';

import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { LogIn, User, ChevronDown, LogOut, LayoutGrid, QrCode, BarChartHorizontal, GlassWater, ShoppingBasket } from 'lucide-react';
import { UserRole } from '@/types/user.types';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart-store';

export function Header() {
  const { user, logout } = useAuthStore();
  const totalItemsInCart = useCartStore(state => state.totalItems());
  const [hasMounted, setHasMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isAdmin = user?.roles.includes(UserRole.ADMIN);
  const isOwner = user?.roles.includes(UserRole.OWNER);
  const isRrpp = user?.roles.includes(UserRole.RRPP);
  const isVerifier = user?.roles.includes(UserRole.VERIFIER);
  const isBarra = user?.roles.includes(UserRole.BARRA);

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

          {hasMounted && user && (
            <Link href="/cart" className="relative hover:text-white transition-colors">
              <ShoppingBasket className="h-6 w-6" />
              {totalItemsInCart > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItemsInCart}
                </span>
              )}
            </Link>
          )}

          {hasMounted && user ? (
            <>
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-full transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Mi cuenta</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
              </button>

              {showMenu && (
                <div className="absolute top-16 right-0 bg-zinc-900 shadow-lg rounded-lg text-white w-56 z-50 border border-zinc-700">
                  <Link href="/mi-cuenta" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800">
                    <User size={16}/> Mis Entradas
                  </Link>
                  <Link href="/store" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800">
                      <ShoppingBasket size={16}/> Tienda
                  </Link>

                  {(isAdmin || isOwner) && (
                    <Link href="/dashboard" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800">
                      <LayoutGrid size={16} /> Panel de Control
                    </Link>
                  )}
                  
                  {isRrpp && (
                    <Link href="/rrpp" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800">
                       <BarChartHorizontal size={16} /> Panel RRPP
                    </Link>
                  )}

                  {(isVerifier || isAdmin) && (
                    <Link href="/verifier" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800">
                      <QrCode size={16} /> Verificar Entradas
                    </Link>
                  )}
                  
                  {(isBarra || isAdmin) && (
                    <Link href="/bar-scanner" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800">
                      <GlassWater size={16} /> Validar Premios
                    </Link>
                  )}

                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-red-600/80 transition-colors border-t border-zinc-700">
                    <LogOut size={16} />
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
            </>
          ) : (
            <div className="h-9 w-24 bg-zinc-800 rounded-full animate-pulse"></div>
          )}
        </nav>
      </div>
    </header>
  );
}