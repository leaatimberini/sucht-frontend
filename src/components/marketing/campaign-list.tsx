
'use client';

import { useEffect, useState } from "react";
import { marketingService } from "@/lib/services/marketing.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Trash2, Brain, Loader2, ChevronDown, ChevronUp, TrendingUp, Eye, MousePointerClick, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export function CampaignList() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingCampaign, setTogglingCampaign] = useState<string | null>(null);
    const [togglingAdSet, setTogglingAdSet] = useState<string | null>(null);
    const [togglingAd, setTogglingAd] = useState<string | null>(null);
    const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
    const [campaignDetails, setCampaignDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchCampaigns = async () => {
        try {
            const data = await marketingService.getCampaigns();
            console.log('Campaigns fetched:', data);
            setCampaigns(data);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            toast.error('Error al cargar campañas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const toggleCampaign = async (id: string, currentStatus: string) => {
        console.log('Toggling campaign:', id, 'Current status:', currentStatus);
        setTogglingCampaign(id);
        try {
            const result = await marketingService.toggleCampaign(id);
            console.log('Toggle result:', result);
            const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
            toast.success(
                newStatus === 'ACTIVE'
                    ? '✅ Campaña Activada (incluye AdSets)'
                    : '⏸️ Campaña Pausada (incluye AdSets)'
            );
            await fetchCampaigns();
            // Refresh details if expanded
            if (expandedCampaign === id) {
                await fetchCampaignDetails(id);
            }
        } catch (e) {
            console.error('Toggle error:', e);
            toast.error('Error al actualizar estado de campaña');
        } finally {
            setTogglingCampaign(null);
        }
    };

    const fetchCampaignDetails = async (campaignId: string) => {
        setLoadingDetails(true);
        try {
            const response = await marketingService.getCampaignDetails(campaignId);
            console.log('Campaign details:', response);
            setCampaignDetails(response);
        } catch (error) {
            console.error('Error fetching campaign details:', error);
            toast.error('Error al cargar detalles');
        } finally {
            setLoadingDetails(false);
        }
    };

    const toggleExpand = async (campaignId: string) => {
        if (expandedCampaign === campaignId) {
            setExpandedCampaign(null);
            setCampaignDetails(null);
        } else {
            setExpandedCampaign(campaignId);
            await fetchCampaignDetails(campaignId);
        }
    };

    const toggleAdSet = async (adSetId: string, currentStatus: string) => {
        console.log('Toggling AdSet:', adSetId, 'Current status:', currentStatus);
        setTogglingAdSet(adSetId);
        try {
            const result = await marketingService.toggleAdSet(adSetId);
            console.log('Toggle AdSet result:', result);
            toast.success(
                result.status === 'ACTIVE'
                    ? '✅ AdSet Activado'
                    : '⏸️ AdSet Pausado'
            );
            // Refresh details
            if (expandedCampaign) {
                await fetchCampaignDetails(expandedCampaign);
            }
        } catch (e) {
            console.error('Toggle AdSet error:', e);
            toast.error('Error al actualizar AdSet');
        } finally {
            setTogglingAdSet(null);
        }
    };

    const toggleAd = async (adId: string, currentStatus: string) => {
        console.log('Toggling Ad:', adId, 'Current status:', currentStatus);
        setTogglingAd(adId);
        try {
            const result = await marketingService.toggleAd(adId);
            console.log('Toggle Ad result:', result);
            toast.success(
                result.status === 'ACTIVE'
                    ? '✅ Anuncio Activado'
                    : '⏸️ Anuncio Pausado'
            );
            // Refresh details
            if (expandedCampaign) {
                await fetchCampaignDetails(expandedCampaign);
            }
        } catch (e) {
            console.error('Toggle Ad error:', e);
            toast.error('Error al actualizar anuncio');
        } finally {
            setTogglingAd(null);
        }
    };

    const deleteCampaign = async (id: string) => {
        if (confirm('¿Eliminar esta campaña? Se archivará en Meta.')) {
            try {
                await marketingService.deleteCampaign(id);
                toast.success('Campaña eliminada');
                fetchCampaigns();
            } catch (e) {
                console.error('Delete error:', e);
                toast.error('Error al eliminar');
            }
        }
    };

    const analyzeCampaign = async (id: string) => {
        try {
            toast.loading('🧠 Analizando campaña...');
            await marketingService.analyzeCampaign(id);
            toast.dismiss();
            toast.success('Análisis completado. Revisa el log de IA.');
        } catch (e) {
            toast.dismiss();
            toast.error('Error al iniciar análisis');
        }
    };

    if (loading) {
        return (
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="py-8">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                        <span className="ml-2 text-zinc-400">Cargando campañas...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-white">Mis Campañas</CardTitle>
                <CardDescription className="text-zinc-400">Últimas campañas creadas.</CardDescription>
            </CardHeader>
            <CardContent>
                {campaigns.length > 0 ? (
                    <div className="space-y-3">
                        {campaigns.map((c) => (
                            <div key={c.id} className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden">
                                {/* Campaign Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white text-sm sm:text-base truncate">{c.name}</p>
                                        <div className="flex flex-wrap gap-2 text-xs text-zinc-400 mt-1">
                                            <span className={`flex items-center gap-1 ${c.status === 'ACTIVE' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                {c.status}
                                            </span>
                                            <span>•</span>
                                            <span>${c.totalBudget}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span className="hidden sm:inline">{c.objective}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Expand Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 sm:px-3 text-blue-400 hover:bg-blue-400/10 text-xs sm:text-sm"
                                            onClick={() => toggleExpand(c.id)}
                                        >
                                            {expandedCampaign === c.id ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4 mr-1" />
                                                    <span className="hidden sm:inline">Ocultar</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4 mr-1" />
                                                    <span className="hidden sm:inline">Ver Detalles</span>
                                                </>
                                            )}
                                        </Button>

                                        {/* AI Analyze Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-purple-400 hover:bg-purple-400/10"
                                            title="Analizar con IA"
                                            onClick={() => analyzeCampaign(c.id)}
                                        >
                                            <Brain className="w-4 h-4" />
                                        </Button>

                                        {/* Toggle Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => toggleCampaign(c.id, c.status)}
                                            disabled={togglingCampaign === c.id}
                                            title={c.status === 'ACTIVE' ? 'Pausar' : 'Activar'}
                                        >
                                            {togglingCampaign === c.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                            ) : c.status === 'ACTIVE' ? (
                                                <span className="text-yellow-500">⏸️</span>
                                            ) : (
                                                <span className="text-green-500">▶️</span>
                                            )}
                                        </Button>

                                        {/* Delete Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                                            onClick={() => deleteCampaign(c.id)}
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedCampaign === c.id && (
                                    <div className="border-t border-zinc-800 bg-black/30 p-3 sm:p-4">
                                        {loadingDetails ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="w-5 h-5 animate-spin text-pink-500 mr-2" />
                                                <span className="text-zinc-400 text-sm">Cargando detalles...</span>
                                            </div>
                                        ) : campaignDetails ? (
                                            <div className="space-y-3">
                                                {/* Campaign Stats */}
                                                {campaignDetails.campaign?.insights && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                                        <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                                            <div className="flex items-center gap-1 text-zinc-400 text-xs mb-1">
                                                                <Eye className="w-3 h-3" />
                                                                <span>Impresiones</span>
                                                            </div>
                                                            <p className="text-white font-bold text-sm">{campaignDetails.campaign.insights.impressions || 0}</p>
                                                        </div>
                                                        <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                                            <div className="flex items-center gap-1 text-zinc-400 text-xs mb-1">
                                                                <MousePointerClick className="w-3 h-3" />
                                                                <span>Clics</span>
                                                            </div>
                                                            <p className="text-white font-bold text-sm">{campaignDetails.campaign.insights.clicks || 0}</p>
                                                        </div>
                                                        <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                                            <div className="flex items-center gap-1 text-zinc-400 text-xs mb-1">
                                                                <TrendingUp className="w-3 h-3" />
                                                                <span>CTR</span>
                                                            </div>
                                                            <p className="text-white font-bold text-sm">{campaignDetails.campaign.insights.ctr || 0}%</p>
                                                        </div>
                                                        <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                                            <div className="flex items-center gap-1 text-zinc-400 text-xs mb-1">
                                                                <DollarSign className="w-3 h-3" />
                                                                <span>Gastado</span>
                                                            </div>
                                                            <p className="text-white font-bold text-sm">${campaignDetails.campaign.insights.spend || 0}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* AdSets */}
                                                <div>
                                                    <h4 className="text-white font-semibold text-sm mb-2">Conjuntos de Anuncios ({campaignDetails.adSets?.length || 0})</h4>
                                                    <div className="space-y-2">
                                                        {campaignDetails.adSets?.map((adSet: any) => (
                                                            <div key={adSet.id} className="bg-zinc-900 p-2 sm:p-3 rounded border border-zinc-800">
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-white text-xs sm:text-sm font-medium truncate">{adSet.name}</p>
                                                                        <p className={`text-xs ${adSet.status === 'ACTIVE' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                                            {adSet.status}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                                        {adSet.insights && (
                                                                            <div className="text-right">
                                                                                <p className="text-xs text-zinc-400">Impresiones</p>
                                                                                <p className="text-white font-bold text-sm">{adSet.insights.impressions || 0}</p>
                                                                            </div>
                                                                        )}
                                                                        {/* Toggle AdSet Button */}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-7 w-7 p-0"
                                                                            onClick={() => toggleAdSet(adSet.id, adSet.status)}
                                                                            disabled={togglingAdSet === adSet.id}
                                                                            title={adSet.status === 'ACTIVE' ? 'Pausar AdSet' : 'Activar AdSet'}
                                                                        >
                                                                            {togglingAdSet === adSet.id ? (
                                                                                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                                                                            ) : adSet.status === 'ACTIVE' ? (
                                                                                <span className="text-yellow-500 text-sm">⏸️</span>
                                                                            ) : (
                                                                                <span className="text-green-500 text-sm">▶️</span>
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                {adSet.ads && adSet.ads.length > 0 && (
                                                                    <div className="mt-2 pl-2 border-l-2 border-pink-500/30">
                                                                        <p className="text-xs text-zinc-500 mb-1">Anuncios ({adSet.ads.length})</p>
                                                                        {adSet.ads.map((ad: any) => (
                                                                            <div key={ad.id} className="flex items-center justify-between py-1">
                                                                                <div className="text-xs text-zinc-400 flex-1 min-w-0 truncate">
                                                                                    📢 {ad.name || ad.id}
                                                                                </div>
                                                                                {/* Toggle Ad Button */}
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                                                                                    onClick={() => toggleAd(ad.id, ad.status || 'PAUSED')}
                                                                                    disabled={togglingAd === ad.id}
                                                                                    title={ad.status === 'ACTIVE' ? 'Pausar Ad' : 'Activar Ad'}
                                                                                >
                                                                                    {togglingAd === ad.id ? (
                                                                                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                                                                                    ) : ad.status === 'ACTIVE' ? (
                                                                                        <span className="text-yellow-500 text-xs">⏸️</span>
                                                                                    ) : (
                                                                                        <span className="text-green-500 text-xs">▶️</span>
                                                                                    )}
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-zinc-500 text-sm text-center py-4">No hay detalles disponibles</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-zinc-400 text-center py-8">No hay campañas creadas aún.</p>
                )}
            </CardContent>
        </Card>
    );
}
