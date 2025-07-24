'use client';

import { User, UserRole } from "@/types/user.types";
import { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export function RoleUpdater({ user, onRoleUpdated }: { user: User, onRoleUpdated: () => void }) {
  const [currentRole, setCurrentRole] = useState<UserRole>(user.role);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === currentRole) return;

    setIsLoading(true);
    try {
      // --- LÍNEA CORREGIDA ---
      // Se añade el prefijo /api a la ruta
      await api.patch(`/users/${user.id}/role`, { role: newRole });
      // -----------------------

      setCurrentRole(newRole);
      toast.success(`Rol de ${user.name} actualizado a ${newRole}.`);
      onRoleUpdated(); // Avisa al componente padre para que refresque la lista
    } catch (error) {
      toast.error('No se pudo actualizar el rol.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <select
      value={currentRole}
      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
      disabled={isLoading}
      className="bg-zinc-800 border border-zinc-700 rounded-md py-1 px-2 text-zinc-50 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
    >
      <option value={UserRole.ADMIN}>Admin</option>
      <option value={UserRole.RRPP}>RRPP</option>
      <option value={UserRole.VERIFIER}>Verifier</option>
      <option value={UserRole.CLIENT}>Client</option>
    </select>
  );
}