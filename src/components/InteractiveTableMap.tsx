'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Armchair, Loader2 } from 'lucide-react';
import Image from 'next/image'; // 1. Importar el componente Image

// --- TIPOS DE DATOS ---
interface TableCategory {
    id: string;
    name: string;
}
interface Table {
    id: string;
    tableNumber: string;
    status: 'available' | 'reserved' | 'occupied' | 'unavailable';
    category: TableCategory;
}

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

export function InteractiveTableMap({ eventId }: { eventId: string }) {
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await api.get(`/tables/event/${eventId}`);
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
        toast.success(`Has seleccionado la mesa ${table.tableNumber} (${table.category.name}).`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8 bg-zinc-900/50 rounded-lg">
                <Loader2 className="animate-spin text-white"/>
            </div>
        );
    }

    if (tables.length === 0) {
        return null;
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 my-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Reserva tu Mesa VIP</h2>
            <div className="relative w-full max-w-sm mx-auto">
                {/* --- 2. Reemplazar <img> por <Image /> --- */}
                <Image
                    src="/images/tables-map-bg.png"
                    alt="Mapa de mesas"
                    width={400}  // Ancho intrínseco de la imagen
                    height={600} // Alto intrínseco de la imagen
                    className="w-full h-auto"
                />
                
                {tables.map(table => (
                    <button
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`absolute flex items-center justify-center w-10 h-10 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 ${statusStyles[table.status]}`}
                        style={{
                            top: `${Math.random() * 80 + 10}%`,
                            left: `${Math.random() * 80 + 10}%`,
                        }}
                        title={`${table.category.name} ${table.tableNumber} - ${statusLabels[table.status]}`}
                    >
                        <span className="font-bold text-white">{table.tableNumber}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}