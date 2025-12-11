'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Loader2, X, Users } from 'lucide-react';
import Image from 'next/image';
import type { Table } from '@/types/table.types';
import { TicketTier } from '@/types/ticket.types';
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
                    api.get(`/tables/public/event/${eventId}`),
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
        if (isLoading || !tables || !vipTiers) return [];

        return tables.map(table => {
            const tableNum = parseInt(String(table.tableNumber).trim(), 10);

            // LOGIC UPDATE: Find Tier by Table Number OR Category
            let correspondingTier = vipTiers.find(tier => tier.tableNumber === tableNum);

            if (!correspondingTier) {
                // Fallback: Check for Category-based Tier
                correspondingTier = vipTiers.find(tier => tier.tableCategoryId === table.category?.id);
            }

            // FIX: Convertimos explícitamente los precios de string a number.
            const priceAsNumber = correspondingTier ? parseFloat(String(correspondingTier.price)) : undefined;
            const partialPriceAsNumber = correspondingTier?.partialPaymentPrice ? parseFloat(String(correspondingTier.partialPaymentPrice)) : null;

            return {
                ...table,
                price: priceAsNumber,
                allowPartialPayment: correspondingTier?.allowPartialPayment,
                partialPaymentPrice: partialPriceAsNumber,
                tierId: correspondingTier?.id,
                tierName: correspondingTier?.name,
                capacity: correspondingTier?.capacity,
            };
        });
    }, [tables, vipTiers, isLoading]);

    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [pendingPaymentType, setPendingPaymentType] = useState<'full' | 'partial' | null>(null);

    const handleTableClick = (table: EnrichedTable) => {
        if (table.status !== 'available') {
            toast.error(`La mesa ${table.tableNumber} no está disponible.`);
            return;
        }

        if (!table.tierId || typeof table.price !== 'number') {
            toast.error(`La mesa ${table.tableNumber} no está a la venta en este momento (Sin precio definido).`);
            return;
        }
        setSelectedTable(table);
    };

    const initiateReservation = (paymentType: 'full' | 'partial') => {
        if (!selectedTable || !user || !selectedTable.tierId) {
            toast.error("Debes iniciar sesión para reservar.");
            return;
        }
        setPendingPaymentType(paymentType);
        setShowDisclaimer(true);
    };

    const proceedToPayment = async () => {
        if (!selectedTable || !pendingPaymentType) return;

        setShowDisclaimer(false);
        toast.loading('Redirigiendo a Mercado Pago...');
        try {
            const payload = { eventId, ticketTierId: selectedTable.tierId, quantity: 1, paymentType: pendingPaymentType };
            const res = await api.post('/payments/create-preference', payload);

            if (res.data.type === 'free') {
                toast.success("¡Reserva confirmada con éxito!");
                router.push('/mi-cuenta/entradas');
            } else if (res.data.init_point) {
                router.push(res.data.init_point);
            } else {
                throw new Error("Respuesta inválida del servidor");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("No se pudo iniciar el proceso de pago.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white z-20 bg-black/50 rounded-full p-1"><X size={24} /></button>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center font-heading tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                        Reserva tu Mesa VIP
                    </h2>
                    {isLoading ? (
                        <div className="h-96 flex justify-center items-center"><Loader2 className="animate-spin text-white" /></div>
                    ) : (
                        <div className="relative w-full max-w-sm mx-auto aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl shadow-pink-900/20 border border-pink-500/20">
                            <Image
                                src="/images/map-3d.png"
                                alt="Mapa 3D"
                                fill
                                className="object-contain"
                            />
                            {enrichedTables.map(table => {
                                const isAvailable = table.status === 'available';
                                const hasPrice = table.price !== undefined;

                                return (
                                    <button key={table.id} onClick={() => handleTableClick(table)}
                                        className={`absolute flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 
                                            ${isAvailable && hasPrice
                                                ? 'bg-gradient-to-br from-green-400 to-emerald-600 hover:scale-125 hover:shadow-[0_0_15px_rgba(74,222,128,0.8)] border border-white/50 cursor-pointer'
                                                : table.status === 'occupied'
                                                    ? 'bg-zinc-900/80 border border-zinc-600 text-zinc-500 cursor-not-allowed'
                                                    : 'bg-red-600/80 border border-red-400 text-white/50 cursor-not-allowed'
                                            }
                                            shadow-[0_4px_10px_rgba(0,0,0,0.5)] group
                                        `}
                                        style={{ top: `${table.positionY}%`, left: `${table.positionX}%` }}
                                        title={`${table.category.name} ${table.tableNumber} - ${statusLabels[table.status]}`}
                                    >
                                        <span className="font-bold text-white text-[10px]">{table.tableNumber}</span>
                                        {/* Tooltip de Precio */}
                                        {isAvailable && hasPrice && (
                                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] font-bold rounded border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                ${new Intl.NumberFormat('es-AR').format(table.price!)}
                                            </div>
                                        )}

                                        {/* Glow Effect for Available Tables */}
                                        {isAvailable && hasPrice && (
                                            <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20 duration-1000"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {selectedTable && !showDisclaimer && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-sm w-full space-y-4 border border-zinc-700">
                        <h3 className="text-xl font-bold text-white">Confirmar Mesa {selectedTable.tableNumber}</h3>
                        <p className="text-zinc-300">Estás por reservar la <span className="font-bold">{selectedTable.tierName || selectedTable.category.name}</span>.</p>
                        {selectedTable.capacity ? (
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-zinc-400 flex items-center gap-2"><Users size={18} /> Capacidad:</span>
                                <span className="font-bold text-white">{selectedTable.capacity} personas</span>
                            </div>
                        ) : null}
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-zinc-400">Precio Total:</span>
                            <span className="font-bold text-pink-400">${new Intl.NumberFormat('es-AR').format(selectedTable.price!)}</span>
                        </div>
                        <div className="border-t border-zinc-700 pt-4 space-y-2">
                            <button onClick={() => initiateReservation('full')} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg text-base">Pagar Total</button>
                            {selectedTable.allowPartialPayment && selectedTable.partialPaymentPrice && (
                                <button onClick={() => initiateReservation('partial')} className="w-full bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg">Pagar Seña (${new Intl.NumberFormat('es-AR').format(selectedTable.partialPaymentPrice)})</button>
                            )}
                        </div>
                        <button onClick={() => setSelectedTable(null)} className="w-full text-zinc-400 hover:text-white mt-2 text-sm">Cancelar</button>
                    </div>
                </div>
            )}

            {showDisclaimer && (
                <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-6 max-w-sm w-full space-y-6 shadow-2xl relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-red-500"></div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-red-500">⚠️</span> IMPORTANTE
                            </h3>
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                Las señas o pagos para mesas VIP <strong>NO SON REEMBOLSABLES</strong>, salvo en caso de cancelación oficial del evento.
                            </p>
                            <p className="text-zinc-400 text-xs italic mt-2">
                                Al continuar, confirmas que aceptas la política de no reembolso.
                            </p>
                        </div>

                        <div className="pt-2 flex flex-col gap-3">
                            <button
                                onClick={proceedToPayment}
                                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-red-900/20 transform active:scale-95 transition-all"
                            >
                                ACEPTAR Y PAGAR
                            </button>
                            <button
                                onClick={() => setShowDisclaimer(false)}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2 px-4 rounded-lg"
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}