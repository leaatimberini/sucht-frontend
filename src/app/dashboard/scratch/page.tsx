'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, Edit, Trash, RefreshCw } from 'lucide-react';

export default function ScratchAdminPage() {
    const [prizes, setPrizes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrize, setEditingPrize] = useState<any | null>(null);

    // Form Stats
    const totalProb = prizes.filter(p => p.isActive).reduce((acc, p) => acc + Number(p.probability), 0);

    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchPrizes();
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/scratch/history');
            setHistory(data);
        } catch (error) {
            console.error('Error loading history', error);
        }
    };

    const fetchPrizes = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/scratch/prizes');
            setPrizes(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar premios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este premio?')) return;
        try {
            await api.post(`/scratch/prizes/${id}/delete`);
            toast.success('Premio eliminado');
            fetchPrizes();
        } catch (error: any) {
            console.error(error);
            // Handle Soft Delete (Archive) feedback
            if (error.response?.status === 400 && error.response?.data?.message?.includes('desactivado')) {
                toast.success('Premio desactivado (tiene historial)', { icon: '📂' });
                fetchPrizes(); // Refresh to show INACTIVO status
            } else {
                toast.error('Error al eliminar');
            }
        }
    };

    const openModal = (prize?: any) => {
        setEditingPrize(prize || null);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Raspe y Gane</h1>
                    <p className="text-zinc-400">Gestiona los premios y probabilidades del juego.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Premio
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="text-zinc-500 text-sm uppercase font-bold mb-2">Total Premios Activos</h3>
                    <p className="text-3xl font-bold text-white">{prizes.filter(p => p.isActive).length}</p>
                </div>
                <div className={`bg-zinc-900 border p-6 rounded-xl ${totalProb > 100 ? 'border-red-500/50' : 'border-zinc-800'}`}>
                    <h3 className="text-zinc-500 text-sm uppercase font-bold mb-2">Probabilidad Total</h3>
                    <p className={`text-3xl font-bold ${totalProb > 100 ? 'text-red-400' : 'text-green-400'}`}>
                        {totalProb.toFixed(2)}%
                    </p>
                    {totalProb < 100 && <span className="text-xs text-zinc-500">{(100 - totalProb).toFixed(2)}% "Siga Participando"</span>}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-pink-500 w-8 h-8" /></div>
            ) : (
                <>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-12">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Premio</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4">Probabilidad</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {prizes.map(prize => (
                                    <tr key={prize.id} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{prize.name}</div>
                                            <div className="text-xs text-zinc-500 line-clamp-1">{prize.description}</div>
                                        </td>
                                        <td className="p-4 text-zinc-300 text-sm">{prize.type}</td>
                                        <td className="p-4 text-zinc-300 font-mono">{Number(prize.probability).toFixed(2)}%</td>
                                        <td className="p-4 text-zinc-300 font-mono">{prize.stock}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${prize.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {prize.isActive ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => openModal(prize)} className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white mr-2">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(prize.id)} className="p-2 hover:bg-red-900/30 rounded-lg text-red-400 hover:text-red-300">
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4">Historial de Participaciones</h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Usuario</th>
                                    <th className="p-4">Resultado</th>
                                    <th className="p-4">Premio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {history.map((attempt: any) => (
                                    <tr key={attempt.id} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-4 text-zinc-400 text-sm">
                                            {new Date(attempt.playedAt).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-white">
                                            <div className="font-medium">{attempt.user?.name || 'Usuario'}</div>
                                            <div className="text-xs text-zinc-500">{attempt.user?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            {attempt.didWin ? (
                                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">GANÓ</span>
                                            ) : (
                                                <span className="bg-zinc-800 text-zinc-500 px-2 py-1 rounded text-xs font-bold">PERDIÓ</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-zinc-300 text-sm">
                                            {attempt.didWin ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-pink-400">{attempt.prize?.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-600">Siga participando</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-zinc-500">
                                            No hay registros aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {isModalOpen && (
                <PrizeModal
                    prize={editingPrize}
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => { setIsModalOpen(false); fetchPrizes(); }}
                />
            )}
        </div>
    );
}

function PrizeModal({ prize, onClose, onSave }: { prize: any, onClose: () => void, onSave: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        probability: 0,
        stock: 0,
        type: 'INTERNAL',
        isActive: true,
        rewardId: ''
    });
    const [loading, setLoading] = useState(false);
    const [rewards, setRewards] = useState<any[]>([]);

    useEffect(() => {
        // Fetch Rewards for selection
        const fetchRewards = async () => {
            try {
                const { data } = await api.get('/rewards');
                setRewards(data);
            } catch (error) {
                console.error('Error loading rewards', error);
            }
        };
        fetchRewards();
    }, []);

    useEffect(() => {
        if (prize) {
            setFormData({
                name: prize.name,
                description: prize.description || '',
                probability: Number(prize.probability),
                stock: prize.stock,
                type: prize.type,
                isActive: prize.isActive,
                rewardId: prize.rewardId || ''
            });
        }
    }, [prize]);

    // Auto-fill details when selecting a reward
    const handleRewardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const rewardId = e.target.value;
        const selectedReward = rewards.find(r => r.id === rewardId);

        if (selectedReward) {
            setFormData(prev => ({
                ...prev,
                rewardId,
                name: selectedReward.name,
                description: selectedReward.description || prev.description,
                stock: selectedReward.stock || prev.stock
            }));
        } else {
            setFormData(prev => ({ ...prev, rewardId }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (prize) {
                await api.post(`/scratch/prizes/${prize.id}`, formData);
            } else {
                await api.post('/scratch/prizes', formData);
            }
            toast.success('Guardado correctamente');
            onSave();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg p-6 relative h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-6">{prize ? 'Editar Premio' : 'Nuevo Premio'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* TYPE SELECTION */}
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Tipo de Premio</label>
                        <select
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="INTERNAL">Interno (Producto/Barra)</option>
                            <option value="PARTNER">Partner (Cupón)</option>
                            <option value="NO_WIN">No Ganador (Siga Participando)</option>
                        </select>
                    </div>

                    {/* REWARD SELECTION (Only for INTERNAL) */}
                    {formData.type === 'INTERNAL' && (
                        <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/50">
                            <label className="block text-xs uppercase text-pink-400 font-bold mb-1">Vincular con Producto (Reward)</label>
                            <select
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                value={formData.rewardId}
                                onChange={handleRewardChange}
                            >
                                <option value="">-- Seleccionar --</option>
                                {rewards.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} ({r.pointsCost} pts)
                                    </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-zinc-500 mt-1">
                                Seleccionar un premio autocompletará el nombre y description. Al ganar, se generará el QR automáticamente.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Nombre</label>
                        <input
                            type="text"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Descripción</label>
                        <textarea
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none h-24 resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Probabilidad (%)</label>
                            <input
                                type="number" step="0.01" min="0" max="100"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                value={formData.probability}
                                onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 font-bold mb-1">Stock Asignado</label>
                            <input
                                type="number" min="-1"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-pink-600 focus:ring-pink-500"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <span className="text-zinc-300">Activo</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-zinc-400 hover:text-white font-bold text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
