'use client';

import { User } from "@/types/user.types";
import api from "@/lib/axios";
import { useEffect, useState, useCallback } from "react";
import { Cake, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function OwnerBirthdaysPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBirthdays = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/birthdays');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch birthdays:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBirthdays();
  }, [fetchBirthdays]);

  const BirthdayList = ({ users }: { users: User[] }) => {
    if (users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-zinc-900 border border-zinc-800 rounded-lg p-12">
          <AlertCircle className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-xl font-semibold text-white">Sin cumpleaños cercanos</h3>
          <p className="text-zinc-500 mt-1">No hay clientes que cumplan años en los próximos 15 días.</p>
        </div>
      );
    }
  
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto mt-8">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-white">Cumpleaños</th>
              <th className="p-4 text-sm font-semibold text-white">Nombre</th>
              <th className="p-4 text-sm font-semibold text-white">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-800 last:border-b-0">
                <td className="p-4 text-pink-400 font-semibold">
                  {/* CORRECCIÓN: Verificamos si la fecha existe antes de formatearla */}
                  {user.dateOfBirth ? format(new Date(user.dateOfBirth), "d 'de' MMMM") : 'No especificada'}
                </td>
                <td className="p-4 text-zinc-300">{user.name}</td>
                <td className="p-4 text-zinc-300">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Cake size={28}/>
          Próximos Cumpleaños
        </h1>
        <p className="mt-1 text-zinc-400">
          Clientes que cumplen años en los próximos 15 días.
        </p>
      </div>
      
      {isLoading ? (
        <p className="text-zinc-400">Cargando cumpleaños...</p>
      ) : (
        <BirthdayList users={users} />
      )}
    </div>
  );
}