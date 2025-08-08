'use client';

import api from "@/lib/axios";
import { type Event } from "@/types/event.types";
import Image from "next/image";
import { TicketAcquirer } from "@/components/ticket-acquirer";
import { TicketTier } from "@/types/ticket.types";
import { ShareButton } from "@/components/share-button";
import { useState, useEffect } from "react";
import { Loader } from "lucide-react";

export default function EventoDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [tiers, setTiers] = useState<TicketTier[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventRes, tiersRes] = await Promise.all([
          api.get(`/events/${params.id}`),
          api.get(`/events/${params.id}/ticket-tiers`)
        ]);
        setEvent(eventRes.data);
        setTiers(tiersRes.data);
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
    return <p className="text-center text-zinc-400">Evento no encontrado.</p>;
  }

  const isEventFinished = new Date() > new Date(event.endDate);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {event.flyerImageUrl && (
            <Image
              src={event.flyerImageUrl}
              alt={`Flyer de ${event.title}`}
              width={700}
              height={1050}
              className="w-full rounded-lg object-cover"
            />
          )}
          <div className="mt-8">
            <h1 className="text-4xl font-bold text-white">{event.title}</h1>
            <p className="text-lg text-zinc-400 mt-2">{event.location}</p>
            <p className="text-zinc-300 mt-4 whitespace-pre-wrap">{event.description}</p>
            <ShareButton eventId={event.id} eventTitle={event.title} flyerImageUrl={event.flyerImageUrl}/>
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold text-white">Entradas</h2>
              {tiers?.map(tier => (
                <div key={tier.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-white font-semibold">{tier.name}</p>
                    <p className="text-pink-500 font-bold">${tier.price}</p>
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    {tier.quantity > 0 ? (
                      <p>Quedan {tier.quantity} disponibles</p>
                    ) : (
                      <p className="text-red-500 font-semibold">¡AGOTADO!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
  );
}