'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { formatDate } from '@/lib/date-utils';
import toast from 'react-hot-toast';
import { Loader2, Package, Check, X } from 'lucide-react';

// Definimos el tipo de dato que esperamos de la API
interface ProductPurchaseHistory {
    id: string;
    user: { name: string; email: string };
    product: { name: string };
    event: { title: string };
    quantity: number;
    amountPaid: number;
    origin: string;
    redeemedAt: string | null;
    createdAt: string;
}

export default function ProductSalesHistoryPage() {
    const [history, setHistory] = useState<ProductPurchaseHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/store/purchase/history');
                setHistory(response.data);
            } catch (error) {
                toast.error('No se pudo cargar el historial de compras.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Package className="text-pink-400" />
                Historial de Compras de Productos
            </h1>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-zinc-700">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-white">Fecha</th>
                            <th className="p-4 text-sm font-semibold text-white">Cliente</th>
                            <th className="p-4 text-sm font-semibold text-white">Producto</th>
                            <th className="p-4 text-sm font-semibold text-white">Evento</th>
                            <th className="p-4 text-sm font-semibold text-white">Origen</th>
                            <th className="p-4 text-sm font-semibold text-white text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="text-center p-6 text-zinc-400"><Loader2 className="animate-spin mx-auto" /></td></tr>
                        ) : history.map((purchase) => (
                            <tr key={purchase.id} className="border-b border-zinc-800 last:border-b-0">
                                <td className="p-4 text-zinc-400 text-sm">{formatDate(purchase.createdAt, 'dd/MM/yy HH:mm')}hs</td>
                                <td className="p-4"><p className="font-semibold text-zinc-200">{purchase.user.name}</p><p className="text-sm text-zinc-500">{purchase.user.email}</p></td>
                                <td className="p-4 font-semibold text-white">{purchase.product.name} (x{purchase.quantity})</td>
                                <td className="p-4 text-zinc-300">{purchase.event.title}</td>
                                <td className="p-4"><span className={`px-2 py-0.5 text-xs rounded-full ${purchase.origin === 'PURCHASE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{purchase.origin}</span></td>
                                <td className="p-4 text-center">
                                    {purchase.redeemedAt ? (
                                        <span className="flex items-center justify-center gap-2 text-green-400"><Check size={16} /> Canjeado</span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2 text-zinc-400"><X size={16} /> Pendiente</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}