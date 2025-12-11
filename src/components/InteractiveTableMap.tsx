'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Table } from '@/types/table.types';

const statusStyles = {
    available: 'bg-green-500/30 border-green-500 hover:bg-green-500/50',
    reserved: 'bg-red-500/30 border-red-500 cursor-not-allowed',
    occupied: 'bg-amber-500/30 border-amber-500 cursor-not-allowed',
    unavailable: 'bg-zinc-700/30 border-zinc-700 cursor-not-allowed',
};

const statusLabels = {
    available: 'Disponible',
    reserved: 'Reservada',
    occupied: 'Ocupada',
    unavailable: 'No disponible',
}

export function InteractiveTableMap({ eventId }: { eventId: string }) {
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTables = async () => {
            if (!eventId) return;
            setIsLoading(true);
            try {
                const response = await api.get(`/tables/public/event/${eventId}`);
                setTables(response.data);
            } catch (error) {
                console.error("Failed to fetch tables for event", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTables();
    }, [eventId]);

    const handleTableClick = (table: Table) => {
        if (table.status !== 'available') {
            toast.error(`La mesa ${table.tableNumber} (${statusLabels[table.status]}) no está disponible.`);
            return;
        }
        // Próximo paso: Abrir modal de reserva
        toast.success(`Has seleccionado la mesa ${table.tableNumber} (${table.category.name}).`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8 bg-zinc-900/50 rounded-lg">
                <Loader2 className="animate-spin text-white" />
            </div>
        );
    }

    if (tables.length === 0) {
        return null; // Si no hay mesas configuradas, no se muestra el mapa.
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 my-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-center font-heading tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                Selecciona tu Mesa
            </h2>
            <div className="relative w-full max-w-md mx-auto aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl shadow-pink-900/20 border border-pink-500/20">
                <Image
                    src="/images/map-3d.png" // Changed to new 3D map
                    alt="Mapa de mesas 3D"
                    fill
                    className="object-contain"
                    priority
                />

                {tables.map(table => {
                    const isAvailable = table.status === 'available';
                    return (
                        <button
                            key={table.id}
                            onClick={() => handleTableClick(table)}
                            className={`absolute flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 
                                ${isAvailable
                                    ? 'bg-gradient-to-br from-green-400 to-emerald-600 hover:scale-125 hover:shadow-[0_0_15px_rgba(74,222,128,0.8)] border border-white/50'
                                    : table.status === 'occupied'
                                        ? 'bg-zinc-900/80 border border-zinc-600 text-zinc-500 cursor-not-allowed'
                                        : 'bg-red-600/80 border border-red-400 text-white/50 cursor-not-allowed'
                                }
                                shadow-[0_4px_10px_rgba(0,0,0,0.5)]
                            `}
                            style={{
                                top: `${table.positionY || 50}%`,
                                left: `${table.positionX || 50}%`,
                            }}
                            title={`${table.category.name} ${table.tableNumber} - ${statusLabels[table.status]}`}
                        >
                            <span className={`text-[9px] font-bold ${isAvailable ? 'text-white drop-shadow-md' : ''}`}>
                                {table.tableNumber}
                            </span>
                            {/* Glow Effect for Available Tables */}
                            {isAvailable && (
                                <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20 duration-1000"></span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}