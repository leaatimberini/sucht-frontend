'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, ChevronRight, Store, Search } from 'lucide-react';
import { PartnerCard } from '@/components/partners/PartnerCard';
import { useRouter } from 'next/navigation';

export default function BenefitsPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<string[]>([]);
    const [partners, setPartners] = useState<any[]>([]);

    // States: 'CATEGORIES' | 'PARTNERS'
    const [view, setView] = useState<'CATEGORIES' | 'PARTNERS'>('CATEGORIES');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/partners/categories');
            setCategories(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar rubros.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategorySelect = async (category: string) => {
        setSelectedCategory(category);
        setView('PARTNERS');
        setIsLoading(true);
        try {
            const { data } = await api.get(`/partners?category=${encodeURIComponent(category)}`);
            setPartners(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar partners.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setView('CATEGORIES');
        setSelectedCategory(null);
        setPartners([]);
    };

    if (isLoading && view === 'CATEGORIES') { // Only full screen load for initial
        return (
            <div className="flex justify-center items-center min-h-screen pt-20 bg-zinc-950">
                <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-8 max-w-7xl mx-auto">
            <header className="mb-10">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4 animate-gradient-x">
                    Club de Beneficios
                </h1>
                <p className="text-zinc-400 text-lg md:text-xl font-light">
                    Explora descuentos exclusivos en los mejores lugares.
                </p>
            </header>

            {view === 'PARTNERS' && (
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 group transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Volver a Categorías</span>
                </button>
            )}

            {view === 'CATEGORIES' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleCategorySelect(cat)}
                            className="group relative h-32 md:h-40 rounded-2xl overflow-hidden border border-zinc-800 hover:border-pink-500/50 transition-all active:scale-95 text-left p-6 flex flex-col justify-end bg-gradient-to-br from-zinc-900 to-black hover:from-zinc-900 hover:to-zinc-900"
                        >
                            <div className="absolute top-4 right-4 bg-zinc-800/50 p-2 rounded-full group-hover:bg-pink-500/20 group-hover:text-pink-400 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-pink-500 transition-colors capitalize">
                                {cat}
                            </h3>
                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider group-hover:text-zinc-400">Ver Partners</span>
                        </button>
                    ))}

                    {categories.length === 0 && !isLoading && (
                        <div className="col-span-full py-20 text-center">
                            <Store className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                            <p className="text-zinc-500">No hay rubros disponibles por el momento.</p>
                        </div>
                    )}
                </div>
            )}

            {view === 'PARTNERS' && (
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <h2 className="text-2xl font-bold text-white capitalize">
                            {selectedCategory}
                        </h2>
                        <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-full">{partners.length}</span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {partners.map(partner => (
                                <div key={partner.id} className="h-[400px]">
                                    <PartnerCard
                                        partner={partner}
                                        onClick={() => router.push(`/partners/${partner.id}`)}
                                    />
                                </div>
                            ))}
                            {partners.length === 0 && (
                                <p className="text-zinc-500 col-span-full">No hay partners en esta categoría.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


