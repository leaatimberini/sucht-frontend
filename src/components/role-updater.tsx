'use client';

import { User, UserRole } from "@/types/user.types";
import { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Check, Edit } from "lucide-react";

// 1. AÑADIMOS LA PROP 'viewAs'
export function RoleUpdater({ user, onRoleUpdated, viewAs = 'ADMIN' }: { user: User, onRoleUpdated: () => void, viewAs?: 'ADMIN' | 'OWNER' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(user.roles);
  const [isLoading, setIsLoading] = useState(false);

  // 2. FILTRAMOS LOS ROLES DISPONIBLES SEGÚN QUIÉN ESTÉ VIENDO
  const availableRoles = viewAs === 'OWNER'
    ? [UserRole.RRPP, UserRole.VERIFIER]
    : [UserRole.RRPP, UserRole.VERIFIER, UserRole.ADMIN];

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Aseguramos que el rol de cliente se mantenga si no es un admin
      const finalRoles = selectedRoles.includes(UserRole.ADMIN) 
        ? selectedRoles 
        : Array.from(new Set([...selectedRoles, UserRole.CLIENT]));

      await api.patch(`/users/${user.id}/roles`, { roles: finalRoles });
      toast.success(`Roles de ${user.name} actualizados.`);
      onRoleUpdated();
      setIsEditing(false);
    } catch (error) {
      toast.error('No se pudo actualizar el rol.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex flex-wrap gap-1">
          {user.roles.filter(r => r !== UserRole.CLIENT).map(role => (
            <span key={role} className="bg-zinc-700 text-zinc-300 text-xs font-semibold px-2 py-1 rounded-full capitalize">
              {role}
            </span>
          ))}
        </div>
        <button onClick={() => setIsEditing(true)} className="text-zinc-400 hover:text-white p-1">
          <Edit className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {/* 3. USAMOS LA LISTA DE ROLES FILTRADA */}
        {availableRoles.map(role => (
          <label key={role} className="flex items-center space-x-1.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={selectedRoles.includes(role)}
              onChange={() => handleRoleToggle(role)}
              className="h-3.5 w-3.5 rounded-sm bg-zinc-700 text-pink-600 focus:ring-pink-500 border-zinc-600"
            />
            <span className="capitalize">{role}</span>
          </label>
        ))}
      </div>
      <button onClick={handleSave} disabled={isLoading} className="text-green-500 hover:text-green-400 p-1">
        <Check className="h-4 w-4" />
      </button>
    </div>
  );
}