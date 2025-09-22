'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import type { Table } from '@/types/table.types';
import { TicketTier, ProductType } from '@/types/ticket.types';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

const statusStyles: { [key: string]: string } = {
    available: 'bg-green-500/30 border-green-500 hover:bg-green-500/50',
    reserved: 'bg-red-500/30 border-red-500 cursor-not-allowed',
    occupied: 'bg-amber-500/30 border-amber-500 cursor-not-allowed',
    unavailable: 'bg-zinc-700/30 border-zinc-700 cursor-not-allowed',
};

const statusLabels: { [key: string]: string } = {
    available: 'Disponible',
    reserved: 'Reservada',
    occupied: 'Ocupada',
    unavailable: 'No disponible',
};

type EnrichedTable = Table & {
    price?: number;
    allowPartialPayment?: boolean;
    partialPaymentPrice?: number | null;
    tierId?: string;
    tierName?: string;
    capacity?: number | null;
};

export function TableReservationModal({ eventId, onClose }: { eventId: string; onClose: () => void; }) {
    const [tables, setTables] = useState<Table[]>([]);
    const [vipTiers, setVipTiers] = useState<TicketTier[]>([]);
    const [selectedTable, setSelectedTable] = useState<EnrichedTable | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [tablesRes, tiersRes] = await Promise.all([
                    api.get(`/tables/event/${eventId}`),
                    api.get(`/events/${eventId}/ticket-tiers/vip-tables`) 
                ]);
                setTables(tablesRes.data);
                setVipTiers(tiersRes.data);
            } catch (error) {
                toast.error("No se pudieron cargar las mesas disponibles.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [eventId]);
    
    const enrichedTables: EnrichedTable[] = useMemo(() => {
        if (!tables || !vipTiers) return [];
        
        return tables.map(table => {
            // FIX: Comparamos los números de mesa como NÚMEROS en lugar de texto.
            // Esto soluciona el problema de '1' vs '01'.
            const tableNum = parseInt(String(table.tableNumber).trim(), 10);
            const correspondingTier = vipTiers.find(tier => tier.tableNumber === tableNum);
            
            return {
                ...table,
                price: correspondingTier?.price,
                allowPartialPayment: correspondingTier?.allowPartialPayment,
                partialPaymentPrice: correspondingTier?.partialPaymentPrice,
                tierId: correspondingTier?.id,
                tierName: correspondingTier?.name,
                capacity: correspondingTier?.capacity,
            };
        });
    }, [tables, vipTiers]);

    const handleTableClick = (table: EnrichedTable) => {
        if (table.status !== 'available') {
            toast.error(`La mesa ${table.tableNumber} no está disponible.`);
            return;
        }
        if (!table.tierId || typeof table.price !== 'number') {
            toast.error(`La mesa ${table.tableNumber} no está a la venta en este momento.`);
            return;
        }
        setSelectedTable(table);
    };

    const handleConfirmReservation = async (paymentType: 'full' | 'partial') => {
        if (!selectedTable || !user || !selectedTable.tierId) {
            toast.error("Debes iniciar sesión para reservar.");
            return;
        }

        toast.loading('Redirigiendo a Mercado Pago...');
        try {
            const payload = { eventId, ticketTierId: selectedTable.tierId, quantity: 1, paymentType };
            const res = await api.post('/payments/create-preference', payload);
            router.push(res.data.init_point);
        } catch (error) {
            toast.dismiss();
            toast.error("No se pudo iniciar el proceso de pago.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400 hover:text-white z-10"><X size={24} /></button>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Reserva tu Mesa VIP</h2>
                    {isLoading ? (
                        <div className="h-96 flex justify-center items-center"><Loader2 className="animate-spin text-white"/></div>
                    ) : (
                        <div className="relative w-full max-w-sm mx-auto">
                            <Image src="/images/tables-map-bg.png" alt="Mapa de mesas" width={512} height={768} className="w-full h-auto"/>
                            {enrichedTables.map(table => (
                                <button key={table.id} onClick={() => handleTableClick(table)}
                                    className={`absolute flex items-center justify-center w-8 h-8 rounded-md border-2 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 group ${statusStyles[table.status]}`}
                                    style={{ top: `${table.positionY}%`, left: `${table.positionX}%` }}
                                    title={`${table.category.name} ${table.tableNumber} - ${statusLabels[table.status]}`}
                                >
                                    <span className="font-bold text-white text-sm">{table.tableNumber}</span>
                                    {table.status === 'available' && table.price !== undefined && (
                                        <div className="absolute bottom-full mb-2 w-auto p-2 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            ${new Intl.NumberFormat('es-AR').format(table.price)}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedTable && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-sm w-full space-y-4 border border-zinc-700">
                        <h3 className="text-xl font-bold text-white">Confirmar Mesa {selectedTable.tableNumber}</h3>
                        <p className="text-zinc-300">Estás por reservar la <span className="font-bold">{selectedTable.tierName || selectedTable.category.name}</span>.</p>
                        <p className="text-lg font-bold text-pink-400">Precio Total: ${new Intl.NumberFormat('es-AR').format(selectedTable.price!)}</p>
                        <div className="space-y-2">
                            <button onClick={() => handleConfirmReservation('full')} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg">Pagar Total</button>
                            {selectedTable.allowPartialPayment && selectedTable.partialPaymentPrice && (
                                <button onClick={() => handleConfirmReservation('partial')} className="w-full bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg">Pagar Seña (${new Intl.NumberFormat('es-AR').format(selectedTable.partialPaymentPrice)})</button>
                            )}
                        </div>
                        <button onClick={() => setSelectedTable(null)} className="w-full text-zinc-400 hover:text-white mt-2 text-sm">Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
}