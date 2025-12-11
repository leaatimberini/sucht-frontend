// src/components/EventCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { type Event } from '@/types/event.types';
import { Calendar, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const formattedDate = formatDate(event.startDate, "EEEE d 'de' MMMM");

  return (
    <Link href={`/eventos/${event.id}`} className="block group">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10">
        <div className="relative aspect-[3/4]">
          <Image
            src={event.flyerImageUrl || '/placeholder-flyer.jpg'}
            alt={`Flyer de ${event.title}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-2xl font-bold">{event.title}</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Calendar size={16} />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-sm mt-1">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
          <div className="mt-4">
            <span className="inline-block w-full text-center bg-pink-600 group-hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
              Ver Detalles
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}