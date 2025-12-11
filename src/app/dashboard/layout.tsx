// src/app/dashboard/layout.tsx
'use client';

import { AuthCheck } from "@/components/auth-check";
import { LogoutButton } from "@/components/logout-button";
import { UserRole } from "@/types/user.types";
import Link from "next/link";
import {
  Calendar, LayoutGrid, Users, QrCode, UserSquare, BarChartHorizontal,
  Settings, Bell, UserX, Trophy, CreditCard, Gift, ShoppingBasket,
  PartyPopper, Send, Package, Ticket, Briefcase, Armchair, Store, Menu, X, User, Megaphone, Star, Sparkles
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NavLink = ({ href, icon: Icon, children, onClick, liClassName }: { href: string, icon: React.ElementType, children: React.ReactNode, onClick?: () => void, liClassName?: string }) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <li className={liClassName}>
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-pink-600/20 text-pink-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-700'
          }`}>
        <Icon className="h-4 w-4" />
        <span>{children}</span>
      </Link>
    </li>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only enabling roles after mount
  const isAdmin = mounted && user?.roles.includes(UserRole.ADMIN);
  const isOwner = mounted && user?.roles.includes(UserRole.OWNER);
  const isOrganizer = mounted && user?.roles.includes(UserRole.ORGANIZER);

  const getPanelTitle = () => {
    if (isAdmin) return 'Panel de Administrador';
    if (isOwner) return 'Panel de Dueño';
    if (isOrganizer) return 'Panel de Organizador';
    return 'Panel de Control';
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.ORGANIZER]}>
      <div className="flex min-h-screen bg-black">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 w-full bg-zinc-900 border-b border-zinc-800 z-40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="text-zinc-400 hover:text-white">
              <Menu size={24} />
            </button>
            <Link href="/">
              <h1 className="text-lg font-bold text-white">SUCHT</h1>
            </Link>
          </div>
        </div>

        {/* Overlay for Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside className={`
            fixed top-0 left-0 h-full z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-4 transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:static md:h-screen
        `}>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link href="/">
                <h1 className="text-2xl font-bold text-white hover:text-pink-500 transition-colors">SUCHT</h1>
              </Link>
              <p className="text-sm text-pink-500">{getPanelTitle()}</p>
            </div>
            <button onClick={closeSidebar} className="md:hidden text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {isAdmin && (
                <>
                  <NavLink href="/dashboard" icon={LayoutGrid} onClick={closeSidebar}>Métricas</NavLink>
                  <NavLink href="/dashboard/sales" icon={CreditCard} onClick={closeSidebar}>Ventas (Tickets)</NavLink>
                  <NavLink href="/dashboard/product-sales" icon={Package} onClick={closeSidebar}>Ventas (Productos)</NavLink>
                  <NavLink href="/dashboard/events" icon={Calendar} onClick={closeSidebar}>Eventos</NavLink>
                  <NavLink href="/dashboard/applications" icon={Briefcase} onClick={closeSidebar}>Postulaciones</NavLink>
                  <NavLink href="/dashboard/scratch" icon={Sparkles} onClick={closeSidebar}>Raspe y Gane</NavLink>
                  <NavLink href="/dashboard/tables" icon={Armchair} onClick={closeSidebar}>Gestión de Mesas</NavLink>
                  <NavLink href="/dashboard/staff" icon={Users} onClick={closeSidebar}>Staff</NavLink>
                  <NavLink href="/dashboard/clients" icon={UserSquare} onClick={closeSidebar}>Clientes</NavLink>
                  <NavLink href="/dashboard/rrpp-stats" icon={BarChartHorizontal} onClick={closeSidebar}>Rendimiento RRPP</NavLink>
                  <NavLink href="/dashboard/birthday" icon={PartyPopper} onClick={closeSidebar}>Gestión Cumpleaños</NavLink>
                  <NavLink href="/dashboard/raffle" icon={Ticket} onClick={closeSidebar}>Sorteo Semanal</NavLink>
                  <NavLink href="/dashboard/no-shows" icon={UserX} onClick={closeSidebar}>Ausencias</NavLink>
                  <NavLink href="/dashboard/loyalty" icon={Trophy} onClick={closeSidebar}>Fidelización</NavLink>
                  <NavLink href="/dashboard/rewards" icon={Gift} onClick={closeSidebar}>Premios</NavLink>

                  <NavLink href="/dashboard/reviews" icon={Star} onClick={closeSidebar}>Gestión de Reseñas</NavLink>
                  <NavLink href="/dashboard/products" icon={ShoppingBasket} onClick={closeSidebar}>Productos</NavLink>
                  <NavLink href="/dashboard/partners" icon={Store} onClick={closeSidebar}>Partners</NavLink>
                  <NavLink href="/dashboard/owner/invitations" icon={Send} onClick={closeSidebar}>Invitaciones (Dueño)</NavLink>
                  <NavLink href="/dashboard/marketing" icon={Megaphone} onClick={closeSidebar}>Marketing & Ads</NavLink>
                  <NavLink href="/verifier" icon={QrCode} onClick={closeSidebar} liClassName="border-t border-zinc-700 pt-2 mt-2">Verificar Acceso</NavLink>
                  <NavLink href="/dashboard/notifications" icon={Bell} onClick={closeSidebar}>Notificaciones</NavLink>
                  <NavLink href="/dashboard/settings" icon={Settings} onClick={closeSidebar}>Configuración</NavLink>
                </>
              )}

              {isOwner && !isAdmin && (
                <>
                  <NavLink href="/dashboard/owner" icon={LayoutGrid} onClick={closeSidebar}>Métricas en Vivo</NavLink>
                  <NavLink href="/dashboard/marketing" icon={Megaphone} onClick={closeSidebar}>Marketing & Ads</NavLink>
                  <NavLink href="/dashboard/owner/invitations" icon={Send} onClick={closeSidebar}>Invitaciones</NavLink>
                  <NavLink href="/dashboard/rrpp-stats" icon={BarChartHorizontal} onClick={closeSidebar}>Rendimiento RRPP</NavLink>
                  <NavLink href="/dashboard/settings" icon={Settings} onClick={closeSidebar}>Configuración</NavLink>
                </>
              )}

              {isOrganizer && !isAdmin && !isOwner && (
                <>
                  <NavLink href="/dashboard/organizer" icon={Briefcase} onClick={closeSidebar}>Principal</NavLink>
                  <NavLink href="/dashboard/marketing" icon={Megaphone} onClick={closeSidebar}>Marketing & Ads</NavLink>
                  <NavLink href="/dashboard/organizer/invitations" icon={Send} onClick={closeSidebar}>Invitaciones</NavLink>
                  <NavLink href="/dashboard/birthday" icon={PartyPopper} onClick={closeSidebar}>Gestión Cumpleaños</NavLink>
                </>
              )}

              {user?.roles.includes(UserRole.PARTNER) && !isAdmin && (
                <NavLink href="/partners" icon={Store} onClick={closeSidebar}>Mi Negocio</NavLink>
              )}

              {/* Common link for all dashboard users */}
              <NavLink href="/mi-cuenta" icon={User} onClick={closeSidebar} liClassName="pt-2 mt-2 border-t border-zinc-800">Mi Cuenta</NavLink>
            </ul>
          </nav>

          <div className="mt-auto border-t border-zinc-800 pt-4">
            <LogoutButton />
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 bg-black overflow-x-hidden min-h-screen">
          {children}
        </main>
      </div>
    </AuthCheck >
  );
}