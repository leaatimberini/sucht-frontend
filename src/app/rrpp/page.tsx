'use client';
import { useEffect, useState } from "react";
import { Event } from "@/types/event.types";
import api from "@/lib/axios";
import { TicketGenerator } from "@/components/ticket-generator";

export default function RRPPPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

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