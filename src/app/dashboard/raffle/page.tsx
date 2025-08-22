'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Loader2, Ticket, Trophy, Gift } from 'lucide-react';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { Product } from '@/types/product.types';
import { Event } from '@/types/event.types';

// --- COMPONENT INTERFACES ---
interface RaffleConfig {
    drawDate: string;
    numberOfWinners: number;
    prizes: { productId: string, prizeRank: number }[];
}

interface RaffleWinner {
    user: { name: string; email: string; };
    prize: { product: { name: string; }; prizeRank: number; };
}

export default function RaffleManagementPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [raffleConfig, setRaffleConfig] = useState<RaffleConfig>({
        drawDate: '',
        numberOfWinners: 1,
        prizes: [{ productId: '', prizeRank: 1 }]
    });
    const [winners, setWinners] = useState<RaffleWinner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [eventsRes, productsRes] = await Promise.all([
                api.get('/events/all-for-admin'),
                api.get('/store/products'),
            ]);
            setEvents(eventsRes.data);
            setProducts(productsRes.data.filter((p: Product) => p.isActive));
            if (eventsRes.data.length > 0) {
                setSelectedEventId(eventsRes.data[0].id);
            }
        } catch (error) {
            toast.error('No se pudieron cargar los datos iniciales.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handlePrizeChange = (index: number, productId: string) => {
        const newPrizes = [...raffleConfig.prizes];
        newPrizes[index] = { ...newPrizes[index], productId };
        setRaffleConfig({ ...raffleConfig, prizes: newPrizes });
    };

    const handleSaveRaffle = async () => {
        try {
            await api.post(`/raffles/configure/${selectedEventId}`, raffleConfig);
            toast.success('Sorteo configurado con éxito.');
        } catch (error) {
            toast.error('No se pudo guardar la configuración del sorteo.');
        }
    };

    return (
        <AuthCheck allowedRoles={[UserRole.ADMIN]}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Trophy className="text-amber-400" />
                        Gestión de Sorteos por Evento
                    </h1>
                    <p className="text-zinc-400 mt-2">Configura el sorteo para cada evento de forma individual.</p>
                </div>

                {/* SECCIÓN DE CONFIGURACIÓN */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Configuración del Sorteo</h2>
                    {isLoading ? (
                        <Loader2 className="animate-spin text-pink-500" />
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="event-select" className="block text-sm font-medium text-zinc-300">Seleccionar Evento</label>
                                <select
                                    id="event-select"
                                    value={selectedEventId}
                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                    className="w-full mt-1 bg-zinc-800 border-zinc-700 rounded-md p-2"
                                >
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="draw-date" className="block text-sm font-medium text-zinc-300">Fecha y Hora del Sorteo</label>
                                <input
                                    type="datetime-local"
                                    id="draw-date"
                                    value={raffleConfig.drawDate}
                                    onChange={(e) => setRaffleConfig({ ...raffleConfig, drawDate: e.target.value })}
                                    className="w-full mt-1 bg-zinc-800 border-zinc-700 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label htmlFor="num-winners" className="block text-sm font-medium text-zinc-300">Número de Ganadores</label>
                                <input
                                    type="number"
                                    id="num-winners"
                                    value={raffleConfig.numberOfWinners}
                                    onChange={(e) => setRaffleConfig({ ...raffleConfig, numberOfWinners: parseInt(e.target.value, 10) })}
                                    className="w-full mt-1 bg-zinc-800 border-zinc-700 rounded-md p-2"
                                />
                            </div>
                            {Array.from({ length: raffleConfig.numberOfWinners }).map((_, index) => (
                                <div key={index}>
                                    <label htmlFor={`prize-${index}`} className="block text-sm font-medium text-zinc-300">Premio para Ganador #{index + 1}</label>
                                    <select
                                        id={`prize-${index}`}
                                        value={raffleConfig.prizes[index]?.productId || ''}
                                        onChange={(e) => handlePrizeChange(index, e.target.value)}
                                        className="w-full mt-1 bg-zinc-800 border-zinc-700 rounded-md p-2"
                                    >
                                        <option value="">Selecciona un producto...</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                            <button onClick={handleSaveRaffle} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg">
                                Guardar Configuración
                            </button>
                        </div>
                    )}
                </div>

                {/* SECCIÓN DE HISTORIAL */}
                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-white mb-4">Ganadores del Evento Seleccionado</h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-zinc-700">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-white">Puesto</th>
                                    <th className="p-4 text-sm font-semibold text-white">Ganador</th>
                                    <th className="p-4 text-sm font-semibold text-white">Premio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={3} className="text-center p-6 text-zinc-400"><Loader2 className="animate-spin mx-auto" /></td></tr>
                                ) : winners.length > 0 ? (
                                    winners.map((winner, index) => (
                                        <tr key={winner.user.email} className="border-b border-zinc-800 last:border-b-0">
                                            <td className="p-4 text-zinc-400 text-sm">{index + 1}</td>
                                            <td className="p-4"><p className="font-semibold text-zinc-200">{winner.user.name}</p><p className="text-sm text-zinc-500">{winner.user.email}</p></td>
                                            <td className="p-4 font-semibold text-white">{winner.prize.product.name}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={3} className="text-center p-6 text-zinc-500">Aún no hay ganadores para este evento.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthCheck>
    );
}