'use client';

import { type Event } from "@/types/event.types";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TicketTierManager } from "@/components/ticket-tier-manager";
import Link from "next/link";
import { ArrowLeft, BellRing } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  
  const fetchEvent = useCallback(async () => {
    try {
      const response = await api.get(`/events/${params.id}`);
      setEvent(response.data);
    } catch (error) {
      console.error("Failed to fetch event", error);
    }
  }, [params.id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);
  
  const handleRequestConfirmation = async () => {
    if (!event) return;
    try {
      await api.post(`/events/${event.id}/request-confirmation`);
      toast.success("Solicitud de confirmación enviada a todos los poseedores de entradas.");
      fetchEvent();
    } catch (error) {
      toast.error("No se pudo enviar la solicitud.");
    }
  };

  if (!event) {
    return <div className="text-center p-8"><p className="text-zinc-400">Cargando evento...</p></div>;
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
          
          <div className="mt-6 border-t border-zinc-800 pt-6">
            <button 
              onClick={handleRequestConfirmation}
              disabled={!!event.confirmationSentAt}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:bg-zinc-700 disabled:cursor-not-allowed"
            >
              <BellRing className="h-5 w-5" />
              <span>{event.confirmationSentAt ? `Solicitud enviada` : 'Solicitar Confirmación'}</span>
            </button>
            {event.confirmationSentAt && (
              <p className="text-xs text-zinc-400 mt-2 text-center">
                Se pidió confirmación el: {new Date(event.confirmationSentAt).toLocaleString('es-AR')}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <hr className="my-8 border-zinc-800" />
      
      {/* Este es el componente para Admins */}
      <TicketTierManager eventId={event.id} />
    </div>
  );
}
