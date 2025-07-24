import { type Event } from "@/types/event.types"; 
import api from "@/lib/axios";
import { notFound } from "next/navigation";
import Image from "next/image";
import TicketTierManager from "@/components/ticket-tier-manager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getEvent(id: string): Promise<Event | null> {
  try {
    // La llamada a la API ahora usará la baseURL configurada en axios.ts
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <Link href="/dashboard/events" className="flex items-center space-x-2 text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a Eventos</span>
      </Link>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {event.flyerImageUrl && (
          <Image
            // La URL de la imagen ahora es una ruta relativa
            src={event.flyerImageUrl}
            alt={`Flyer de ${event.title}`}
            width={300}
            height={450}
            className="rounded-lg object-cover"
          />
        )}
        <div>
          <h1 className="text-4xl font-bold text-white">{event.title}</h1>
          <p className="text-lg text-zinc-400 mt-2">{event.location}</p>
          <p className="text-zinc-300 mt-4">{event.description}</p>
        </div>
      </div>
      
      <hr className="my-8 border-zinc-800" />
      
      <TicketTierManager eventId={event.id} />
    </div>
  );
}