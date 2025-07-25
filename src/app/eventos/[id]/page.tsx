import api from "@/lib/axios";
import { type Event } from "@/types/event.types";
import { notFound } from "next/navigation";
import Image from "next/image";
import { TicketAcquirer } from "@/components/ticket-acquirer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {event.flyerImageUrl && (
            <Image
              src={`${API_URL}${event.flyerImageUrl}`}
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
          <TicketAcquirer eventId={event.id} />
        </div>
      </div>
    </div>
  );
}