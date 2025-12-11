// SalesHistoryPage Component - src/app/dashboard/sales/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import { Ticket } from '@/types/ticket.types';
import { Event } from '@/types/event.types';
import { formatDate } from '@/lib/date-utils';
import { Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

// --- SUB-COMPONENTE PARA LOS FILTROS ---
function SalesFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        api.get('/events/all-for-admin').then(response => setEvents(response.data)).catch(err => {
            console.error('Error cargando eventos:', err);
        });
    }, []);

    const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const filters = {
            eventId: formData.get('eventId'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
        };
        onFilterChange(filters);
    };

    return (
        <form onSubmit={handleFilterSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4">
            <select name="eventId" className="w-full sm:w-[200px] bg-zinc-800 border-zinc-700 p-2 rounded-md">
                <option value="">Todos los eventos</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
            <input type="date" name="startDate" className="w-full sm:w-auto bg-zinc-800 border-zinc-700 p-2 rounded-md" />
            <input type="date" name="endDate" className="w-full sm:w-auto bg-zinc-800 border-zinc-700 p-2 rounded-md" />
            <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg">Aplicar Filtros</button>
        </form>
    );
}


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function SalesHistoryPage() {
    const [history, setHistory] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async (filters: any = {}) => {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filters.eventId) params.append('eventId', String(filters.eventId));
        if (filters.startDate) params.append('startDate', String(filters.startDate));
        if (filters.endDate) params.append('endDate', String(filters.endDate));

        try {
            const response = await api.get(`/dashboard/full-history?${params.toString()}`);
            setHistory(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando historial.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteTicket = async (ticketId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada? Esta acción no se puede deshacer.')) {
            try {
                await api.delete(`/tickets/${ticketId}`);
                toast.success('Entrada eliminada con éxito.');
                fetchData(); // Recargamos el historial
            } catch (error) {
                toast.error('No se pudo eliminar la entrada.');
            }
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Historial de Ventas y Emisiones</h1>

            <SalesFilters onFilterChange={fetchData} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-zinc-700">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-white">Fecha</th>
                            <th className="p-4 text-sm font-semibold text-white">Cliente</th>
                            <th className="p-4 text-sm font-semibold text-white">Producto</th>
                            <th className="p-4 text-sm font-semibold text-white">Pagado</th>
                            <th className="p-4 text-sm font-semibold text-white">Estado</th>
                            <th className="p-4 text-sm font-semibold text-white">Origen / RRPP</th>
                            <th className="p-4 text-sm font-semibold text-white">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} className="text-center p-6"><Loader2 className="animate-spin mx-auto" /></td></tr>
                        ) : history.map(ticket => (
                            <tr key={ticket.id} className="border-b border-zinc-800 last:border-b-0">
                                <td className="p-4 text-zinc-400 text-sm">
                                    {formatDate(ticket.createdAt)} hs
                                </td>
                                <td className="p-4">
                                    <p className="font-semibold text-zinc-200">{ticket.user?.name || 'N/A'}</p>
                                    <p className="text-sm text-zinc-500">{ticket.user?.email || 'N/A'}</p>
                                </td>
                                <td className="p-4">
                                    <p className="font-semibold text-white">{ticket.tier?.name || 'Producto no disponible'} (x{ticket.quantity})</p>
                                    <p className="text-sm text-zinc-400">{ticket.event?.title}</p>
                                </td>
                                <td className="p-4 font-bold text-green-400">${Number(ticket.amountPaid).toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${ticket.status === 'valid' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="p-4 text-zinc-300">{ticket.promoter ? `@${ticket.promoter.username || ticket.promoter.name}` : (ticket.origin || 'N/A')}</td>
                                <td className="p-4">
                                    <button onClick={() => handleDeleteTicket(ticket.id)} className="text-red-500 hover:text-red-400">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {history.length === 0 && !isLoading && (
                            <tr><td colSpan={7} className="text-center p-6 text-zinc-500">No se encontraron resultados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
