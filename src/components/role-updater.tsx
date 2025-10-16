// src/components/role-updater.tsx

'use client';

import { useState } from "react";
import { User, UserRole } from "@/types/user.types";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { Check, Edit, Loader2 } from "lucide-react";

export function RoleUpdater({ user, onRoleUpdated, viewAs }: { user: User; onRoleUpdated: () => void; viewAs: 'ADMIN' | 'OWNER' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(user.roles);
  const currentUser = useAuthStore(state => state.user);

  // ✅ CORRECCIÓN: Unificamos la lógica de roles disponibles
  const availableRoles = viewAs === 'OWNER'
    ? [UserRole.RRPP, UserRole.VERIFIER, UserRole.BARRA, UserRole.ORGANIZER]
    : [UserRole.RRPP, UserRole.VERIFIER, UserRole.BARRA, UserRole.ORGANIZER, UserRole.OWNER, UserRole.ADMIN];

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleUpdateRoles = async () => {
    setIsLoading(true);
    try {
      await api.patch(`/users/${user.id}/roles`, { roles: selectedRoles });
      toast.success('Roles actualizados con éxito.');
      onRoleUpdated();
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'No se pudieron actualizar los roles.');
    } finally {
      setIsLoading(false);
    }
  };

  // Un ADMIN no puede quitarse su propio rol de ADMIN si es el mismo usuario
  const isEditingSelfAsAdmin = currentUser?.id === user.id && user.roles.includes(UserRole.ADMIN);

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {user.roles.filter(r => r !== 'client').map(role => (
            <span key={role} className="px-2 py-1 text-xs font-semibold bg-zinc-700 text-zinc-200 rounded-md">
              {role.toUpperCase()}
            </span>
          ))}
        </div>
        <button onClick={() => setIsEditing(true)} className="text-zinc-400 hover:text-white">
          <Edit size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-wrap gap-4">
        {availableRoles.map(role => {
          const isDisabled = isEditingSelfAsAdmin && role === UserRole.ADMIN;
          return (
            <label key={role} className={`flex items-center space-x-2 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => handleRoleToggle(role)}
                disabled={isDisabled}
                className="h-4 w-4 rounded bg-zinc-700 text-pink-600 focus:ring-pink-500 border-zinc-600"
              />
              <span className="font-semibold">{role.toUpperCase()}</span>
            </label>
          );
        })}
      </div>
      <button onClick={handleUpdateRoles} disabled={isLoading} className="text-green-500 hover:text-green-400 disabled:opacity-50">
        {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Check size={20} />}
      </button>
    </div>
  );
}