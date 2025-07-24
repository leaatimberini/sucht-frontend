'use client';

// 1. Se añade 'useCallback' a la importación
import { useEffect, useState, useCallback } from "react";
import { Event } from "@/types/event.types";
import api from "@/lib/axios";
import { TicketGenerator } from "@/components/ticket-generator";

export default function RRPPPage() {
  const [events, setEvents] = useState<Event[]>([]);

  // 2. Se envuelve la función en useCallback
  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  }, []); // El array vacío indica que esta función no depende de props o estado

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // 3. Se añade la función a la lista de dependencias

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Mis Eventos</h1>
      <div className="space-y-8">
        {events.length > 0 ? (
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