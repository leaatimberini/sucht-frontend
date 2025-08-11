import { ReactNode } from 'react';
import { User, Ticket, Gift, History, Edit, Bell, LogOut, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { AccountNav } from './components/AccountNav'; // Crearemos este componente después

// Definimos los items del menú en un array para que sea más fácil de mantener
const navItems = [
  { href: '/mi-cuenta/entradas', label: 'Mis Entradas', icon: Ticket },
  { href: '/mi-cuenta/productos', label: 'Mis Productos', icon: ShoppingBag },
  { href: '/mi-cuenta/premios', label: 'Mis Premios', icon: Gift },
  { href: '/mi-cuenta/historial', label: 'Historial de Canjes', icon: History },
  { href: '/mi-cuenta/perfil', label: 'Editar Perfil', icon: Edit },
  // La pestaña de notificaciones será eliminada y movida al header
];

export default function MiCuentaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:space-x-8">
        
        {/* Menú de Navegación Vertical (Sidebar en Desktop) */}
        <aside className="md:w-1/4 lg:w-1/5 mb-8 md:mb-0">
          {/* Usaremos un componente cliente para manejar el estado del menú en móvil */}
          <AccountNav items={navItems} />
        </aside>

        {/* Contenido Principal de la Página */}
        <main className="md:w-3/4 lg:w-4/5">
          {children}
        </main>

      </div>
    </div>
  );
}