'use client';

import { AuthCheck } from "@/components/auth-check";
import { LogoutButton } from "@/components/logout-button";
import { UserRole } from "@/types/user.types";
import Link from "next/link";
import { 
  Calendar, LayoutGrid, Users, QrCode, UserSquare, BarChartHorizontal, 
  Settings, Bell, UserX, Trophy, CreditCard, Gift, ShoppingBasket, 
  PartyPopper, Send, Package, Ticket, Briefcase, Armchair // Icono para Mesas
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePathname } from "next/navigation";

const NavLink = ({ href, icon: Icon, children }: { href: string, icon: React.ElementType, children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  
  return (
    <li>
      <Link href={href} className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
        isActive ? 'bg-pink-600/20 text-pink-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-700'
      }`}>
        <Icon className="h-4 w-4" />
        <span>{children}</span>
      </Link>
    </li>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles.includes(UserRole.ADMIN);
  const isOwner = user?.roles.includes(UserRole.OWNER);
  const isOrganizer = user?.roles.includes(UserRole.ORGANIZER);

  const getPanelTitle = () => {
      if(isAdmin) return 'Panel de Administrador';
      if(isOwner) return 'Panel de Dueño';
      if(isOrganizer) return 'Panel de Organizador';
      return 'Panel de Control';
  }

  return (
    <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.ORGANIZER]}> 
      <div className="flex min-h-screen">
        <aside className="w-64 bg-zinc-900 p-4 border-r border-zinc-800 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">SUCHT</h1>
            <p className="text-sm text-pink-500">{getPanelTitle()}</p>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              {isAdmin && (
                <>
                  <NavLink href="/dashboard" icon={LayoutGrid}>Métricas</NavLink>
                  <NavLink href="/dashboard/sales" icon={CreditCard}>Ventas (Tickets)</NavLink>
                  <NavLink href="/dashboard/product-sales" icon={Package}>Ventas (Productos)</NavLink>
                  <NavLink href="/dashboard/events" icon={Calendar}>Eventos</NavLink>
                  {/* --- NUEVO ENLACE AÑADIDO --- */}
                  <NavLink href="/dashboard/tables" icon={Armchair}>Gestión de Mesas</NavLink>
                  <NavLink href="/dashboard/staff" icon={Users}>Staff</NavLink>
                  <NavLink href="/dashboard/clients" icon={UserSquare}>Clientes</NavLink>
                  <NavLink href="/dashboard/rrpp-stats" icon={BarChartHorizontal}>Rendimiento RRPP</NavLink>
                  <NavLink href="/dashboard/birthday" icon={PartyPopper}>Gestión Cumpleaños</NavLink>
                  <NavLink href="/dashboard/raffle" icon={Ticket}>Sorteo Semanal</NavLink>
                  <NavLink href="/dashboard/no-shows" icon={UserX}>Ausencias</NavLink>
                  <NavLink href="/dashboard/loyalty" icon={Trophy}>Fidelización</NavLink>
                  <NavLink href="/dashboard/rewards" icon={Gift}>Premios</NavLink>
                  <NavLink href="/dashboard/products" icon={ShoppingBasket}>Productos</NavLink>
                  <NavLink href="/dashboard/owner/invitations" icon={Send}>Invitaciones (Dueño)</NavLink>
                  <li className="border-t border-zinc-700 pt-2 mt-2">
                    <NavLink href="/verifier" icon={QrCode}>Verificar Acceso</NavLink>
                  </li>
                  <li><NavLink href="/dashboard/notifications" icon={Bell}>Notificaciones</NavLink></li>
                  <li><NavLink href="/dashboard/settings" icon={Settings}>Configuración</NavLink></li>
                </>
              )}

              {isOwner && !isAdmin && (
                <>
                  <NavLink href="/dashboard/owner" icon={LayoutGrid}>Métricas en Vivo</NavLink>
                  <NavLink href="/dashboard/owner/invitations" icon={Send}>Invitaciones</NavLink>
                  <NavLink href="/dashboard/rrpp-stats" icon={BarChartHorizontal}>Rendimiento RRPP</NavLink>
                  <NavLink href="/dashboard/settings" icon={Settings}>Configuración</NavLink>
                </>
              )}

              {isOrganizer && !isAdmin && !isOwner && (
                <>
                  <NavLink href="/dashboard/organizer" icon={Briefcase}>Principal</NavLink>
                  <NavLink href="/dashboard/organizer/invitations" icon={Send}>Invitaciones</NavLink>
                  <NavLink href="/dashboard/birthday" icon={PartyPopper}>Gestión Cumpleaños</NavLink>
                </>
              )}
            </ul>
          </nav>
          
          <div className="mt-auto">
            <LogoutButton />
          </div>
        </aside>
        
        <main className="flex-1 p-8 bg-black">
          {children}
        </main>
      </div>
    </AuthCheck>
  );
}