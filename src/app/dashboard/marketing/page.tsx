
'use client';

import { useState } from "react";
import { MarketingOverview } from "@/components/marketing/marketing-overview";
import { CampaignList } from "@/components/marketing/campaign-list";
import { AiAdGenerator } from "@/components/marketing/ai-ad-generator";
import { AdLibrary } from "@/components/marketing/ad-library";
import { LayoutDashboard, Megaphone, Sparkles, Image as ImageIcon } from "lucide-react";

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="flex flex-col gap-6 p-6">
            <h1 className="text-3xl font-bold tracking-tight">Marketing & Ads Center</h1>

            {/* Custom Tab Navigation */}
            <div className="flex space-x-1 rounded-xl bg-muted p-1 w-full md:w-auto self-start">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === 'overview'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                        }`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Resumen
                </button>
                <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === 'campaigns'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                        }`}
                >
                    <Megaphone className="w-4 h-4" />
                    Campañas
                </button>
                <button
                    onClick={() => setActiveTab('ai-studio')}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === 'ai-studio'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    Estudio IA
                </button>
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === 'gallery'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                        }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    Galería
                </button>
            </div>

            {/* Tab Content */}
            <div className="mt-2 text-white">
                {activeTab === 'overview' && <MarketingOverview />}

                {activeTab === 'campaigns' && <CampaignList />}

                {activeTab === 'ai-studio' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <AiAdGenerator />
                        {/* You can add AdCreativeList or recent generations here later */}
                        <div className="bg-muted/30 border border-dashed border-zinc-700 rounded-xl flex items-center justify-center p-12 text-muted-foreground">
                            <div className="text-center">
                                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Historial de generaciones aparecerá aquí.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'gallery' && <AdLibrary />}
            </div>
        </div >
    );
}
