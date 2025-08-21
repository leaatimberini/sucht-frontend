'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Armchair, PlusCircle, Loader2, Save, X, UserPlus, DollarSign } from 'lucide-react';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { Event } from '@/types/event.types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import type { ConnectDragSource, ConnectDropTarget, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Image from 'next/image';

// --- TIPOS DE DATOS ---
interface TableCategory { id: string; name: string; }
interface Table {
    id: string;
    tableNumber: string;
    status: 'available' | 'reserved' | 'occupied' | 'unavailable';
    category: TableCategory;
    positionX: number | null;
    positionY: number | null;
}
interface TableReservation {
    id: string;
    clientName: string;
    clientEmail: string | null;
    guestCount: number;
    amountPaid: number;
    totalPrice: number;
    paymentType: string;
    reservedByUser: { name: string };
    table: { tableNumber: string, category: { name: string } };
    ticket: { status: string };
}
interface DragItem { id: string; }

// --- SCHEMAS ---
const categorySchema = z.object({ name: z.string().min(3, 'El nombre es requerido.') });
const tableSchema = z.object({ tableNumber: z.string().min(1, 'El número es requerido.'), categoryId: z.string().min(1, 'La categoría es requerida.') });
const manualReservationSchema = z.object({
    clientName: z.string().min(3, 'El nombre del cliente es requerido.'),
    clientEmail: z.string().email('Debe ser un email válido.').optional().or(z.literal('')),
    guestCount: z.coerce.number().min(1, 'Debe ser al menos 1.'),
    amountPaid: z.coerce.number().min(0),
    paymentType: z.enum(['full', 'deposit', 'gift']),
});

type CategoryFormInputs = z.infer<typeof categorySchema>;
type TableFormInputs = z.infer<typeof tableSchema>;
type ManualReservationInputs = z.infer<typeof manualReservationSchema>;

// --- COMPONENTES DE LA PÁGINA ---

const DraggableTable = ({ table, onClick }: { table: Table; onClick: () => void; }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'table',
        item: { id: table.id } as DragItem,
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));
    drag(ref);

    const statusClasses = {
        available: 'border-green-500 bg-green-500/20 hover:bg-green-500/40',
        reserved: 'border-red-500 bg-red-500/20 cursor-not-allowed',
        occupied: 'border-amber-500 bg-amber-500/20 cursor-pointer',
        unavailable: 'border-zinc-600 bg-zinc-800/50 cursor-pointer',
    };

    return (
        <button
            onClick={onClick}
            ref={ref as React.Ref<HTMLButtonElement>}
            className={`absolute p-2 border-2 rounded-lg flex flex-col items-center justify-center transition-all text-center ${statusClasses[table.status]}`}
            style={{
                left: `calc(${table.positionX || 50}% - 30px)`,
                top: `calc(${table.positionY || 50}% - 30px)`,
                opacity: isDragging ? 0.5 : 1,
                width: '60px',
                height: '60px'
            }}
            title={`${table.category.name} ${table.tableNumber}`}
        >
            <span className="font-bold text-lg text-white">{table.tableNumber}</span>
            <span className="text-xs text-zinc-400 leading-tight">{table.category.name}</span>
        </button>
    );
};


