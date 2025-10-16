'use client';

import { User, UserRole } from "@/types/user.types";
import { RoleUpdater } from "./role-updater";

export function StaffList({ staff, onDataChange, viewAs = 'ADMIN' }: { staff: User[], onDataChange: () => void, viewAs?: 'ADMIN' | 'OWNER' }) {
  
  if (!staff || !Array.isArray(staff) || staff.length === 0) {
    return <p className="text-zinc-500 mt-4">No hay miembros del staff para mostrar.</p>
  }

  const filteredStaff = viewAs === 'OWNER'
    ? staff.filter(user => !user.roles.includes(UserRole.ADMIN))
    : staff;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto mt-8">
      <table className="w-full text-left">
        <thead className="border-b border-zinc-700">
          <tr>
            <th className="p-4 text-sm font-semibold text-white">Nombre</th>
            <th className="p-4 text-sm font-semibold text-white">Email</th>
            <th className="p-4 text-sm font-semibold text-white">Roles</th>
            <th className="p-4 text-sm font-semibold text-white">Fecha de Registro</th>
          </tr>
        </thead>
        <tbody>
          {filteredStaff.map((user) => (
            <tr key={user.id} className="border-b border-zinc-800 last:border-b-0">
              <td className="p-4 text-zinc-300">{user.name}</td>
              <td className="p-4 text-zinc-300">{user.email}</td>
              <td className="p-4 text-zinc-300">
                <RoleUpdater user={user} onRoleUpdated={onDataChange} viewAs={viewAs} />
              </td>
              <td className="p-4 text-zinc-300">
                {new Date(user.createdAt).toLocaleDateString('es-AR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}