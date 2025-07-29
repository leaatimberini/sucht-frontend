'use client';

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { User } from "@/types/user.types";
import { Event } from "@/types/event.types";
import Image from "next/image";
import Link from "next/link";
import { Instagram, MessageSquare } from "lucide-react";

// Este componente se ejecuta en el cliente y guarda el username del RRPP
function PromoterTracker({ username }: { username: string }) {
  useEffect(() => {
    localStorage.setItem('promoterUsername', username);
  }, [username]);
  return null; // No renderiza nada visualmente
}

export default function PromoterPage({ params }: { params: { username: string } }) {
  const [promoter, setPromoter] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [promoterRes, eventsRes] = await Promise.all([
        api.get(`/users/by-username/${params.username}`),
        api.get('/events')
      ]);
      setPromoter(promoterRes.data);
      setEvents(eventsRes.data.filter((event: Event) => new Date(event.endDate) > new Date()));
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading || !promoter) {
    return <div className="text-center p-8"><p className="text-zinc-400">Cargando perfil del RRPP...</p></div>;
  }

  return (
    <>
      <PromoterTracker username={params.username} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center">
          {promoter.profileImageUrl && (
            <Image
              src={promoter.profileImageUrl}
              alt={`Foto de ${promoter.name}`}
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover border-4 border-zinc-800"
            />
          )}
          <h1 className="text-4xl font-bold text-white mt-4">{promoter.name}</h1>
          <p className="text-pink-500">RRPP Oficial de SUCHT</p>
          <div className="flex items-center space-x-4 mt-4">
            {promoter.instagramHandle && (
              <a href={`https://instagram.com/${promoter.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-zinc-300 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span>{promoter.instagramHandle}</span>
              </a>
            )}
            {promoter.whatsappNumber && (
              <a href={`https://wa.me/${promoter.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-zinc-300 hover:text-white">
                <MessageSquare className="h-5 w-5" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
        <hr className="my-10 border-zinc-800" />
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Mis Eventos</h2>
          <div className="space-y-6">
            {events.length > 0 ? (
              events.map(event => (
                // Añadimos el username del RRPP como un parámetro en la URL del evento
                <Link key={event.id} href={`/eventos/${event.id}?promoter=${promoter.username}`} className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-pink-500 transition-all flex items-center space-x-4">
                  {event.flyerImageUrl && (
                    <Image
                      src={event.flyerImageUrl}
                      alt={`Flyer de ${event.title}`}
                      width={80}
                      height={120}
                      className="w-20 h-30 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                    <p className="text-sm text-zinc-400">{new Date(event.startDate).toLocaleDateString('es-AR', { dateStyle: 'long' })}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-zinc-500 text-center">No hay eventos próximos en este momento.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