export default function ManageTablesPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [tables, setTables] = useState<Table[]>([]);
    const [categories, setCategories] = useState<TableCategory[]>([]);
    const [reservations, setReservations] = useState<TableReservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

    const categoryForm = useForm<CategoryFormInputs>({ resolver: zodResolver(categorySchema) });
    const tableForm = useForm<TableFormInputs>({ resolver: zodResolver(tableSchema) });
    const reservationForm = useForm({ resolver: zodResolver(manualReservationSchema) });

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [eventsRes, categoriesRes] = await Promise.all([
                api.get('/events/all-for-admin'),
                api.get('/tables/categories')
            ]);
            setEvents(eventsRes.data);
            setCategories(categoriesRes.data);
            if (eventsRes.data.length > 0) {
                setSelectedEventId(eventsRes.data[0].id);
            }
        } catch (error) {
            toast.error("No se pudieron cargar los datos iniciales.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const fetchEventData = useCallback(async (eventId: string) => {
        if (!eventId) {
            setTables([]);
            setReservations([]);
            return;
        };
        setIsLoading(true);
        try {
            const [tablesRes, reservationsRes] = await Promise.all([
                api.get(`/tables/event/${eventId}`),
                api.get(`/tables/reservations/event/${eventId}`)
            ]);
            setTables(tablesRes.data);
            setReservations(reservationsRes.data);
        } catch (error) {
            toast.error(`No se pudieron cargar los datos del evento.`);
        } finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchEventData(selectedEventId);
    }, [selectedEventId, fetchEventData]);

    const onCategorySubmit = async (data: CategoryFormInputs) => {
        try {
            await api.post('/tables/categories', data);
            toast.success(`Categoría "${data.name}" creada.`);
            setIsCategoryModalOpen(false);
            categoryForm.reset();
            fetchInitialData();
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
            fetchEventData(selectedEventId);
        } catch (error) {
            toast.error("No se pudo crear la mesa.");
        }
    };

    const onManualReservationSubmit = async (data: ManualReservationInputs) => {
        if(!selectedTable) return;
        try {
            await api.post('/tables/reservations/manual', {
                ...data,
                tableId: selectedTable.id,
                eventId: selectedEventId,
            });
            toast.success(`Reserva manual para la mesa ${selectedTable.tableNumber} creada.`);
            setIsReservationModalOpen(false);
            reservationForm.reset();
            setSelectedTable(null);
            fetchEventData(selectedEventId);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'No se pudo crear la reserva.');
        }
    };

    const handleUpdateStatus = async (status: Table['status']) => {
        if (!selectedTable) return;
        try {
            await api.patch(`/tables/${selectedTable.id}/status`, { status });
            toast.success(`Estado de la mesa ${selectedTable.tableNumber} actualizado.`);
            setSelectedTable(null);
            fetchEventData(selectedEventId);
        } catch (error) {
            toast.error('No se pudo actualizar el estado.');
        }
    };
    
    const handleTableDrop = useCallback((tableId: string, x: number, y: number) => {
        setTables(prevTables =>
            prevTables.map(t =>
                t.id === tableId ? { ...t, positionX: x, positionY: y } : t
            )
        );
    }, []);
    
    const handleSaveChanges = async () => {
        toast.loading('Guardando posiciones...');
        try {
            const updatePromises = tables.map(table =>
                api.patch(`/tables/${table.id}/position`, {
                    positionX: table.positionX,
                    positionY: table.positionY,
                })
            );
            await Promise.all(updatePromises);
            toast.dismiss();
            toast.success('¡Posiciones guardadas con éxito!');
        } catch (error) {
            toast.dismiss();
            toast.error('No se pudieron guardar las posiciones.');
        }
    };

    const [, drop] = useDrop(() => ({
        accept: 'table',
        drop(item: unknown, monitor: DropTargetMonitor) {
            const map = document.getElementById("map-container");
            const draggedItem = item as DragItem;
            if (!map || !draggedItem.id) return;

            const mapRect = map.getBoundingClientRect();
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const newXPercent = ((clientOffset.x - mapRect.left) / mapRect.width) * 100;
            const newYPercent = ((clientOffset.y - mapRect.top) / mapRect.height) * 100;

            handleTableDrop(draggedItem.id, newXPercent, newYPercent);
        },
    }));

    return (
        <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.ORGANIZER]}>
            <DndProvider backend={HTML5Backend}>
                <div className="space-y-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Armchair className="text-pink-400"/> Gestión de Mesas</h1>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                            <div className="w-full sm:w-auto">
                                <label htmlFor="event-select" className="text-sm font-medium text-zinc-400">Mostrando mesas para el evento:</label>
                                <select id="event-select" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="w-full mt-1 bg-zinc-800 rounded-md p-2">
                                    {events.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => setIsCategoryModalOpen(true)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"><PlusCircle size={18}/> Nueva Categoría</button>
                                <button onClick={() => setIsTableModalOpen(true)} disabled={!selectedEventId} className="flex-1 bg-pink-600 hover:bg-pink-700 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"><PlusCircle size={18}/> Nueva Mesa</button>
                            </div>
                        </div>

                        {isLoading ? <Loader2 className="animate-spin mx-auto"/> : (
                            <>
                                <div id="map-container" ref={drop as unknown as React.Ref<HTMLDivElement>} className="relative w-full max-w-lg mx-auto my-8 border-2 border-dashed border-zinc-700 rounded-lg bg-black/20">
                                    <Image src="/images/tables-map-bg.png" alt="Mapa de mesas" width={512} height={768} className="w-full h-auto opacity-30"/>
                                    {tables.map(table => (
                                        <DraggableTable key={table.id} table={table} onClick={() => setSelectedTable(table)} />
                                    ))}
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                        <Save size={18}/> Guardar Posiciones
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="text-center p-6"><Loader2 className="animate-spin mx-auto"/></td></tr>
                                    ) : reservations.map(res => (
                                        <tr key={res.id} className="border-b border-zinc-800 last:border-b-0">
                                            <td className="p-4"><p className="font-semibold text-white">{res.table.tableNumber}</p><p className="text-sm text-zinc-400">{res.table.category.name}</p></td>
                                            <td className="p-4"><p className="font-semibold text-zinc-200">{res.clientName}</p><p className="text-sm text-zinc-500">{res.clientEmail}</p></td>
                                            <td className="p-4">
                                                <p className="font-semibold text-green-400">${res.amountPaid.toFixed(2)} / ${res.totalPrice.toFixed(2)}</p>
                                                <p className="text-sm text-zinc-400 capitalize">{res.paymentType}</p>
                                            </td>
                                            <td className="p-4 text-center font-bold text-white">{res.guestCount}</td>
                                            <td className="p-4 text-zinc-300">{res.reservedByUser.name}</td>
                                        </tr>
                                    ))}
                                    {reservations.length === 0 && !isLoading && (
                                        <tr><td colSpan={5} className="text-center p-6 text-zinc-500">No hay reservas para este evento.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- MODALES --- */}
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm space-y-4">
                            <h3 className="text-xl font-bold text-white">Crear Nueva Categoría</h3>
                            <div>
                                <label htmlFor="cat-name" className="block text-sm font-medium text-zinc-300">Nombre</label>
                                <input id="cat-name" {...categoryForm.register('name')} className="mt-1 w-full bg-zinc-800 rounded-md p-2" placeholder="Ej: VIP Cabina"/>
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
                            <h3 className="text-xl font-bold text-white">Añadir Nueva Mesa</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="table-num" className="block text-sm font-medium text-zinc-300">Número</label>
                                    <input id="table-num" {...tableForm.register('tableNumber')} className="mt-1 w-full bg-zinc-800 rounded-md p-2" placeholder="Ej: 07"/>
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
                {selectedTable && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm space-y-4">
                            <h3 className="text-xl font-bold text-white">Mesa {selectedTable.tableNumber} <span className="text-base font-normal text-zinc-400">({selectedTable.category.name})</span></h3>
                            <div className="space-y-2">
                                <button onClick={() => { setIsReservationModalOpen(true) }} className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md flex items-center gap-3 disabled:opacity-50" disabled={selectedTable.status !== 'available'}>
                                    <UserPlus/> Registrar Venta Manual
                                </button>
                                <button onClick={() => handleUpdateStatus('available')} className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md">Marcar como Disponible</button>
                                <button onClick={() => handleUpdateStatus('occupied')} className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md">Marcar como Ocupada</button>
                                <button onClick={() => handleUpdateStatus('unavailable')} className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md">Marcar como No Disponible</button>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button onClick={() => setSelectedTable(null)} className="bg-zinc-700 hover:bg-zinc-600 font-bold py-2 px-4 rounded-lg">Cerrar</button>
                            </div>
                        </div>
                    </div>
                )}
                {isReservationModalOpen && selectedTable && (
                     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                         <form onSubmit={reservationForm.handleSubmit(onManualReservationSubmit)} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md space-y-4">
                            <h3 className="text-xl font-bold text-white">Registrar Venta para Mesa {selectedTable.tableNumber}</h3>
                            <input type="hidden" value={selectedTable.id} />
                            <div>
                                <label htmlFor="clientName" className="block text-sm font-medium text-zinc-300">Nombre del Cliente</label>
                                <input id="clientName" {...reservationForm.register('clientName')} className="mt-1 w-full bg-zinc-800 rounded-md p-2"/>
                                {reservationForm.formState.errors.clientName && <p className="text-red-500 text-xs mt-1">{reservationForm.formState.errors.clientName.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="clientEmail" className="block text-sm font-medium text-zinc-300">Email (para enviar QR)</label>
                                <input id="clientEmail" {...reservationForm.register('clientEmail')} className="mt-1 w-full bg-zinc-800 rounded-md p-2"/>
                                {reservationForm.formState.errors.clientEmail && <p className="text-red-500 text-xs mt-1">{reservationForm.formState.errors.clientEmail.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="guestCount" className="block text-sm font-medium text-zinc-300">Nº de Invitados</label>
                                    <input id="guestCount" type="number" {...reservationForm.register('guestCount')} className="mt-1 w-full bg-zinc-800 rounded-md p-2"/>
                                    {reservationForm.formState.errors.guestCount && <p className="text-red-500 text-xs mt-1">{reservationForm.formState.errors.guestCount.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="paymentType" className="block text-sm font-medium text-zinc-300">Tipo de Pago</label>
                                    <select id="paymentType" {...reservationForm.register('paymentType')} className="mt-1 w-full bg-zinc-800 rounded-md p-2">
                                        <option value="deposit">Seña</option>
                                        <option value="full">Pago Total</option>
                                        <option value="gift">Regalo (Sin Cargo)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="amountPaid" className="block text-sm font-medium text-zinc-300">Monto Pagado</label>
                                <input id="amountPaid" type="number" {...reservationForm.register('amountPaid')} className="mt-1 w-full bg-zinc-800 rounded-md p-2"/>
                                {reservationForm.formState.errors.amountPaid && <p className="text-red-500 text-xs mt-1">{reservationForm.formState.errors.amountPaid.message}</p>}
                            </div>
                             <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsReservationModalOpen(false)} className="bg-zinc-700 hover:bg-zinc-600 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                                <button type="submit" disabled={reservationForm.formState.isSubmitting} className="bg-pink-600 hover:bg-pink-700 font-bold py-2 px-4 rounded-lg">Confirmar Reserva</button>
                            </div>
                         </form>
                     </div>
                )}
            </DndProvider>
        </AuthCheck>
    );
}