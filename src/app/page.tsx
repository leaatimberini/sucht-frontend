// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EventCard } from '@/components/EventCard';
import { LoyaltyProgressBar, UserProfile } from '@/components/LoyaltyProgressBar';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/axios';
import { type Event } from '@/types/event.types';
import { Award, Gift, Instagram, Loader, MessageSquare, ShoppingCart } from 'lucide-react';
import { PartnersBanner } from '@/components/PartnersBanner';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // FIX: Se separa el estado del usuario del store y el perfil cargado de la API
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Efecto para cargar los eventos (se ejecuta una vez)
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const res = await api.get('/events');
        const allEvents: Event[] = res.data;
        const upcoming = allEvents
          .filter(event => new Date(event.startDate) > new Date())
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        setEvents(upcoming);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // FIX: Efecto para cargar el perfil del usuario (se ejecuta cuando cambia el 'user' del store)
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await api.get('/users/profile/me');
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);


  return (
    <div className="bg-black text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative flex items-center justify-center text-center overflow-hidden bg-zinc-950 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/50 to-black opacity-70"></div>
        <div className="relative z-10 container mx-auto px-4 w-full">
          {isLoadingProfile ? (
            <Loader className="animate-spin text-pink-500 mx-auto" />
          ) : user && profile ? (
            // Vista para usuario logueado
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Hola, {profile.name}</h1>
              <p className="text-zinc-300 text-lg mt-2 mb-8">Bienvenido de nuevo.</p>
              <div className="max-w-xl mx-auto">
                <LoyaltyProgressBar user={profile} />
                <div className="text-center mt-6">
                  <Link href="/mi-cuenta/premios" className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 font-bold py-3 px-6 rounded-lg transition-colors">
                    <Award size={18} />
                    Ver Premios para Canjear
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // Vista para visitante
            <div>
              <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-wider">SUCHT</h1>
              <p className="text-lg md:text-xl text-zinc-300 mt-4 max-w-2xl mx-auto">Música, amigos y noches inolvidables te esperan.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- PARTNERS BANNER --- */}
      <PartnersBanner />

      {/* --- SECCIÓN DE PRÓXIMOS EVENTOS --- */}
      <section id="proximos-eventos" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Próximos Eventos</h2>
          {isLoadingEvents ? (
            <div className="flex justify-center"><Loader className="animate-spin text-pink-500" /></div>
          ) : events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.slice(0, 3).map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              {events.length > 3 && (
                <div className="text-center mt-12">
                  <Link href="/eventos" className="bg-zinc-800 hover:bg-zinc-700 font-bold py-3 px-6 rounded-lg transition-colors">
                    Ver todos los eventos
                  </Link>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-zinc-500">No hay eventos próximos en este momento.</p>
          )}
        </div>
      </section>

      {/* --- SECCIÓN TIENDA ONLINE --- */}
      <section className="bg-zinc-950 py-20">
        <div className="container mx-auto px-4 text-center">
          <ShoppingCart size={48} className="mx-auto text-pink-500 mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold">Visita Nuestra Tienda Online</h2>
          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">Anticipa tus consumiciones y accede a productos exclusivos con descuento comprando directamente desde nuestra web.</p>
          <Link href="/store" className="mt-8 inline-block bg-white hover:bg-zinc-200 text-black font-bold py-3 px-6 rounded-lg transition-colors">
            Ir a la Tienda
          </Link>
        </div>
      </section>

      {/* --- SECCIÓN CTA REFERIDOS (SOLO PARA USUARIOS LOGUEADOS) --- */}
      {user && (
        <section className="bg-black py-20">
          <div className="container mx-auto px-4 text-center">
            <Gift size={48} className="mx-auto text-pink-500 mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold">Gana Premios por Invitar</h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">Por cada amigo que asista a un evento usando tu link de referido, acumularás puntos que podrás canjear por premios exclusivos.</p>
            <Link href="/mi-cuenta" className="mt-8 inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105">
              Obtener mi Link de Referido
            </Link>
          </div>
        </section>
      )}

      {/* --- Footer --- */}
      <footer className="bg-zinc-900 text-zinc-400 py-8">
        <div className="container mx-auto px-4 flex flex-col items-center space-y-4">
          <p className="text-center">Síguenos en nuestras redes</p>
          <div className="flex space-x-6 text-2xl">
            <a href="https://www.instagram.com/sucht.oficial" target="_blank" rel="noopener noreferrer" aria-label="Instagram SUCHT" className="hover:text-pink-600 transition-colors">
              <Instagram />
            </a>
            <a href="https://wa.me/5491166755207" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp SUCHT" className="hover:text-green-500 transition-colors">
              <MessageSquare />
            </a>
          </div>
          <p className="text-xs text-zinc-500 pt-4">
            SUCHT - Desarrollado por <a href="https://www.instagram.com/leaa.emanuel" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-600">LEAA</a>
          </p>
        </div>
      </footer>
    </div>
  );
}