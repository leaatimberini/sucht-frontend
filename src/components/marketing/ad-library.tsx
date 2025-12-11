
'use client';
import { useState, useEffect } from 'react';
import { marketingService } from '@/lib/services/marketing.service';
import { RefreshCw, TrendingUp, DollarSign, MousePointer, Eye, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function AdLibrary() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const data = await marketingService.getAds();
            setAds(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await marketingService.syncAds();
            await new Promise(r => setTimeout(r, 2000)); // Fake delay for UX
            await fetchAds();
        } catch (error) {
            console.error(error);
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const getRoasColor = (roas: number) => {
        if (roas >= 2.5) return 'text-green-500';
        if (roas >= 1.5) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-pink-500" />
                        Galería de Creativos
                    </h3>
                    <p className="text-sm text-muted-foreground">Historial de rendimiento de todos tus anuncios visuales.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    Sincronizar Insights
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-zinc-900 rounded-xl animate-pulse" />)}
                </div>
            ) : ads.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl border-zinc-800">
                    <ImageIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay creativos registrados aún.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {ads.map((ad) => (
                        <div key={ad.id} className="group relative rounded-xl border border-zinc-800 bg-card overflow-hidden transition-all hover:border-zinc-700 hover:shadow-lg">
                            {/* Image Header */}
                            <div className="aspect-square bg-zinc-900 relative">
                                {ad.imgUrl ? (
                                    <img src={ad.imgUrl} alt={ad.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs font-mono">
                                    {ad.status}
                                </div>
                            </div>

                            {/* Metrics Body */}
                            <div className="p-4 space-y-3">
                                <h4 className="font-medium text-sm truncate" title={ad.name}>{ad.name}</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-zinc-900/50 p-2 rounded flex flex-col items-center">
                                        <span className="text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> ROAS</span>
                                        <span className={`font-bold ${getRoasColor(ad.roas)}`}>{ad.roas.toFixed(2)}x</span>
                                    </div>
                                    <div className="bg-zinc-900/50 p-2 rounded flex flex-col items-center">
                                        <span className="text-muted-foreground mb-1 flex items-center gap-1"><MousePointer className="w-3 h-3" /> CTR</span>
                                        <span className="font-bold">{ad.ctr.toFixed(2)}%</span>
                                    </div>
                                    <div className="bg-zinc-900/50 p-2 rounded flex flex-col items-center">
                                        <span className="text-muted-foreground mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Gasto</span>
                                        <span className="font-bold">${ad.spend}</span>
                                    </div>
                                    <div className="bg-zinc-900/50 p-2 rounded flex flex-col items-center">
                                        <span className="text-muted-foreground mb-1 flex items-center gap-1"><Eye className="w-3 h-3" /> Vistas</span>
                                        <span className="font-bold">{ad.impressions}</span>
                                    </div>
                                </div>

                                {ad.bodyText && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 italic border-t border-zinc-800 pt-2">
                                        &quot;{ad.bodyText}&quot;
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
