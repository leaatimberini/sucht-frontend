'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Armchair, PlusCircle, Loader2 } from 'lucide-react';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { Event } from '@/types/event.types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// --- TIPOS DE DATOS ---
interface TableCategory {
    id: string;
    name: string;
}

interface Table {
    id: string;
    tableNumber: string;
    status: string;
    category: TableCategory;
}

// --- SCHEMAS DE VALIDACIÓN ---
const categorySchema = z.object({
    name: z.string().min(3, 'El nombre es requerido.'),
});
type CategoryFormInputs = z.infer<typeof categorySchema>;

const tableSchema = z.object({
    tableNumber: z.string().min(1, 'El número es requerido.'),
    categoryId: z.string().min(1, 'La categoría es requerida.'),
});
type TableFormInputs = z.infer<typeof tableSchema>;


export default function ManageTablesPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [tables, setTables] = useState<Table[]>([]);
    const [categories, setCategories] = useState<TableCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados para los modales
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);

    // Formularios
    const categoryForm = useForm<CategoryFormInputs>({ resolver: zodResolver(categorySchema) });
    const tableForm = useForm<TableFormInputs>({ resolver: zodResolver(tableSchema) });

    // --- Carga de datos ---
    const fetchData = useCallback(async () => {
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
        fetchData();
    }, [fetchData]);

    const fetchTablesForEvent = useCallback(async (eventId: string) => {
        if (!eventId) {
            setTables([]);
            return;
        };
        setIsLoading(true);
        try {
            const response = await api.get(`/tables/event/${eventId}`);
            setTables(response.data);
        } catch (error) {
            toast.error(`No se pudieron cargar las mesas para el evento.`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTablesForEvent(selectedEventId);
    }, [selectedEventId, fetchTablesForEvent]);


    // --- Lógica de Formularios ---
    const onCategorySubmit = async (data: CategoryFormInputs) => {
        try {
            await api.post('/tables/categories', data);
            toast.success(`Categoría "${data.name}" creada.`);
            setIsCategoryModalOpen(false);
            categoryForm.reset();
            fetchData(); // Recargamos todo
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
            fetchTablesForEvent(selectedEventId);
        } catch (error) {
            toast.error("No se pudo crear la mesa.");
        }
    };

    return (
        <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER]}>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Armchair className="text-pink-400"/> Gestión de Mesas</h1>

                {/* --- SECCIÓN PRINCIPAL DE GESTIÓN --- */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                        {/* Selector de Eventos */}
                        <div className="w-full sm:w-auto">
                            <label htmlFor="event-select" className="text-sm font-medium text-zinc-400">Mostrando mesas para el evento:</label>
                            <select id="event-select" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="w-full mt-1 bg-zinc-800 rounded-md p-2">
                                {events.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}
                            </select>
                        </div>
                        {/* Botones de Acción */}
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => setIsCategoryModalOpen(true)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                                <PlusCircle size={18}/> Nueva Categoría
                            </button>
                            <button onClick={() => setIsTableModalOpen(true)} disabled={!selectedEventId} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                                <PlusCircle size={18}/> Nueva Mesa
                            </button>
                        </div>
                    </div>

                    {/* Lista de Mesas */}
                    {isLoading ? <Loader2 className="animate-spin mx-auto"/> : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {tables.map(table => (
                                <div key={table.id} className="p-4 border rounded-md text-center" style={{ borderColor: table.status === 'available' ? '#52525b' : '#a16207' }}>
                                    <p className="font-bold text-lg text-white">{table.tableNumber}</p>
                                    <p className="text-xs text-zinc-400">{table.category.name}</p>
                                </div>
                            ))}
                            {tables.length === 0 && <p className="col-span-full text-center text-zinc-500 py-8">No hay mesas configuradas para este evento.</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALES --- */}
            {isCategoryModalOpen && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                     <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm space-y-4">
                         <h3 className="text-xl font-bold text-white">Crear Nueva Categoría</h3>
                         <div>
                             <label htmlFor="cat-name" className="block text-sm font-medium text-zinc-300">Nombre de la Categoría</label>
                             <input id="cat-name" {...categoryForm.register('name')} className="mt-1 w-full bg-zinc-800 rounded-md p-2" placeholder="Ej: VIP Cabina"/>
                             {categoryForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{categoryForm.formState.errors.name.message}</p>}
                         </div>
                         <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
                            <button type="submit" disabled={categoryForm.formState.isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg">Guardar</button>
                         </div>
                     </form>
                 </div>
            )}
            {isTableModalOpen && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
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
                            <button type="button" onClick={() => setIsTableModalOpen(false)} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
                            <button type="submit" disabled={tableForm.formState.isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg">Guardar</button>
                         </div>
                     </form>
                 </div>
            )}
        </AuthCheck>
    );
}