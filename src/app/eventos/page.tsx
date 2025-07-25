import api from "@/lib/axios";
import { type Event } from "@/types/event.types";
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getEvents(): Promise<Event[]> {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export default async function EventosPage() {
  const events = await getEvents();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white text-center mb-8">Próximos Eventos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(event => (
          <Link key={event.id} href={`/eventos/${event.id}`} className="block bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-pink-500 transition-all">
            {event.flyerImageUrl ? (
              <Image
                src={`${API_URL}${event.flyerImageUrl}`}
                alt={`Flyer de ${event.title}`}
                width={500}
                height={750}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-zinc-800 flex items-center justify-center">
                <p className="text-zinc-500">Sin Flyer</p>
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-bold text-white">{event.title}</h2>
              <p className="text-sm text-zinc-400 mt-1">{new Date(event.startDate).toLocaleDateString('es-AR', { dateStyle: 'long' })}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}