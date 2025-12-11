'use client';

import { useRef, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Loader2, Trophy, Clock, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScratchStatus {
    canPlay: boolean;
    nextAttempt: string | null;
    lastResult?: {
        didWin: boolean;
        prizeId?: string;
        isCoupon?: boolean;
    }
}

export function ScratchGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<ScratchStatus | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [prize, setPrize] = useState<any>(null);
    const [isScratching, setIsScratching] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        if (status?.canPlay && !isRevealed && canvasRef.current) {
            // Small timeout to ensure layout is stable
            setTimeout(initCanvas, 50);
        }
    }, [status?.canPlay, isRevealed]);

    const fetchStatus = async () => {
        try {
            const { data } = await api.get('/scratch/status');
            setStatus(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const initCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        // Fill with overlay
        ctx.fillStyle = '#18181b'; // zinc-900
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add Text "RASPA AQUÍ"
        ctx.fillStyle = '#52525b'; // zinc-600
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('RASPA AQUÍ', canvas.width / 2, canvas.height / 2);

        // Pattern/Gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#db2777'); // pink-600
        gradient.addColorStop(1, '#8b5cf6'); // violet-500
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = gradient;
        // ctx.fillRect(0, 0, canvas.width, canvas.height); // Uncomment for solid gradient

        ctx.globalCompositeOperation = 'destination-out';
    };

    const handleScratch = async () => {
        if (isRevealed || !status?.canPlay || isScratching) return;

        // Count transparent pixels
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparent = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] < 128) transparent++;
        }

        const percent = (transparent / (pixels.length / 4)) * 100;

        if (percent > 90) {
            setIsScratching(true);
            try {
                const { data } = await api.post('/scratch/play');
                setPrize(data.prize);
                setIsRevealed(true);
                setStatus({ ...status, canPlay: false, nextAttempt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() });

                if (data.result === 'WIN') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                    toast.success('¡Ganaste!');
                } else {
                    toast('Siga participando', { icon: '😢' });
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Error al jugar');
                initCanvas(); // Reset on error
            } finally {
                setIsScratching(false);
            }
        }
    };

    const draw = (e: any) => {
        if (isRevealed || !status?.canPlay) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        handleScratch();
    };

    if (isLoading) return <div className="h-40 bg-zinc-900 rounded-xl animate-pulse"></div>;

    return (
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="text-yellow-500 w-5 h-5" />
                        Raspe y Gane
                    </h3>
                    <p className="text-sm text-zinc-400">¡Prueba tu suerte una vez por semana!</p>
                </div>
                {status?.nextAttempt && !status.canPlay && (
                    <div className="bg-zinc-800 px-3 py-1 rounded-full text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Vuelve: {new Date(status.nextAttempt).toLocaleDateString()}
                    </div>
                )}
            </div>

            <div className="relative h-48 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center p-4">
                {/* Result Layer (Underneath) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-0">
                    {isScratching ? (
                        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    ) : prize ? (
                        status?.lastResult?.isCoupon || prize.type === 'PARTNER' || prize.isCoupon ? (
                            // PARTNER WIN DISPLAY (COUPON STYLE)
                            <div className="w-full max-w-sm bg-white rounded-lg p-4 text-black shadow-xl transform scale-95 animate-in fade-in zoom-in duration-500">
                                <div className="border-2 border-dashed border-zinc-300 rounded p-3 flex flex-col items-center">
                                    <div className="bg-pink-100 text-pink-600 p-2 rounded-full mb-2">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-lg mb-1">{prize.name}</h4>
                                    <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{prize.description}</p>

                                    <div className="bg-zinc-100 w-full p-2 rounded border border-zinc-200 text-center font-mono text-sm font-bold tracking-widest text-zinc-700">
                                        {prize.id.substring(0, 8).toUpperCase()}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mt-2">
                                        Presenta este cupón en el local del partner.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // INTERNAL WIN DISPLAY
                            <>
                                <Trophy className="w-12 h-12 text-yellow-500 mb-2 animate-bounce" />
                                <h4 className="text-xl font-bold text-white mb-1">{prize.name}</h4>
                                <p className="text-sm text-zinc-400">{prize.description}</p>
                                <div className="mt-4 bg-zinc-800 p-2 rounded text-xs text-zinc-500 font-mono">
                                    Código generado: Ver en "Mis Premios"
                                </div>
                            </>
                        )
                    ) : isRevealed ? (
                        <>
                            <RefreshCw className="w-12 h-12 text-zinc-700 mb-2" />
                            <h4 className="text-lg font-bold text-zinc-500">Siga Participando</h4>
                            <p className="text-xs text-zinc-600">¡Inténtalo de nuevo la próxima semana!</p>
                        </>
                    ) : (
                        <span className="text-zinc-700 font-bold text-2xl">?</span>
                    )}
                </div>

                {/* Canvas Layer */}
                {status?.canPlay && !isRevealed && (
                    <div ref={containerRef} className="absolute inset-0 z-10 cursor-crosshair touch-none">
                        <canvas
                            ref={canvasRef}
                            onMouseMove={(e) => e.buttons === 1 && draw(e)}
                            onTouchMove={(e) => draw(e)}
                        />
                    </div>
                )}

                {!status?.canPlay && !isRevealed && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-zinc-400 font-bold mb-2">Vuelve la próxima semana</p>


                    </div>
                )}
            </div>
        </div>
    );
}
