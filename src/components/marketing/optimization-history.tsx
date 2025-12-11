
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { marketingService } from '@/lib/services/marketing.service';

import { VideoUploadModal } from './video-upload-modal';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

interface OptimizationLog {
    id: string;
    campaign: { id: string; name: string };
    aiDecision: 'SCALE_UP' | 'PAUSE' | 'LOWER_BUDGET' | 'MAINTAIN';
    reasoning: string;
    actionTaken: string;
    pendingAction?: string;
    uploadToken?: string;
    createdAt: string;
    currentMetrics: any;
}

export function OptimizationHistory() {
    const [logs, setLogs] = useState<OptimizationLog[]>([]);
    const [selectedLog, setSelectedLog] = useState<OptimizationLog | null>(null);

    const fetchLogs = async () => {
        try {
            const data = await marketingService.getOptimizationLogs();
            setLogs(data);
        } catch (e: any) {
            console.error('Failed to fetch logs', e);
            // If 401, stop polling or handle logout? 
            // For now, let's just log it. ideally auth store handles global 401 logout.
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const getBadgeColor = (decision: string) => {
        switch (decision) {
            case 'SCALE_UP': return 'bg-green-500';
            case 'PAUSE': return 'bg-red-500';
            case 'LOWER_BUDGET': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <>
            <Card className="h-full bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <span>🧠 Cerebro AI</span>
                        <span className="text-xs font-normal border border-zinc-700 bg-zinc-800 text-green-400 px-2 py-0.5 rounded-full">En vivo</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full pr-4 overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
                                <div className="animate-pulse w-2 h-2 bg-pink-500 rounded-full"></div>
                                <p className="text-sm text-center">Esperando primera optimización...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex flex-col gap-1 p-3 border border-zinc-800 rounded-lg bg-black/20 text-sm">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-white truncate max-w-[120px]">{log.campaign?.name || 'Campaña Desconocida'}</span>
                                            <span className={`${getBadgeColor(log.aiDecision)} text-white px-2 py-0.5 rounded-full text-[10px]`}>{log.aiDecision}</span>
                                        </div>
                                        <p className="text-zinc-500 text-xs mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                                        <p className="mt-2 text-zinc-300 italic">&quot;{log.reasoning}&quot;</p>

                                        {/* Pending Action Button */}
                                        {log.pendingAction === 'UPLOAD_VIDEO' && log.uploadToken && (
                                            <div className="mt-2">
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-pink-600 hover:bg-pink-700 text-white h-7 text-xs"
                                                    onClick={() => setSelectedLog(log)}
                                                >
                                                    <Video className="w-3 h-3 mr-2" />
                                                    Cargar Video Reel
                                                </Button>
                                            </div>
                                        )}

                                        {log.actionTaken && !log.pendingAction && (
                                            <div className="mt-2 text-xs font-medium text-blue-400">
                                                👉 Acción: {log.actionTaken}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedLog && selectedLog.uploadToken && (
                <VideoUploadModal
                    isOpen={!!selectedLog}
                    onClose={() => setSelectedLog(null)}
                    campaignId={selectedLog.campaign?.id}
                    uploadToken={selectedLog.uploadToken}
                    onSuccess={() => {
                        fetchLogs(); // Refresh to see update
                        setSelectedLog(null);
                    }}
                />
            )}
        </>
    );
}
