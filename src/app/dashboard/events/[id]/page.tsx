'use client';

import api from "@/lib/axios";
import { type Event } from "@/types/event.types";
import Image from "next/image";
import { TicketAcquirer } from "@/components/ticket-acquirer";
import { ShareButton } from "@/components/share-button";
import { useState, useEffect } from "react";
import { Loader, Map } from "lucide-react";
import { RaffleCountdown } from "@/components/RaffleCountdown";
import { TableReservationModal } from "@/components/TableReservationModal";
import { type Table } from '@/types/table.types';

export default function EventoDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [eventRes, tablesRes] = await Promise.all([
          api.get(`/events/${params.id}`),
          api.get(`/tables/event/${params.id}`) // Hacemos la consulta de mesas
        ]);
        setEvent(eventRes.data);
        setTables(tablesRes.data || []); // Guardamos las mesas
      } catch (error) {
        console.error("Failed to fetch event data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-pink-500" size={48} />
      </div>
    );
  }

  if (!event) {
    return <p className="text-center text-zinc-400 mt-10">Evento no encontrado.</p>;
  }

  const isEventFinished = new Date() > new Date(event.endDate);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {event.flyerImageUrl && (
              <Image
                src={event.flyerImageUrl}
                alt={`Flyer de ${event.title}`}
                width={700}
                height={1050}
                className="w-full rounded-lg object-cover shadow-lg shadow-black/30"
                priority
              />
            )}

            {!isEventFinished && <RaffleCountdown eventId={event.id} />}

            <div className="mt-8">
              <h1 className="text-4xl font-bold text-white">{event.title}</h1>
              <p className="text-lg text-zinc-400 mt-2">{event.location}</p>
              <p className="text-zinc-300 mt-4 whitespace-pre-wrap">{event.description}</p>
              
              <ShareButton 
                eventId={event.id} 
                eventTitle={event.title} 
                flyerImageUrl={event.flyerImageUrl}
              />
              
              {/* --- LÓGICA CORREGIDA --- */}
              {/* El botón solo aparece si hay mesas y el evento no ha terminado */}
              {!isEventFinished && tables.length > 0 && (
                  <div className="my-8">
                      <button 
                          onClick={() => setIsTableModalOpen(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 text-lg transition-colors"
                      >
                          <Map size={20}/> Ver Mapa de Mesas VIP
                      </button>
                  </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            {isEventFinished ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-white">Evento Finalizado</h3>
                <p className="text-zinc-400 mt-2">Gracias por acompañarnos.</p>
              </div>
            ) : (
              <TicketAcquirer eventId={event.id} />
            )}
          </div>
        </div>
      </div>

      {isTableModalOpen && (
        <TableReservationModal 
          eventId={event.id} 
          onClose={() => setIsTableModalOpen(false)} 
        />
      )}
    </>
  );
}