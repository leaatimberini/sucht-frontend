'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, Ticket, ShoppingBag, Gift, History, Edit, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

// 1. Creamos un mapa que asocia los nombres de los íconos con los componentes reales
const iconMap: { [key: string]: LucideIcon } = {
  Ticket,
  ShoppingBag,
  Gift,
  History,
  Edit,
};

interface NavItem {
  href: string;
  label: string;
  iconName: string; // Ahora recibimos un string
}

interface AccountNavProps {
  items: NavItem[];
}

export function AccountNav({ items }: AccountNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = iconMap[item.iconName]; // 2. Buscamos el componente en nuestro mapa
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-pink-600/20 text-pink-400'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {/* 3. Renderizamos el componente encontrado */}
            {IconComponent && <IconComponent className="h-5 w-5" />}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Vista para Móvil */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-left text-white"
        >
          <span className="font-semibold">Menú de Opciones</span>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {isMobileMenuOpen && (
          <nav className="mt-4 flex flex-col space-y-2">
            {navLinks}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </nav>
        )}
      </div>

      {/* Vista para Desktop */}
      <div className="hidden md:block">
        <h3 className="mb-4 text-lg font-semibold text-white">Mi Cuenta</h3>
        <nav className="flex flex-col space-y-2">
          {navLinks}
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      </div>
    </>
  );
}