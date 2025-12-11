'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Loader2, Instagram, Globe, Ticket, MapPin, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function PartnerPublicProfile() {
    const params = useParams();
    const id = params.id as string;

    const [partner, setPartner] = useState<any>(null);
    const [benefits, setBenefits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [partnerRes, benefitsRes] = await Promise.all([
                api.get(`/partners/${id}`),
                api.get(`/benefits/partner/${id}`)
            ]);
            setPartner(partnerRes.data);
            setBenefits(benefitsRes.data);

            // Track view
            api.post(`/partners/${id}/view`).catch(err => console.error(err));
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar perfil del partner.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]);

    const handleClaim = async (benefitId: string, benefitTitle: string) => {
        setClaimingId(benefitId);
        try {
            await api.post(`/benefits/${benefitId}/claim`);
            toast.success('¡Cupón solicitado! Lo encontrarás en "Mis Cupones"');

            // Meta Pixel: Track Lead
            if (typeof window !== 'undefined' && (window as any).fbq) {
                (window as any).fbq('track', 'Lead', {
                    content_name: benefitTitle,
                    content_category: 'Benefits Club',
                    partner: partner?.name
                });
            }
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

    if (!partner) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen pt-20 text-zinc-500">
                <p>Perfil no encontrado.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header / Hero */}
            <div className="relative h-64 md:h-80 w-full bg-zinc-900 border-b border-zinc-800">
                {partner.coverUrl ? (
                    <div className="absolute inset-0">
                        <Image src={partner.coverUrl} alt="Cover" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black opacity-80"></div>
                )}

                <div className="absolute -bottom-16 left-0 right-0 container mx-auto px-4 flex flex-col md:flex-row items-center md:items-end gap-6">
                    {/* Logo */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-zinc-950 bg-black overflow-hidden relative shadow-xl">
                        {partner.logoUrl ? (
                            <Image src={partner.logoUrl} alt={partner.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                                <Store className="w-12 h-12" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left mb-4 md:mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{partner.name}</h1>
                        <div className="flex justify-center md:justify-start gap-4 flex-wrap">
                            {partner.address && (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <MapPin className="w-5 h-5" />
                                    <span>Cómo llegar</span>
                                </a>
                            )}
                            {partner.whatsapp && (
                                <a
                                    href={`https://wa.me/${partner.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-400 hover:text-green-500 transition-colors flex items-center gap-1"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>WhatsApp</span>
                                </a>
                            )}
                            {partner.instagramUrl && (
                                <a href={partner.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-pink-500 transition-colors flex items-center gap-1">
                                    <Instagram className="w-5 h-5" />
                                    <span>Instagram</span>
                                </a>
                            )}
                            {partner.websiteUrl && (
                                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-500 transition-colors flex items-center gap-1">
                                    <Globe className="w-5 h-5" />
                                    <span>Sitio Web</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 pt-24 pb-12 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* About */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
                        <h3 className="text-lg font-bold text-white mb-4">Sobre {partner.name}</h3>
                        <p className="text-zinc-400 whitespace-pre-wrap">{partner.description || 'Sin descripción disponible.'}</p>
                    </div>
                </div>

                {/* Active Benefits */}
                <div className="md:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-white">Beneficios Disponibles</h3>

                    {benefits.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {benefits.map(benefit => (
                                <div key={benefit.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-pink-500/50 transition-colors flex flex-col">
                                    <div className="relative h-40 w-full bg-zinc-800">
                                        {benefit.imageUrl ? (
                                            <Image src={benefit.imageUrl} alt={benefit.title} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-zinc-600">
                                                <Ticket className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h4 className="text-lg font-bold text-white mb-2">{benefit.title}</h4>
                                        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{benefit.description}</p>

                                        <div className="mt-auto pt-4 flex justify-between items-center border-t border-zinc-800/50">
                                            <button
                                                onClick={() => handleClaim(benefit.id, benefit.title)}
                                                disabled={!!claimingId}
                                                className="w-full bg-white text-black py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors text-sm disabled:opacity-50"
                                            >
                                                {claimingId === benefit.id ? 'Solicitando...' : 'Canjear Cupón'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-zinc-900/30 rounded-xl p-8 text-center border dashed border-zinc-800">
                            <p className="text-zinc-500">Este partner no tiene beneficios activos por el momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { Store } from 'lucide-react'; // Import missing icon
