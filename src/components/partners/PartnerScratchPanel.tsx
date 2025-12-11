'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, Trophy, Save, X, Search, CheckCircle, AlertTriangle } from 'lucide-react';

export function PartnerScratchPanel() {
    const [prizes, setPrizes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [redeemResult, setRedeemResult] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        probability: 0,
        stock: 0,
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prizesRes, historyRes] = await Promise.all([
                api.get('/scratch/prizes'),
                api.get('/scratch/partner/history')
            ]);
            setPrizes(prizesRes.data);
            setHistory(historyRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/scratch/prizes', {
                ...formData,
                type: 'PARTNER' // Force type
            });
            toast.success('Premio creado');
            setIsCreating(false);
            setFormData({ name: '', description: '', probability: 0, stock: 0, isActive: true });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al crear');
        }
    };

    const handleRedeem = async () => {
        if (!redeemCode) return toast.error('Ingresa un código');
        try {
            const { data } = await api.post(`/scratch/redeem/${redeemCode}`);
            setRedeemResult({ success: true, data });
            toast.success('Premio validado');
            fetchData();
        } catch (error: any) {
            setRedeemResult({ success: false, message: error.response?.data?.message || 'Código inválido' });
            toast.error('Error al validar');
        }
    };

    if (isLoading) return <div className="h-40 animate-pulse bg-zinc-900 rounded-xl"></div>;

    return (
        <div>
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="text-zinc-500 text-sm uppercase font-bold mb-2">Premios Activos</h3>
                    <p className="text-3xl font-bold text-white">{prizes.filter(p => p.isActive).length}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="text-zinc-500 text-sm uppercase font-bold mb-2">Validar Ganador</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Código (UUID)"
                            className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white w-full text-sm font-mono"
                            value={redeemCode}
                            onChange={(e) => setRedeemCode(e.target.value)}
                        />
                        <button onClick={handleRedeem} className="bg-green-600 hover:bg-green-700 text-white px-4 rounded font-bold">
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    </div>
                    {redeemResult && (
                        <div className={`mt-2 p-2 rounded text-sm ${redeemResult.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            {redeemResult.success ? (
                                <span>✅ {redeemResult.data.prizeName} entregado!</span>
                            ) : (
                                <span>❌ {redeemResult.message}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <h3 className="font-bold text-white mb-4">Últimos Canjes</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-zinc-500 uppercase text-xs border-b border-zinc-800">
                            <tr>
                                <th className="pb-2">Fecha</th>
                                <th className="pb-2">Ganador</th>
                                <th className="pb-2">Premio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {/* We need to fetch history separately or use effect */}
                            {history.length > 0 ? history.map((h: any) => (
                                <tr key={h.id}>
                                    <td className="py-2 text-zinc-400">{new Date(h.playedAt).toLocaleDateString()}</td>
                                    <td className="py-2 text-white">{h.user?.name || 'Usuario'}</td>
                                    <td className="py-2 text-pink-400 font-bold">{h.prize?.name}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="py-4 text-center text-zinc-500 italic">No hay canjes recientes</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Mis Premios "Raspe y Gane"</h2>
                {!isCreating && (
                    <button onClick={() => setIsCreating(true)} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> Crear Premio
                    </button>
                )}
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="mb-8 p-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
                    <div className="flex justify-between">
                        <h3 className="font-bold text-white">Nuevo Premio</h3>
                        <button type="button" onClick={() => setIsCreating(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Nombre</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Stock</label>
                            <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Descripción</label>
                        <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Probabilidad (0-100%)</label>
                        <input type="number" step="0.01" max="100" required value={formData.probability} onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white" />
                        <p className="text-xs text-zinc-500 mt-1">La probabilidad compite con otros premios. Ajusta con cuidado.</p>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button type="submit" className="bg-white text-black px-6 py-2 rounded-lg font-bold">Guardar</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {prizes.map(prize => (
                    <div key={prize.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-zinc-800 p-3 rounded-full">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{prize.name}</h4>
                                <p className="text-zinc-500 text-sm">{prize.description}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">Stock: {prize.stock}</span>
                                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">Prob: {Number(prize.probability).toFixed(2)}%</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${prize.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {prize.isActive ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Actions could go here (Edit/Delete) */}
                    </div>
                ))}
                {prizes.length === 0 && !isLoading && (
                    <div className="text-center py-10 text-zinc-500">
                        No has creado premios para el juego aún.
                    </div>
                )}
            </div>
        </div>
    );
}
