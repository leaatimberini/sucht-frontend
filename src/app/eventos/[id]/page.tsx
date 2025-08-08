// frontend/src/app/eventos/[eventId]/page.tsx

import api from "@/lib/axios";
import { type Event } from "@/types/event.types";
import { notFound } from "next/navigation";
import Image from "next/image";
import { TicketAcquirer } from "@/components/ticket-acquirer";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { TicketTier } from "@/types/ticket.types";

// --- NUEVO COMPONENTE DE CLIENTE PARA EL BOTÓN DE COMPARTIR ---
'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

function ShareButton({ eventId, eventTitle }: { eventId: string, eventTitle: string }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectamos si es un dispositivo móvil
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
  }, []);

  const handleShare = async () => {
    const shareUrl = `https://sucht.com.ar/eventos/${eventId}`;
    
    try {
      // 1. Otorgamos los puntos al usuario por la acción de compartir
      await api.post('/point-transactions/social-share', { eventId });

      // 2. Intentamos usar la API de Share nativa del navegador (la mejor opción)
      if (navigator.share) {
        await navigator.share({
          title: `¡No te pierdas ${eventTitle} en SUCHT!`,
          text: `¡Conseguí tus entradas para ${eventTitle}!`,
          url: shareUrl,
        });
        toast.success('¡Gracias por compartir!');
      } else {
        // Fallback: Si la API de Share no está disponible, copiamos al portapapeles
        navigator.clipboard.writeText(shareUrl);
        toast.success('¡Enlace del evento copiado al portapapeles!');
      }
    } catch (error) {
      console.error('Error al compartir o dar puntos:', error);
      // Aunque falle el otorgamiento de puntos, igual intentamos compartir
      navigator.clipboard.writeText(shareUrl);
      toast.error('No se pudieron otorgar los puntos, ¡pero puedes compartir el enlace!');
    }
  };

  if (!isMobile) {
    return null; // El botón no se muestra en escritorio
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
    >
      <Share2 size={20} />
      Compartir y Ganar Puntos
    </button>
  );
}


// --- COMPONENTE DE SERVIDOR PRINCIPAL (MODIFICADO) ---

export const revalidate = 60;

async function getEvent(id: string): Promise<Event | null> {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

async function getEventTiers(eventId: string): Promise<TicketTier[] | null> {
  try {
    const response = await api.get(`/events/${eventId}/ticket-tiers`);
    return response.data;
  } catch (error) {
    return null;
  }
}

export default async function EventoDetailPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);
  const tiers = await getEventTiers(params.id);

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
            <div className="space-y-4">
              <TicketAcquirer eventId={event.id} />
              {/* Se añade el nuevo botón de compartir aquí */}
              <ShareButton eventId={event.id} eventTitle={event.title} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}