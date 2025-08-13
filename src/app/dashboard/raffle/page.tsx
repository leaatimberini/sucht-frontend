'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Loader2, Ticket, Trophy, Check, Gift } from 'lucide-react';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { format } from 'date-fns';
import { Product } from '@/types/product.types';

// --- TIPOS DE DATOS ---
interface RaffleWinner {
  id: string;
  winner: { name: string; email: string; };
  event: { title: string; };
  prize: {
    redeemedAt: string | null;
    product: { name: string; };
  };
  drawnAt: string;
}

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function RaffleManagementPage() {
  const [history, setHistory] = useState<RaffleWinner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPrizeId, setCurrentPrizeId] = useState<string | null>(null);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [historyRes, productsRes, configRes] = await Promise.all([
        api.get('/raffles/history'),
        api.get('/store/products'),
        api.get('/configuration'),
      ]);
      setHistory(historyRes.data);
      setProducts(productsRes.data.filter((p: Product) => p.isActive));
      const prizeId = configRes.data.raffle_prize_product_id || '';
      setCurrentPrizeId(prizeId);
      setSelectedPrizeId(prizeId);
    } catch (error) {
      toast.error('No se pudieron cargar los datos del sorteo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetRafflePrize = async () => {
    if (!selectedPrizeId) {
      toast.error('Debes seleccionar un premio.');
      return;
    }
    try {
      await api.patch('/configuration', { raffle_prize_product_id: selectedPrizeId });
      toast.success('Premio del sorteo actualizado con éxito.');
      fetchData(); // Recargamos para confirmar el cambio
    } catch (error) {
      toast.error('No se pudo guardar el premio del sorteo.');
    }
  };

  const currentPrize = products.find(p => p.id === currentPrizeId);

  return (
    <AuthCheck allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="text-amber-400" />
                Gestión de Sorteo Semanal
            </h1>
            <p className="text-zinc-400 mt-2">Configura el premio para el próximo sorteo y revisa el historial de ganadores.</p>
        </div>

        {/* SECCIÓN DE CONFIGURACIÓN */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Premio del Próximo Sorteo</h2>
            {isLoading ? (
                <Loader2 className="animate-spin text-pink-500" />
            ) : (
                <>
                    {currentPrize && (
                        <p className="text-zinc-300 mb-4">Premio actual: <strong className="text-pink-400">{currentPrize.name}</strong></p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select 
                            value={selectedPrizeId} 
                            onChange={(e) => setSelectedPrizeId(e.target.value)}
                            className="w-full sm:flex-1 bg-zinc-800 border-zinc-700 rounded-md p-2"
                        >
                            <option value="">Selecciona un producto como premio...</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                        <button onClick={handleSetRafflePrize} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg">
                            Guardar Premio
                        </button>
                    </div>
                </>
            )}
        </div>

        {/* SECCIÓN DE HISTORIAL */}
        <div className="mt-10">
            <h2 className="text-2xl font-bold text-white mb-4">Historial de Ganadores</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-zinc-700">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-white">Fecha Sorteo</th>
                            <th className="p-4 text-sm font-semibold text-white">Ganador</th>
                            <th className="p-4 text-sm font-semibold text-white">Evento</th>
                            <th className="p-4 text-sm font-semibold text-white">Premio</th>
                            <th className="p-4 text-sm font-semibold text-white text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center p-6 text-zinc-400"><Loader2 className="animate-spin mx-auto" /></td></tr>
                        ) : history.map((winner) => (
                            <tr key={winner.id} className="border-b border-zinc-800 last:border-b-0">
                                <td className="p-4 text-zinc-400 text-sm">{format(new Date(winner.drawnAt), 'dd/MM/yyyy')}</td>
                                <td className="p-4"><p className="font-semibold text-zinc-200">{winner.winner.name}</p><p className="text-sm text-zinc-500">{winner.winner.email}</p></td>
                                <td className="p-4 text-zinc-300">{winner.event.title}</td>
                                <td className="p-4 font-semibold text-white">{winner.prize.product.name}</td>
                                <td className="p-4 text-center">
                                    {winner.prize.redeemedAt ? (
                                        <span className="flex items-center justify-center gap-2 text-green-400"><Check size={16} /> Canjeado</span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2 text-zinc-400"><Gift size={16} /> Pendiente</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {history.length === 0 && !isLoading && (
                            <tr><td colSpan={5} className="text-center p-6 text-zinc-500">Aún no hay ganadores registrados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </AuthCheck>
  );
}