'use client';

// 1. Se añade 'useCallback' a la importación
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { User } from "@/types/user.types";

export default function ClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Se envuelve la función en useCallback para optimizarla
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      // La llamada a la API ya estaba correcta
      const response = await api.get('/api/users/clients');
      setClients(response.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // El array vacío indica que esta función no depende de props o estado

  useEffect(() => {
    fetchClients();
  }, [fetchClients]); // 3. Se añade la función a la lista de dependencias

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Listado de Clientes</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-white">Nombre</th>
              <th className="p-4 text-sm font-semibold text-white">Email</th>
              <th className="p-4 text-sm font-semibold text-white">Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="text-center p-6 text-zinc-400">Cargando Clientes...</td></tr>
            ) : (
              clients.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800 last:border-b-0">
                  <td className="p-4 text-zinc-300">{user.name}</td>
                  <td className="p-4 text-zinc-300">{user.email}</td>
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