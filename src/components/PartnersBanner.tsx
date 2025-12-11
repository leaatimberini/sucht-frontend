'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Loader } from 'lucide-react';

interface Partner {
    id: string;
    name: string;
    logoUrl: string | null;
    category: string | null;
}

export function PartnersBanner() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await api.get('/partners/banner');
                setPartners(res.data);
            } catch (error) {
                console.error('Failed to fetch partners for banner:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPartners();
    }, []);

    if (isLoading || partners.length === 0) return null;

    // Logic: If few partners (<= 4), show them centered without animation.
    // If many, show scrolling marquee.
    const shouldScroll = partners.length > 4;
    const partnersList = shouldScroll ? [...partners, ...partners] : partners;

    return (
        <section className="bg-zinc-950 py-12 border-t border-zinc-900 border-b border-zinc-900 overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-500">
                    Nuestros Partners
                </h3>
            </div>

            <div className="relative w-full overflow-hidden">
                {/* Gradients only if scrolling */}
                {shouldScroll && (
                    <>
                        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none"></div>
                    </>
                )}

                <div
                    className={`flex items-center ${shouldScroll ? 'w-max animate-scroll hover:pause' : 'w-full justify-center flex-wrap gap-8'}`}
                >
                    {partnersList.map((partner, index) => (
                        <div key={`${partner.id}-${index}`} className={`flex-shrink-0 w-40 md:w-56 px-4 flex items-center justify-center ${!shouldScroll ? 'mb-4' : ''}`}>
                            <Link href={`/partners/${partner.id}`} className="group relative block w-full aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-pink-500/50 transition-all p-4 flex items-center justify-center">
                                {partner.logoUrl ? (
                                    <img
                                        src={partner.logoUrl}
                                        alt={partner.name}
                                        className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-zinc-700 group-hover:text-white">{partner.name[0]}</span>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                                    <span className="text-xs text-zinc-300 font-medium truncate px-2 block">{partner.name}</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
