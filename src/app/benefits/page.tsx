'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Ticket, MapPin, Instagram, Globe } from 'lucide-react';

interface Partner {
    id: string;
    name: string;
    logoUrl?: string;
    address?: string;
    instagramUrl?: string;
    websiteUrl?: string;
}

interface Benefit {
    id: string;
    title: string;
    description?: string;
    conditions?: string;
    imageUrl?: string;
    partner: Partner;
}

export default function BenefitsPage() {
    const [benefits, setBenefits] = useState<Benefit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        fetchBenefits();
    }, []);

    const fetchBenefits = async () => {
        try {
            const { data } = await api.get('/benefits');
            setBenefits(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar beneficios.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClaim = async (id: string, benefitTitle: string) => {
        setClaimingId(id);
        try {
            await api.post(`/benefits/${id}/claim`);
            toast.success('¡Cupón solicitado! Lo encontrarás en "Mis Cupones"');

            // Meta Pixel: Track Lead
            if (typeof window !== 'undefined' && (window as any).fbq) {
                (window as any).fbq('track', 'Lead', {
                    content_name: benefitTitle,
                    content_category: 'Benefits Club'
                });
            }
            // Redirect or Open Modal? For now just toast.
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'No se pudo solicitar el cupón.');
        } finally {
            setClaimingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen pt-20">
                <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-8 max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
                Club de Beneficios
            </h1>
            <p className="text-zinc-400 mb-10 text-lg">
                Descuentos y regalos exclusivos de nuestros partners.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit) => (
                    <div key={benefit.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col hover:border-pink-500/50 transition-colors">
                        <div className="relative h-48 w-full bg-zinc-800">
                            {(benefit.imageUrl || benefit.partner.logoUrl) ? (
                                <Image
                                    src={benefit.imageUrl || benefit.partner.logoUrl || '/placeholder.png'}
                                    alt={benefit.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-600">
                                    <Ticket className="w-12 h-12" />
                                </div>
                            )}
                            <Link href={`/partners/${benefit.partner.id}`} className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 hover:bg-black/90 transition-colors z-10">
                                {benefit.partner.logoUrl && (
                                    <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                        <Image src={benefit.partner.logoUrl} alt={benefit.partner.name} fill className="object-cover" />
                                    </div>
                                )}
                                <span className="text-xs font-medium text-white">{benefit.partner.name}</span>
                            </Link>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                            {benefit.description && (
                                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{benefit.description}</p>
                            )}

                            <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between">
                                <div className="flex gap-3">
                                    {benefit.partner.instagramUrl && (
                                        <a href={benefit.partner.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-pink-500">
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    )}
                                    {benefit.partner.websiteUrl && (
                                        <a href={benefit.partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-500">
                                            <Globe className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleClaim(benefit.id, benefit.title)}
                                    disabled={!!claimingId}
                                    className="bg-zinc-100 hover:bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {claimingId === benefit.id ? 'Solicitando...' : 'Quiero mi cupón'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {benefits.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                    <p>Aun no hay beneficios disponibles. ¡Vuelve pronto!</p>
                </div>
            )}
        </div>
    );
}
