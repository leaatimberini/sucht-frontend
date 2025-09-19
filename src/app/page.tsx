// src/app/page.tsx
import { EventCard } from "@/components/EventCard";
import { ReferralCTA } from "@/components/ReferralCTA";
import { type Event } from "@/types/event.types";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
// FIX: Importamos el nuevo componente para el contenido del Hero
import { HeroContent } from "@/components/HeroContent"; 
// Importamos los íconos correctos de lucide-react
import { Instagram, MessageSquare } from "lucide-react"; 

async function getUpcomingEvents(): Promise<Event[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) {
            console.error("Failed to fetch events");
            return [];
        }
        const allEvents: Event[] = await res.json();
        return allEvents
            .filter(event => new Date(event.startDate) > new Date())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

export default async function HomePage() {
    const upcomingEvents = await getUpcomingEvents();

    return (
        <div className="bg-black text-white">
            {/* --- HERO SECTION --- */}
            <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover opacity-30 pointer-events-none"
                        src="https://res.cloudinary.com/di4ikaeke/video/upload/v1753741162/background_c6dman.webm"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="relative z-10 container mx-auto px-4 w-full">
                    {/* FIX: Todo el contenido dinámico ahora es manejado por HeroContent */}
                    <HeroContent />
                </div>
            </section>

            {/* --- SECCIÓN DE PRÓXIMOS EVENTOS --- */}
            {upcomingEvents.length > 0 && (
                <section id="proximos-eventos" className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center mb-12">Próximos Eventos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {upcomingEvents.slice(0, 3).map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                        {/* El botón "Ver todos los eventos" ya existe aquí y cumple la función */}
                        {upcomingEvents.length > 3 && (
                            <div className="text-center mt-12">
                                <Link href="/eventos" className="bg-zinc-800 hover:bg-zinc-700 font-bold py-3 px-6 rounded-lg transition-colors">
                                    Ver todos los eventos
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            )}
            
            {/* --- SECCIÓN TIENDA ONLINE --- */}
            <section className="bg-zinc-950 py-20">
                <div className="container mx-auto px-4 text-center">
                    <ShoppingCart size={48} className="mx-auto text-pink-500 mb-4"/>
                    <h2 className="text-3xl md:text-4xl font-bold">Visita Nuestra Tienda Online</h2>
                    <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">Anticipa tus consumiciones y accede a productos exclusivos con descuento comprando directamente desde nuestra web.</p>
                    <Link href="/tienda" className="mt-8 inline-block bg-white hover:bg-zinc-200 text-black font-bold py-3 px-6 rounded-lg transition-colors">
                        Ir a la Tienda
                    </Link>
                </div>
            </section>

            {/* --- SECCIÓN CTA REFERIDOS (SOLO PARA USUARIOS LOGUEADOS) --- */}
            <ReferralCTA />

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