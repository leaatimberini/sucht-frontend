import api from "@/lib/axios";
import { type Event } from "@/types/event.types";
import { notFound } from "next/navigation";
import Image from "next/image";
import { TicketAcquirer } from "@/components/ticket-acquirer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

async function getEvent(id: string): Promise<Event | null> {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

export default async function EventoDetailPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
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
          </div>
        </div>
        <div className="lg:col-span-1">
          {isEventFinished ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-white">Evento Finalizado</h3>
              <p className="text-zinc-400 mt-2">Gracias por acompañarnos.</p>
            </div>
          ) : (
            // Este es el componente para clientes
            <TicketAcquirer eventId={event.id} />
          )}
        </div>
      </div>
    </div>
  );
}
