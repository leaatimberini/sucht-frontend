'use client';

import { User } from "@/types/user.types";
import api from "@/lib/axios";
import { useEffect, useState, useCallback } from "react";
import { UserSquare } from "lucide-react";

// Este componente podría ser una versión simplificada del StaffList si fuera necesario,
// pero por ahora podemos listar los clientes directamente.
function ClientList({ clients }: { clients: User[] }) {
  if (clients.length === 0) {
    return <p className="text-zinc-500 mt-4">No hay clientes para mostrar.</p>;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto mt-8">
      <table className="w-full text-left">
        <thead className="border-b border-zinc-700">
          <tr>
            <th className="p-4 text-sm font-semibold text-white">Nombre</th>
            <th className="p-4 text-sm font-semibold text-white">Email</th>
            <th className="p-4 text-sm font-semibold text-white">Fecha de Registro</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((user) => (
            <tr key={user.id} className="border-b border-zinc-800 last:border-b-0">
              <td className="p-4 text-zinc-300">{user.name}</td>
              <td className="p-4 text-zinc-300">{user.email}</td>
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

export default function OwnerClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      // Reutilizamos el endpoint existente que ya usa el Admin
      const response = await api.get('/users/clients');
      setClients(response.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <UserSquare size={28}/>
          Listado de Clientes
        </h1>
        <p className="mt-1 text-zinc-400">
          Visualización de todos los usuarios registrados como clientes.
        </p>
      </div>
      
      {isLoading ? (
        <p className="text-zinc-400">Cargando clientes...</p>
      ) : (
        <ClientList clients={clients} />
      )}
    </div>
  );
}