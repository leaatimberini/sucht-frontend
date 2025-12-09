// src/app/dashboard/tables/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Armchair, PlusCircle, Loader2, X, UserPlus, Trash2 } from 'lucide-react';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { Event } from '@/types/event.types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TableCategory, TableReservation } from '@/types/table.types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Carga el componente del mapa de forma dinámica, deshabilitando el renderizado en servidor (SSR)
const TableMapEditor = dynamic(() =>
    import('@/components/TableMapEditor').then(mod => mod.TableMapEditor),
    {
        ssr: false,
        loading: () => <div className="flex justify-center p-8"><Loader2 className="animate-spin text-pink-500" /></div>
    }
);

// --- Schemas de Validación ---
const categorySchema = z.object({ name: z.string().min(3, 'El nombre es requerido.') });
const tableSchema = z.object({ tableNumber: z.string().min(1, 'El número es requerido.'), categoryId: z.string().min(1, 'La categoría es requerida.') });

type CategoryFormInputs = z.infer<typeof categorySchema>;
type TableFormInputs = z.infer<typeof tableSchema>;

// --- Componente Principal de la Página ---
export default function ManageTablesPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [categories, setCategories] = useState<TableCategory[]>([]);
    const [reservations, setReservations] = useState<TableReservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados para los modales
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);

    // Formularios
    const categoryForm = useForm<CategoryFormInputs>({ resolver: zodResolver(categorySchema) });
    const tableForm = useForm<TableFormInputs>({ resolver: zodResolver(tableSchema) });

    // --- Lógica de Carga de Datos ---
    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [eventsRes, categoriesRes] = await Promise.all([
                api.get('/events/all-for-admin'),
                api.get('/tables/categories')
            ]);
            setEvents(eventsRes.data);
            setCategories(categoriesRes.data);
            if (eventsRes.data.length > 0 && !selectedEventId) {
                setSelectedEventId(eventsRes.data[0].id);
            }
        } catch (error) {
            toast.error("No se pudieron cargar los datos iniciales.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedEventId]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const fetchReservationsForEvent = useCallback(async (eventId: string) => {
        if (!eventId) {
            setReservations([]);
            return;
        };
        setIsLoading(true);
        try {
            const reservationsRes = await api.get(`/tables/reservations/event/${eventId}`);
            setReservations(reservationsRes.data);
        } catch (error) {
            toast.error(`No se pudieron cargar las reservas del evento.`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReservationsForEvent(selectedEventId);
    }, [selectedEventId, fetchReservationsForEvent]);

    // --- Lógica de Formularios ---
    const onCategorySubmit = async (data: CategoryFormInputs) => {
        try {
            await api.post('/tables/categories', data);
            toast.success(`Categoría "${data.name}" creada.`);
            setIsCategoryModalOpen(false);
            categoryForm.reset();
            fetchInitialData(); // Recargamos las categorías
        } catch (error) {
            toast.error("No se pudo crear la categoría.");
        }
    };

    const onTableSubmit = async (data: TableFormInputs) => {
        try {
            await api.post('/tables', { ...data, eventId: selectedEventId });
            toast.success(`Mesa "${data.tableNumber}" creada.`);
            setIsTableModalOpen(false);
            tableForm.reset();
            // Forzamos la recarga del editor de mapa cambiando su key
            setSelectedEventId(current => current);
        } catch (error) {
            toast.error("No se pudo crear la mesa.");
        }
    };

    const handleDeleteReservation = async (reservation: TableReservation) => {
        if (!confirm(`¿Estás seguro de eliminar la reserva de ${reservation.clientName}? \n\nSi hubo un pago online, recuerda realizar el reembolso manualmente en MercadoPago si corresponde.`)) {
            return;
        }

        try {
            await api.delete(`/tables/reservations/${reservation.id}`);
            toast.success('Reserva eliminada. La mesa ha sido liberada.');
            fetchReservationsForEvent(selectedEventId);
            // Force map refresh
            setSelectedEventId(current => current);
        } catch (error) {
            toast.error('Error al eliminar la reserva.');
        }
    };

    return (
        <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.ORGANIZER]}>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Armchair className="text-pink-400" /> Gestión de Mesas</h1>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        <div className="w-full sm:w-auto">
                            <label htmlFor="event-select" className="text-sm font-medium text-zinc-400">Seleccionar Evento:</label>
                            <select id="event-select" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="w-full mt-1 bg-zinc-800 rounded-md p-2">
                                {events.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => setIsCategoryModalOpen(true)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"><PlusCircle size={18} /> Nueva Categoría</button>
                            <button onClick={() => setIsTableModalOpen(true)} disabled={!selectedEventId} className="flex-1 bg-pink-600 hover:bg-pink-700 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"><PlusCircle size={18} /> Nueva Mesa</button>
                        </div>
                    </div>

                    {selectedEventId && (
                        <DndProvider backend={HTML5Backend}>
                            <TableMapEditor
                                key={selectedEventId}
                                eventId={selectedEventId}

                                onDataChange={() => fetchReservationsForEvent(selectedEventId)}
                            />
                        </DndProvider>
                    )}
                </div>

                {/* HISTORIAL DE RESERVAS */}
                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-white mb-4">Historial de Reservas</h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-zinc-700">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-white">Mesa</th>
                                    <th className="p-4 text-sm font-semibold text-white">Cliente</th>
                                    <th className="p-4 text-sm font-semibold text-white">Pago</th>
                                    <th className="p-4 text-sm font-semibold text-white">Invitados</th>
                                    <th className="p-4 text-sm font-semibold text-white">Reservado por</th>
                                    <th className="p-4 text-sm font-semibold text-white text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={6} className="text-center p-6"><Loader2 className="animate-spin mx-auto" /></td></tr>
                                ) : reservations.map(res => (
                                    <tr key={res.id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-4"><p className="font-semibold text-white">{res.table.tableNumber}</p><p className="text-sm text-zinc-400">{res.table.category.name}</p></td>
                                        <td className="p-4"><p className="font-semibold text-zinc-200">{res.clientName}</p><p className="text-sm text-zinc-500">{res.clientEmail}</p></td>
                                        <td className="p-4">
                                            {res.paymentType === 'gift' ? (
                                                <div>
                                                    <p className="font-bold text-pink-500 text-xs uppercase bg-pink-500/10 px-2 py-1 rounded inline-block">100% Bonificado</p>
                                                    <p className="text-xs text-zinc-500 mt-1">Regalo</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className={`font-mono font-semibold ${Number(res.amountPaid) >= Number(res.totalPrice) ? 'text-green-400' : 'text-amber-400'}`}>
                                                        ${Number(res.amountPaid || 0).toFixed(0)} / ${Number(res.totalPrice || 0).toFixed(0)}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-zinc-400 capitalize bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">{res.paymentType === 'deposit' ? 'Seña' : 'Total'}</span>
                                                        {Number(res.amountPaid) >= Number(res.totalPrice) && <span className="text-[10px] text-green-500 font-bold border border-green-500/30 px-1 rounded">PAGADO</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center font-bold text-white">{res.guestCount}</td>
                                        <td className="p-4 text-zinc-300 text-sm">{res.reservedByUser.name}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteReservation(res)}
                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-colors"
                                                title="Eliminar Reserva y Liberar Mesa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {reservations.length === 0 && !isLoading && (
                                    <tr><td colSpan={5} className="text-center p-6 text-zinc-500">No hay reservas para este evento.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODALES */}
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Crear Nueva Categoría</h3>
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <div>
                                <label htmlFor="cat-name" className="block text-sm font-medium text-zinc-300">Nombre</label>
                                <input id="cat-name" {...categoryForm.register('name')} className="mt-1 w-full bg-zinc-800 rounded-md p-2" placeholder="Ej: VIP Cabina" />
                                {categoryForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{categoryForm.formState.errors.name.message}</p>}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="bg-zinc-700 hover:bg-zinc-600 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={categoryForm.formState.isSubmitting} className="bg-pink-600 hover:bg-pink-700 font-bold py-2 px-4 rounded-lg">Guardar</button>
                            </div>
                        </form>
                    </div>
                )}
                {isTableModalOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <form onSubmit={tableForm.handleSubmit(onTableSubmit)} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Añadir Nueva Mesa</h3>
                                <button type="button" onClick={() => setIsTableModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="table-num" className="block text-sm font-medium text-zinc-300">Número</label>
                                    <input id="table-num" {...tableForm.register('tableNumber')} className="mt-1 w-full bg-zinc-800 rounded-md p-2" placeholder="Ej: 07" />
                                    {tableForm.formState.errors.tableNumber && <p className="text-red-500 text-xs mt-1">{tableForm.formState.errors.tableNumber.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="table-cat" className="block text-sm font-medium text-zinc-300">Categoría</label>
                                    <select id="table-cat" {...tableForm.register('categoryId')} className="mt-1 w-full bg-zinc-800 rounded-md p-2">
                                        <option value="">Seleccionar...</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                    {tableForm.formState.errors.categoryId && <p className="text-red-500 text-xs mt-1">{tableForm.formState.errors.categoryId.message}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsTableModalOpen(false)} className="bg-zinc-700 hover:bg-zinc-600 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={tableForm.formState.isSubmitting} className="bg-pink-600 hover:bg-pink-700 font-bold py-2 px-4 rounded-lg">Guardar</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthCheck>
    );
}
