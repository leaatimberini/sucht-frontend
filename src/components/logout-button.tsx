'use client';

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

export function LogoutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente.');
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center space-x-2 hover:bg-zinc-700 px-3 py-2 rounded-md transition-colors"
    >
      <LogOut className="h-4 w-4 text-zinc-400" />
      <span className="text-sm font-medium">Cerrar Sesión</span>
    </button>
  );
}