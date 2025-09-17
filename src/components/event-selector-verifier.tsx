// src/components/event-selector-verifier.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Event } from '@/types/event.types';

interface EventSelectorProps {
  onEventSelect: (eventId: string | null) => void;
}

export function EventSelectorForVerifier({ onEventSelect }: EventSelectorProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        // Obtenemos todos los eventos (asumimos que el backend los devuelve ordenados)
        const response = await api.get('/events'); 
        // Filtramos para mostrar solo eventos que no han finalizado
        const activeEvents = response.data.filter((event: Event) => 
          new Date(event.endDate) > new Date()
        );
        setEvents(activeEvents);
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };
    fetchActiveEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    onEventSelect(eventId || null);
  };

  return (
    <div className="max-w-md mx-auto">
      <select 
        value={selectedEvent} 
        onChange={handleChange} 
        className="w-full bg-zinc-800 rounded-md p-3 text-white border border-zinc-700 focus:ring-2 focus:ring-pink-500"
      >
        <option value="">-- Selecciona el evento a verificar --</option>
        {events.map(event => (
          <option key={event.id} value={event.id}>
            {event.title}
          </option>
        ))}
      </select>
    </div>
  );
}