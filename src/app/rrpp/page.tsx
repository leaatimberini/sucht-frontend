'use client';

import { useEffect, useState, useCallback } from "react";
import { Event } from "@/types/event.types";
import api from "@/lib/axios";
import { TicketGenerator } from "@/components/ticket-generator";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "@/types/user.types";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function RRPPPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const authUser = useAuthStore((state) => state.user);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Obtenemos los eventos y los datos del RRPP logueado
      const [eventsRes, userRes] = await Promise.all([
        api.get('/events'),
        api.get('/users/profile/me')
      ]);
      setEvents(eventsRes.data);
      setCurrentUser(userRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleCopyToClipboard = () => {
    if (!currentUser?.username) return;
    const link = `https://sucht.com.ar/p/${currentUser.username}`;
    navigator.clipboard.writeText(link);
    toast.success('¡Link copiado al portapapeles!');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Panel RRPP</h1>
      
      {/* Sección para compartir el link personal */}
      {currentUser?.username && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white">Tu Link de Invitado</h2>
          <p className="text-zinc-400 mt-2 mb-4">Comparte este link único con tus invitados. Todas las entradas que saquen a través de él contarán como tuyas.</p>
          <div className="flex items-center space-x-2 bg-zinc-800 p-2 rounded-md">
            <span className="text-pink-400 flex-1 truncate">{`https://sucht.com.ar/p/${currentUser.username}`}</span>
            <button onClick={handleCopyToClipboard} className="bg-pink-600 hover:bg-pink-700 p-2 rounded-md">
              <Copy className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-white mb-4">Generar Entradas Individuales</h2>
      <div className="space-y-8">
        {isLoading ? (
          <p className="text-zinc-400">Cargando eventos...</p>
        ) : events.length > 0 ? (
          events.map(event => (
            <TicketGenerator key={event.id} event={event} />
          ))
        ) : (
          <p className="text-zinc-400">No hay eventos disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
}
