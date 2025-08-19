// src/components/header.tsx
'use client';

import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { LogIn, User, ChevronDown, LogOut, LayoutGrid, QrCode, BarChartHorizontal, GlassWater, ShoppingBasket, Bell } from 'lucide-react';
import { UserRole } from '@/types/user.types';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import { NotificationPopover } from './notification-popover';

export function Header() {
  const { user, logout } = useAuthStore();
  const totalItemsInCart = useCartStore(state => state.totalItems());
  const { unreadCount, fetchNotifications } = useNotificationStore();

  const [hasMounted, setHasMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // ref para detectar click-outside en desktop
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHasMounted(true);
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const closeAll = useCallback(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
  }, []);

  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => {
      const next = !prev;
      if (next && user) fetchNotifications();
      if (showUserMenu) setShowUserMenu(false);
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Bloquear scroll en mobile cuando el modal de notificaciones está abierto
  useEffect(() => {
    if (!hasMounted) return;
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;

    if (showNotifications && isMobile) {
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevBodyOverflow = document.body.style.overflow;
      const prevOverscroll = (document.body.style as any).overscrollBehaviorY;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      (document.body.style as any).overscrollBehaviorY = 'contain';

      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowNotifications(false); };
      window.addEventListener('keydown', onKey);

      return () => {
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
        (document.body.style as any).overscrollBehaviorY = prevOverscroll ?? '';
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [showNotifications, hasMounted]);

  // Cerrar con ESC también en desktop cuando está abierto
  useEffect(() => {
    if (!showNotifications) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowNotifications(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showNotifications]);

  // Click-outside en desktop para cerrar el popover
  useEffect(() => {
    if (!showNotifications) return;
    const onDown = (e: MouseEvent) => {
      const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches;
      if (!isDesktop) return; // en mobile hay overlay interno que maneja el cierre
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showNotifications]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-white" onClick={closeAll}>SUCHT</Link>
        <nav className="relative flex items-center space-x-4 md:space-x-6 text-sm font-medium text-zinc-300">
          <Link href="/eventos" className="hover:text-white transition-colors" onClick={closeAll}>Eventos</Link>

          {hasMounted && user ? (
            <>
              {/* Notificaciones */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotifications}
                  aria-haspopup="dialog"
                  aria-expanded={showNotifications}
                  aria-controls="notifications-popover"
                  className="relative hover:text-white transition-colors"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center animate-pulse leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div id="notifications-popover">
                    <NotificationPopover onClose={() => setShowNotifications(false)} />
                  </div>
                )}
              </div>

              {/* Carrito */}
              <Link href="/cart" className="relative hover:text-white transition-colors" onClick={closeAll}>
                <ShoppingBasket className="h-6 w-6" />
                {totalItemsInCart > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center leading-none">
                    {totalItemsInCart > 99 ? '99+' : totalItemsInCart}
                  </span>
                )}
              </Link>

              {/* Menú usuario */}
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  aria-haspopup="menu"
                  aria-expanded={showUserMenu}
                  className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-full transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Mi cuenta</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute top-16 right-0 bg-zinc-900 shadow-lg rounded-lg text-white w-60 z-50 border border-zinc-700">
                    <Link href="/mi-cuenta" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><LayoutGrid size={16}/> Mi Panel</Link>
                    <Link href="/store" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><ShoppingBasket size={16}/> Tienda</Link>

                    {(user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.OWNER)) && (
                      <Link href="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800">
                        <LayoutGrid size={16} /> Panel de Control
                      </Link>
                    )}

                    {user.roles.includes(UserRole.RRPP) && (
                      <Link href="/rrpp" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800">
                        <BarChartHorizontal size={16} /> Panel RRPP
                      </Link>
                    )}

                    {user.roles.includes(UserRole.VERIFIER) && (
                      <Link href="/verifier" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800">
                        <QrCode size={16} /> Verificar Entradas
                      </Link>
                    )}

                    {user.roles.includes(UserRole.BARRA) && (
                      <Link href="/bar-scanner" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800">
                        <GlassWater size={16} /> Validar Premios
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-red-600/80 transition-colors border-t border-zinc-700"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : hasMounted && !user ? (
            <Link href="/login" className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full transition-colors" onClick={closeAll}>
              <LogIn className="h-4 w-4" />
              <span>Ingresar</span>
            </Link>
          ) : (
            <div className="h-9 w-36 bg-zinc-800 rounded-full animate-pulse"></div>
          )}
        </nav>
      </div>
    </header>
  );
}
