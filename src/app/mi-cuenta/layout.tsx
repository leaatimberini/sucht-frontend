import { ReactNode } from 'react';
import { AccountNav } from './components/AccountNav';

// Ahora pasamos el NOMBRE del ícono como un string, no el componente en sí.
const navItems = [
  { href: '/mi-cuenta/entradas', label: 'Mis Entradas', iconName: 'Ticket' },
  { href: '/mi-cuenta/productos', label: 'Mis Productos', iconName: 'ShoppingBag' },
  { href: '/mi-cuenta/premios', label: 'Mis Premios', iconName: 'Gift' },
  { href: '/mi-cuenta/historial', label: 'Historial de Canjes', iconName: 'History' },
  { href: '/mi-cuenta/perfil', label: 'Editar Perfil', iconName: 'Edit' },
];

export default function MiCuentaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:space-x-8">
        
        <aside className="md:w-1/4 lg:w-1/5 mb-8 md:mb-0">
          <AccountNav items={navItems} />
        </aside>

        <main className="md:w-3/4 lg:w-4/5">
          {children}
        </main>

      </div>
    </div>
  );
}