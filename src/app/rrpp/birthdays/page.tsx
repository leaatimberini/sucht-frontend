'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { User } from "@/types/user.types";
import Image from "next/image";
import { Instagram, MessageSquare } from "lucide-react";

export default function RRPPBirthdaysPage() {
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/users/birthdays');
        setUpcomingBirthdays(response.data);
      } catch (error) {
        console.error("Failed to fetch upcoming birthdays:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBirthdays();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Próximos Cumpleaños</h1>
      <p className="text-zinc-400 mb-8">
        Estos son los clientes que cumplen años en los próximos 15 días. ¡Una gran oportunidad para contactarlos!
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-white">Cliente</th>
              <th className="p-4 text-sm font-semibold text-white">Fecha de Cumpleaños</th>
              <th className="p-4 text-sm font-semibold text-white">Contacto</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="text-center p-6 text-zinc-400">Buscando cumpleaños...</td></tr>
            ) : upcomingBirthdays.length > 0 ? (
              upcomingBirthdays.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800 last:border-b-0">
                  <td className="p-4 flex items-center space-x-3">
                    <Image
                      src={user.profileImageUrl || '/default-avatar.png'} // Usamos un avatar por defecto si no hay foto
                      alt={`Foto de ${user.name}`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-300">
                    {new Date(user.dateOfBirth!).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {user.instagramHandle && (
                        <a href={`https://instagram.com/${user.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white" title="Instagram">
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {user.whatsappNumber && (
                        <a href={`https://wa.me/${user.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white" title="WhatsApp">
                          <MessageSquare className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} className="text-center p-6 text-zinc-400">No hay cumpleaños en los próximos 15 días.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
