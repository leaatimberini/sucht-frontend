// src/components/event-list.tsx
'use client';

import { type Event } from '@/types/event.types';
import { ImageOff, Pencil } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DeleteEventButton } from './delete-event-button';
import { formatDate } from '@/lib/date-utils';

export function EventList({
  events,
  onDataChange,
  onEditEvent,
}: {
  events: Event[];
  onDataChange: () => void;
  onEditEvent: (event: Event) => void;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-10 bg-zinc-900 border border-zinc-800 rounded-lg">
        <p className="text-zinc-500">No hay eventos para mostrar.</p>
      </div>
    );
  }

  // Función para formatear la fecha del evento en la zona horaria de Buenos Aires
  const formatEventDate = (dateString: string) => {
    if (!dateString) return '';
    return formatDate(dateString, 'dd/MM/yyyy HH:mm');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-zinc-700">
          <tr>
            <th className="p-4 text-sm font-semibold text-white w-24">Flyer</th>
            <th className="p-4 text-sm font-semibold text-white">Título</th>
            <th className="p-4 text-sm font-semibold text-white">Ubicación</th>
            <th className="p-4 text-sm font-semibold text-white">
              Fecha de Inicio
            </th>
            <th className="p-4 text-sm font-semibold text-white">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors"
            >
              <td className="p-4">
                <Link href={`/dashboard/events/${event.id}`}>
                  {event.flyerImageUrl ? (
                    <Image
                      src={event.flyerImageUrl}
                      alt={`Flyer de ${event.title}`}
                      width={80}
                      height={120}
                      className="rounded-md object-cover w-20 h-auto"
                    />
                  ) : (
                    <div className="w-20 h-[120px] bg-zinc-800 rounded-md flex items-center justify-center">
                      <ImageOff className="h-8 w-8 text-zinc-500" />
                    </div>
                  )}
                </Link>
              </td>
              <td className="p-4 text-zinc-300 align-top">
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="font-semibold hover:underline"
                >
                  {event.title}
                </Link>
              </td>
              <td className="p-4 text-zinc-300 align-top">{event.location}</td>
              <td className="p-4 text-zinc-300 align-top">
                {formatEventDate(event.startDate)} hs
              </td>{' '}
              {/* 👈 Se aplica la función aquí */}
              <td className="p-4 align-top">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditEvent(event)}
                    className="text-zinc-400 hover:text-white transition-colors p-1"
                    title="Editar evento"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <DeleteEventButton
                    eventId={event.id}
                    onEventDeleted={onDataChange}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}