'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { User } from "@/types/user.types";
import { RoleUpdater } from "@/components/role-updater";

export default function StaffPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Staff</h1>
          <p className="mt-1 text-zinc-400">
            Administra los roles y permisos de tu equipo.
          </p>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-white">Nombre</th>
              <th className="p-4 text-sm font-semibold text-white">Email</th>
              <th className="p-4 text-sm font-semibold text-white">Rol</th>
              <th className="p-4 text-sm font-semibold text-white">Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="text-center p-6 text-zinc-400">Cargando...</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800 last:border-b-0">
                  <td className="p-4 text-zinc-300">{user.name}</td>
                  <td className="p-4 text-zinc-300">{user.email}</td>
                  <td className="p-4 text-zinc-300">
                    <RoleUpdater user={user} onRoleUpdated={fetchUsers} />
                  </td>
                  <td className="p-4 text-zinc-300">
                    {new Date(user.createdAt).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}