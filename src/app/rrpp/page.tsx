'use client';

import { useEffect, useState } from "react";
import { Event } from "@/types/event.types";
import api from "@/lib/axios";
import { TicketGenerator } from "@/components/ticket-generator";
import { useAuthStore } from "@/stores/auth-store"; // <-- 1. IMPORTAR

export default function RRPPPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn); // <-- 2. OBTENER ESTADO DE LOGIN

  useEffect(() => {
    // 3. SOLO CARGAR EVENTOS SI EL USUARIO ESTÁ LOGUEADO
    if (isLoggedIn()) {
      const fetchEvents = async () => {
        setIsLoading(true);
        try {
          const response = await api.get('/events');
          setEvents(response.data);
        } catch (error) {
          console.error("Failed to fetch events:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvents();
    }
  }, [isLoggedIn]); // Se ejecuta cuando el estado de login cambia

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Mis Eventos</h1>
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