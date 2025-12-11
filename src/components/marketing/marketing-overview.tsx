'use client';

import { useEffect, useState } from "react";
import { marketingService } from "@/lib/services/marketing.service";
import { AiAdGenerator } from "@/components/marketing/ai-ad-generator";
import { QuickPromoteModal } from "@/components/marketing/quick-promote-modal";
import { WhatsappStatusCard } from "@/components/marketing/whatsapp-status-card";
import { ConnectAccountModal } from "@/components/marketing/connect-account-modal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ExternalLink, CheckCircle, Trash2, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { OptimizationHistory } from './optimization-history';

interface MarketingAccount {
    id: string;
    name: string;
    accountId: string;
    platform: string;
    isActive: boolean;
}

export function MarketingOverview() {
    const [accounts, setAccounts] = useState<MarketingAccount[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        try {
            const [accData, campData] = await Promise.all([
                marketingService.getAccounts(),
                marketingService.getCampaigns()
            ]);
            setAccounts(accData);
            setCampaigns(campData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const activeAccount = accounts.find(a => a.isActive) || accounts[0];

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Marketing & Ads Center</h1>
                {activeAccount && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium border border-green-500/20">
                        <CheckCircle className="w-4 h-4" />
                        Conectado: {activeAccount.name}
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Stats Cards */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'ACTIVE').length}</div>
                        <p className="text-xs text-muted-foreground">de {campaigns.length} total</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Campaigns */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mis Campañas</CardTitle>
                            <CardDescription>Ultimas campañas creadas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {campaigns.length > 0 ? (
                                <div className="space-y-4">
                                    {campaigns.map((c) => (
                                        <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                            <div className="flex flex-col">
                                                <p className="font-medium text-white">{c.name}</p>
                                                <div className="flex gap-2 text-xs text-muted-foreground items-center">
                                                    <span className={`flex items-center gap-1 ${c.status === 'ACTIVE' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                        {c.status}
                                                    </span>
                                                    <span>•</span>
                                                    <span>Presupuesto: ${c.totalBudget}</span>
                                                    <span>•</span>
                                                    <span>Objetivo: {c.objective}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right mr-2">
                                                    <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
                                                    {c.account && <p className="text-[10px] text-muted-foreground">Cta: {c.account.name}</p>}
                                                </div>

                                                {/* Visualize Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-purple-400 hover:bg-purple-400/10"
                                                    title="Analizar con IA Ahora"
                                                    onClick={async () => {
                                                        try {
                                                            toast.loading('🧠 Analizando campaña...');
                                                            await marketingService.analyzeCampaign(c.id);
                                                            toast.dismiss();
                                                            toast.success('Análisis completado. Revisa el log de IA.');
                                                        } catch (e) {
                                                            toast.dismiss();
                                                            toast.error('Error al iniciar análisis');
                                                        }
                                                    }}
                                                >
                                                    <Brain className="w-4 h-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={async () => {
                                                        try {
                                                            await marketingService.toggleCampaign(c.id);
                                                            toast.success(c.status === 'ACTIVE' ? 'Campaña Pausada' : 'Campaña Activada');
                                                            refreshData();
                                                        } catch (e) {
                                                            toast.error('Error al actualizar estado');
                                                        }
                                                    }}
                                                >
                                                    {c.status === 'ACTIVE' ? (
                                                        <span className="text-yellow-500">⏸️</span>
                                                    ) : (
                                                        <span className="text-green-500">▶️</span>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                                                    onClick={async () => {
                                                        if (confirm('¿Eliminar esta campaña? Se archivará en Meta.')) {
                                                            try {
                                                                await marketingService.deleteCampaign(c.id);
                                                                toast.success('Campaña eliminada');
                                                                refreshData();
                                                            } catch (e) {
                                                                toast.error('Error al eliminar');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay campañas creadas aún.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Connected Accounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cuentas Conectadas</CardTitle>
                            <CardDescription>Gestiona tus conexiones con Meta y Google.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {accounts.length > 0 ? (
                                <div className="space-y-4">
                                    {accounts.map((acc) => (
                                        <div key={acc.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500">
                                                    <span className="font-bold">f</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{acc.name}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {acc.accountId}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${acc.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-sm text-muted-foreground mr-2">{acc.isActive ? 'Activa' : 'Inactiva'}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                    onClick={async () => {
                                                        if (confirm('¿Estás seguro de eliminar esta cuenta?')) {
                                                            try {
                                                                await marketingService.deleteAccount(acc.id);
                                                                refreshData();
                                                                toast.success('Cuenta eliminada');
                                                            } catch (err) {
                                                                toast.error('Error al eliminar');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-border">
                                        <ConnectAccountModal onAccountAdded={refreshData} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <ExternalLink className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h4 className="text-lg font-semibold">No hay cuentas conectadas</h4>
                                    <p className="text-muted-foreground max-w-sm mt-2 mb-6">Conecta tu cuenta publicitaria para empezar a promocionar eventos.</p>
                                    <ConnectAccountModal onAccountAdded={refreshData} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: AI & Tools */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Optimization History (AI Brain) */}
                    <OptimizationHistory />

                    {/* Sidebar Tools */}
                    <WhatsappStatusCard />
                    <Card>
                        <CardHeader>
                            <CardTitle>Acciones Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <QuickPromoteModal />
                        </CardContent>
                    </Card>
                    <AiAdGenerator />
                </div>
            </div>
        </div>
    );
}
