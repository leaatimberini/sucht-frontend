'use client';

import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { LogIn, User, ChevronDown, LogOut, LayoutGrid, QrCode, BarChartHorizontal, GlassWater, ShoppingBasket, Bell, Send, Briefcase } from 'lucide-react';
import { UserRole } from '@/types/user.types';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import { NotificationsModal } from './NotificationsModal';

export function Header() {
  const { user, logout } = useAuthStore();
  const totalItemsInCart = useCartStore(state => state.totalItems());
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [hasMounted, setHasMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const isAdmin = user?.roles.includes(UserRole.ADMIN);
  const isOwner = user?.roles.includes(UserRole.OWNER);
  const isRrpp = user?.roles.includes(UserRole.RRPP);
  const isVerifier = user?.roles.includes(UserRole.VERIFIER);
  const isBarra = user?.roles.includes(UserRole.BARRA);
  const isOrganizer = user?.roles.includes(UserRole.ORGANIZER);

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };
  
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-white">SUCHT</Link>
          <nav className="relative flex items-center space-x-4 md:space-x-6 text-sm font-medium text-zinc-300">
            <Link href="/eventos" className="hover:text-white transition-colors">Eventos</Link>
            
            {/* --- LÓGICA DE VISUALIZACIÓN CORREGIDA --- */}
            {hasMounted && user ? (
              // 1. Si el componente está montado y HAY usuario, muestra el panel de usuario.
              <>
                <div className="relative">
                  <button onClick={toggleNotifications} className="relative hover:text-white transition-colors">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                <Link href="/cart" className="relative hover:text-white transition-colors">
                   <ShoppingBasket className="h-6 w-6" />
                   {totalItemsInCart > 0 && (
                     <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                       {totalItemsInCart}
                     </span>
                   )}
                 </Link>
                <div className="relative">
                  <button onClick={toggleUserMenu} className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-full transition-colors">
                    <User className="h-4 w-4" />
                    <span>Mi cuenta</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showUserMenu && (
                    <div className="absolute top-16 right-0 bg-zinc-900 shadow-lg rounded-lg text-white w-60 z-50 border border-zinc-700">
                      <Link href="/mi-cuenta" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><LayoutGrid size={16}/> Mi Panel</Link>
                      <Link href="/store" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><ShoppingBasket size={16}/> Tienda</Link>
                      {isAdmin && ( <Link href="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><LayoutGrid size={16} /> Panel Admin</Link> )}
                      {isOwner && !isAdmin && ( <Link href="/dashboard/owner" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><LayoutGrid size={16} /> Panel Dueño</Link> )}
                      {isOrganizer && !isAdmin && !isOwner && ( <Link href="/dashboard/organizer" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><Briefcase size={16} /> Panel Organizador</Link> )}
                      {isRrpp && (<Link href="/rrpp" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><BarChartHorizontal size={16} /> Panel RRPP</Link>)}
                      {(isVerifier || isAdmin) && (<Link href="/verifier" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><QrCode size={16} /> Verificar Entradas</Link>)}
                      {(isBarra || isAdmin) && (<Link href="/bar-scanner" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"><GlassWater size={16} /> Validar Premios</Link>)}
                      <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-red-600/80 transition-colors border-t border-zinc-700"><LogOut size={16} />Cerrar sesión</button>
                    </div>
                  )}
                </div>
              </>
            ) : hasMounted && !user ? (
              // 2. Si el componente está montado y NO HAY usuario, muestra el botón de Ingresar.
              <Link href="/login" className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-full transition-colors">
                <LogIn className="h-4 w-4" />
                <span>Ingresar</span>
              </Link>
            ) : (
              // 3. Mientras el componente no se ha montado, muestra un placeholder para evitar saltos visuales.
              <div className="h-9 w-36 bg-zinc-800 rounded-full animate-pulse"></div>
            )}

          </nav>
        </div>
      </header>
      
      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}