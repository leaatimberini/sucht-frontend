'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import type { Table } from '@/types/table.types';

const statusStyles = {
    available: 'bg-green-500/30 border-green-500 hover:bg-green-500/50',
    reserved: 'bg-red-500/30 border-red-500 cursor-not-allowed',
    occupied: 'bg-red-500/30 border-red-500 cursor-not-allowed',
    unavailable: 'bg-zinc-700/30 border-zinc-700 cursor-not-allowed',
};

const statusLabels = {
    available: 'Disponible',
    reserved: 'Reservada',
    occupied: 'Ocupada',
    unavailable: 'No disponible',
}

export function TableReservationModal({ eventId, onClose }: { eventId: string; onClose: () => void; }) {
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTables = async () => {
            if (!eventId) return;
            setIsLoading(true);
            try {
                const response = await api.get(`/tables/event/${eventId}`);
                setTables(response.data);
            } catch (error) {
                toast.error("No se pudieron cargar las mesas disponibles.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTables();
    }, [eventId]);

    const handleTableClick = (table: Table) => {
        if (table.status !== 'available') {
            toast.error(`La mesa ${table.tableNumber} no está disponible.`);
            return;
        }
        // Aquí conectaremos con el TicketAcquirer en el siguiente paso
        toast.success(`Has seleccionado la mesa ${table.tableNumber}.`);
        onClose(); // Cierra el modal por ahora
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400 hover:text-white z-10">
                    <X size={24} />
                </button>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Reserva tu Mesa VIP</h2>
                    {isLoading ? (
                        <div className="flex justify-center items-center p-8 h-96">
                            <Loader2 className="animate-spin text-white"/>
                        </div>
                    ) : (
                        <div className="relative w-full max-w-sm mx-auto">
                            <Image
                                src="/images/tables-map-bg.png"
                                alt="Mapa de mesas"
                                width={512}
                                height={768}
                                className="w-full h-auto"
                            />
                            {tables.map(table => (
                                <button
                                    key={table.id}
                                    onClick={() => handleTableClick(table)}
                                    className={`absolute flex items-center justify-center w-8 h-8 rounded-md border-2 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 ${statusStyles[table.status]}`}
                                    style={{
                                        top: `${table.positionY || 50}%`,
                                        left: `${table.positionX || 50}%`,
                                    }}
                                    title={`${table.category.name} ${table.tableNumber} - ${statusLabels[table.status]}`}
                                >
                                    <span className="font-bold text-white text-sm">{table.tableNumber}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}