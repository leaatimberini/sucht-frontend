import { AuthCheck } from "@/components/auth-check";
import { LogoutButton } from "@/components/logout-button";
import { UserRole } from "@/types/user.types";
import Link from "next/link";
import { Ticket, LayoutGrid } from "lucide-react";

export default function RRPPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Protegemos esta sección para Admins y RRPPs
    <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.RRPP]}>
      <div className="flex min-h-screen">
        <aside className="w-64 bg-zinc-900 p-4 border-r border-zinc-800 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">SUCHT</h1>
            <p className="text-sm text-pink-500">Panel RRPP</p>
          </div>
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <Link href="/rrpp" className="flex items-center space-x-2 text-zinc-300 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Mis Eventos</span>
                </Link>
              </li>
              {/* Otros links para RRPP en el futuro */}
            </ul>
          </nav>
          <div>
            <LogoutButton />
          </div>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </AuthCheck>
  );
}