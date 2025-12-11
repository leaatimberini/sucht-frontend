// src/components/TableMapEditor.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Image from 'next/image';
import { Loader2, Save, UserPlus, X, Banknote, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Table } from '@/types/table.types';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

// --- TIPOS Y SCHEMAS ---
interface DragItem { id: string; }
const manualReservationSchema = z.object({
  clientName: z.string().min(3, 'El nombre es requerido.'),
  clientEmail: z.string().email('Debe ser un email válido.').optional().or(z.literal('')),
  guestCount: z.coerce.number().min(1, 'Debe ser al menos 1.'),
  amountPaid: z.coerce.number().min(0),
  paymentType: z.enum(['full', 'deposit', 'gift']),
  ticketTierId: z.string().optional(), // Nuevo campo
});
type ManualReservationInputs = z.infer<typeof manualReservationSchema>;

// --- SUB-COMPONENTE DRAGGABLETABLE ---
const DraggableTable = ({ table, onClick }: { table: Table; onClick: () => void; }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'table',
    item: { id: table.id },
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
      ref={ref}
      className={`absolute p-2 border-2 rounded-lg flex flex-col items-center justify-center transition-all text-center ${statusClasses[table.status]}`}
      style={{
        left: `calc(${table.positionX || 50}% - 10px)`, // Offset is half of width (20/2 = 10)
        top: `calc(${table.positionY || 50}% - 10px)`,
        opacity: isDragging ? 0.5 : 1,
        width: '20px',
        height: '20px'
      }}
      title={`${table.category.name} ${table.tableNumber}`}
    >
      <span className="font-bold text-[9px] text-white">{table.tableNumber}</span>
      <span className="text-xs text-zinc-400 leading-tight">{table.category.name}</span>
    </button >
  );
};

// --- COMPONENTE PRINCIPAL DEL EDITOR DE MAPA ---
export function TableMapEditor({ eventId, onDataChange }: { eventId: string; onDataChange: () => void; }) {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isCategoryPriceModalOpen, setIsCategoryPriceModalOpen] = useState(false); // Nuevo estado
  const [currentVipTiers, setCurrentVipTiers] = useState<any[]>([]); // Estado para los Tiers VIP

  const reservationForm = useForm({
    resolver: zodResolver(manualReservationSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      paymentType: 'full' as const,
      amountPaid: 0,
      guestCount: 6,
      ticketTierId: '' // Initialize with empty string
    }
  });

  const mapRef = useRef<HTMLDivElement>(null);

  const fetchTables = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/tables/public/event/${eventId}`);
      setTables(response.data);
    } catch {
      toast.error("No se pudieron cargar las mesas.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Cargar Tiers VIP cuando se abre el modal
  const fetchVipTiers = useCallback(async () => {
    try {
      const res = await api.get(`/events/${eventId}/ticket-tiers/vip-tables`);
      setCurrentVipTiers(res.data);
    } catch (error) {
      console.error("Error fetching VIP tiers", error);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (isReservationModalOpen || isCategoryPriceModalOpen) {
      fetchVipTiers();
    }
  }, [isReservationModalOpen, isCategoryPriceModalOpen, fetchVipTiers]);

  // Auto-seleccionar tier basado en número de mesa
  useEffect(() => {
    if (selectedTable && currentVipTiers.length > 0) {
      const tableNum = parseInt(selectedTable.tableNumber.trim(), 10);
      const matchingTier = currentVipTiers.find(t => t.tableNumber === tableNum);

      if (matchingTier) {
        reservationForm.setValue('ticketTierId', matchingTier.id);
        reservationForm.setValue('amountPaid', Number(matchingTier.price));
      } else if (currentVipTiers.length > 0) {
        // Fallback to first if no exact match (optional)
        reservationForm.setValue('ticketTierId', currentVipTiers[0].id);
        reservationForm.setValue('amountPaid', Number(currentVipTiers[0].price));
      }
    }
  }, [selectedTable, currentVipTiers, reservationForm]);

  const handleTableDrop = useCallback((tableId: string, x: number, y: number) => {
    setTables(prev =>
      prev.map(t =>
        t.id === tableId ? { ...t, positionX: x, positionY: y } : t
      )
    );
  }, []);

  const handleSaveChanges = async () => {
    toast.promise(
      Promise.all(tables.map(table =>
        api.patch(`/tables/${table.id}/position`, {
          positionX: table.positionX,
          positionY: table.positionY,
        })
      )),
      {
        loading: 'Guardando posiciones...',
        success: '¡Posiciones guardadas con éxito!',
        error: 'No se pudieron guardar las posiciones.',
      }
    );
  };

  const handleUpdateStatus = async (status: Table['status']) => {
    if (!selectedTable) return;
    try {
      await api.patch(`/tables/${selectedTable.id}/status`, { status });
      toast.success(`Estado de la mesa actualizado.`);
      setSelectedTable(null);
      fetchTables();
      onDataChange();
    } catch {
      toast.error('No se pudo actualizar el estado.');
    }
  };

  const handleSetCategoryPrice = async (categoryId: string, price: number, capacity?: number, depositPrice?: number) => {
    try {
      await api.post('/tables/category/price', {
        eventId,
        categoryId,
        price,
        capacity,
        depositPrice
      });
      toast.success('Precio actualizado correctamente');
      fetchVipTiers(); // Refetch tiers to update dropdowns if open
    } catch (error) {
      toast.error('Error al actualizar precio');
    }
  };

  const onManualReservationSubmit = async (data: ManualReservationInputs) => {
    if (!selectedTable) return;
    try {
      await api.post('/tables/reservations/manual', {
        ...data,
        tableId: selectedTable.id,
        eventId,
      });
      toast.success(`Reserva manual creada.`);
      setIsReservationModalOpen(false);
      reservationForm.reset();
      setSelectedTable(null);
      fetchTables();
      onDataChange();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'No se pudo crear la reserva.');
    }
  };

  const [, drop] = useDrop(() => ({
    accept: 'table',
    drop(item: unknown, monitor: DropTargetMonitor) {
      const map = mapRef.current;
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
  drop(mapRef);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        id="map-container"
        ref={mapRef}
        className="relative w-full max-w-lg mx-auto my-8 border-2 border-dashed border-zinc-700 rounded-lg bg-black/20"
      >
        <Image
          src="/images/map-3d.png" // Updated to 3D map
          alt="Mapa de mesas"
          width={512}
          height={768}
          className="w-full h-auto opacity-50" // Slightly higher opacity for better visibility
        />
        {tables.map(table => (
          <DraggableTable key={table.id} table={table} onClick={() => setSelectedTable(table)} />
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setIsCategoryPriceModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Banknote size={18} /> Precios por Sector
        </button>
        <button
          onClick={handleSaveChanges}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Save size={18} /> Guardar Posiciones
        </button>
      </div>

      {/* MODAL DE PRECIOS POR SECTOR */}
      {isCategoryPriceModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Precios por Sector (Categoría)</h3>
              <button onClick={() => setIsCategoryPriceModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-sm text-zinc-400">Define el precio y la capacidad para cada sector. Esto creará o actualizará automáticamente la tarifa.</p>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {/* Obtenemos categorías únicas de las mesas cargadas */}
              {Array.from(new Set(tables.map(t => JSON.stringify({ id: t.category.id, name: t.category.name }))))
                .map(s => JSON.parse(s))
                .map((cat: { id: string, name: string }) => {
                  // Find existing tier for this category to pre-fill values
                  const existingTier = currentVipTiers.find(t => t.tableCategoryId === cat.id);
                  const currentPrice = existingTier ? Number(existingTier.price) : 0;
                  const currentCapacity = existingTier ? Number(existingTier.capacity) : 0;

                  return (
                    <div key={cat.id} className="flex items-center justify-between bg-zinc-800 p-3 rounded-md gap-4">
                      <span className="text-white font-medium flex-1">{cat.name}</span>

                      {/* Price Input */}
                      <div className="flex flex-col">
                        <label className="text-xs text-zinc-500 mb-1">Precio</label>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">$</span>
                          <input
                            id={`price-${cat.id}`}
                            type="number"
                            defaultValue={currentPrice || ''}
                            placeholder="0"
                            className="w-28 bg-zinc-700 text-white rounded px-2 py-1 text-right border border-zinc-600 focus:border-pink-500 outline-none"
                            onBlur={(e) => {
                              const price = parseFloat(e.target.value);
                              const capacityInput = document.getElementById(`capacity-${cat.id}`) as HTMLInputElement;
                              const depositInput = document.getElementById(`deposit-${cat.id}`) as HTMLInputElement;

                              const capacity = capacityInput ? parseFloat(capacityInput.value) : undefined;
                              const deposit = depositInput ? parseFloat(depositInput.value) : undefined;

                              if (!isNaN(price) && price >= 0) {
                                handleSetCategoryPrice(cat.id, price, capacity, deposit);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Capacity Input */}
                      <div className="flex flex-col">
                        <label className="text-xs text-zinc-500 mb-1">Capacidad (Pers)</label>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-zinc-400" />
                          <input
                            id={`capacity-${cat.id}`}
                            type="number"
                            defaultValue={currentCapacity || ''}
                            placeholder="Ej: 10"
                            className="w-20 bg-zinc-700 text-white rounded px-2 py-1 text-right border border-zinc-600 focus:border-pink-500 outline-none"
                            onBlur={(e) => {
                              const capacity = parseFloat(e.target.value);
                              // Get current price value
                              const priceInput = document.getElementById(`price-${cat.id}`) as HTMLInputElement;
                              const depositInput = document.getElementById(`deposit-${cat.id}`) as HTMLInputElement;
                              const price = priceInput ? parseFloat(priceInput.value) : 0;
                              const deposit = depositInput ? parseFloat(depositInput.value) : 0;

                              if (!isNaN(capacity) && capacity > 0) {
                                handleSetCategoryPrice(cat.id, price, capacity, deposit);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Deposit Input */}
                      <div className="flex flex-col">
                        <label className="text-xs text-zinc-500 mb-1">Seña Mínima</label>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">$</span>
                          <input
                            id={`deposit-${cat.id}`}
                            type="number"
                            defaultValue={existingTier?.partialPaymentPrice || ''}
                            placeholder="0"
                            className="w-24 bg-zinc-700 text-white rounded px-2 py-1 text-right border border-zinc-600 focus:border-pink-500 outline-none"
                            onBlur={(e) => {
                              const deposit = parseFloat(e.target.value);
                              const priceInput = document.getElementById(`price-${cat.id}`) as HTMLInputElement;
                              const capacityInput = document.getElementById(`capacity-${cat.id}`) as HTMLInputElement;
                              const price = priceInput ? parseFloat(priceInput.value) : 0;
                              const capacity = capacityInput ? parseFloat(capacityInput.value) : undefined;

                              if (!isNaN(deposit) && deposit >= 0) {
                                handleSetCategoryPrice(cat.id, price, capacity, deposit);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              }
              {tables.length === 0 && <p className="text-zinc-500 text-center">No hay mesas/categorías aún.</p>}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setIsCategoryPriceModalOpen(false)} className="bg-zinc-700 hover:bg-zinc-600 font-bold py-2 px-4 rounded-lg">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ACCIONES DE MESA */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Mesa {selectedTable.tableNumber}</h3>
              <button onClick={() => setSelectedTable(null)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setIsReservationModalOpen(true)}
                className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md flex items-center gap-3 disabled:opacity-50"
                disabled={selectedTable.status !== 'available'}
              >
                <UserPlus /> Registrar Venta Manual
              </button>
              <button onClick={() => handleUpdateStatus('available')} className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md">
                Marcar como Disponible
              </button>
              <button onClick={() => handleUpdateStatus('occupied')} className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md">
                Marcar como Ocupada
              </button>
              <button onClick={() => handleUpdateStatus('unavailable')} className="w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-md">
                Marcar como No Disponible
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESERVA MANUAL */}
      {isReservationModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={reservationForm.handleSubmit(onManualReservationSubmit)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                Registrar Venta para Mesa {selectedTable.tableNumber}
              </h3>
              <button
                type="button"
                onClick={() => setIsReservationModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* SELECCION DE TIER (PRODUCTO) */}
            <div>
              <label className="block text-sm font-medium text-zinc-300">Producto / Tarifa VIP</label>
              <select
                {...reservationForm.register('ticketTierId')}
                className="mt-1 w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"
                onChange={(e) => {
                  const tierId = e.target.value;
                  const tier = currentVipTiers.find(t => t.id === tierId);
                  if (tier) {
                    reservationForm.setValue('amountPaid', Number(tier.price));
                  }
                }}
              >
                <option value="">-- Seleccionar Tarifa --</option>
                {currentVipTiers.map(tier => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} (Mesa {tier.tableNumber}) - ${tier.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-zinc-300">
                Nombre del Cliente
              </label>
              <input
                id="clientName"
                {...reservationForm.register('clientName')}
                className="mt-1 w-full bg-zinc-800 rounded-md p-2"
              />
              {reservationForm.formState.errors.clientName && (
                <p className="text-red-500 text-xs mt-1">
                  {reservationForm.formState.errors.clientName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="clientEmail" className="block text-sm font-medium text-zinc-300">
                Email (para enviar QR)
              </label>
              <input
                id="clientEmail"
                {...reservationForm.register('clientEmail')}
                className="mt-1 w-full bg-zinc-800 rounded-md p-2"
              />
              {reservationForm.formState.errors.clientEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {reservationForm.formState.errors.clientEmail.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="guestCount" className="block text-sm font-medium text-zinc-300">
                  Nº de Invitados
                </label>
                <input
                  id="guestCount"
                  type="number"
                  {...reservationForm.register('guestCount')}
                  className="mt-1 w-full bg-zinc-800 rounded-md p-2"
                />
                {reservationForm.formState.errors.guestCount && (
                  <p className="text-red-500 text-xs mt-1">
                    {reservationForm.formState.errors.guestCount.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="paymentType" className="block text-sm font-medium text-zinc-300">
                  Tipo de Pago
                </label>
                <select
                  id="paymentType"
                  {...reservationForm.register('paymentType')}
                  className="mt-1 w-full bg-zinc-800 rounded-md p-2"
                >
                  <option value="deposit">Seña</option>
                  <option value="full">Pago Total</option>
                  <option value="gift">Regalo (Sin Cargo)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="amountPaid" className="block text-sm font-medium text-zinc-300">
                Monto Pagado
              </label>
              <input
                id="amountPaid"
                type="number"
                {...reservationForm.register('amountPaid')}
                className="mt-1 w-full bg-zinc-800 rounded-md p-2"
              />
              {reservationForm.formState.errors.amountPaid && (
                <p className="text-red-500 text-xs mt-1">
                  {reservationForm.formState.errors.amountPaid.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReservationModalOpen(false)}
                className="bg-zinc-700 hover:bg-zinc-600 font-bold py-2 px-4 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={reservationForm.formState.isSubmitting}
                className="bg-pink-600 hover:bg-pink-700 font-bold py-2 px-4 rounded-lg"
              >
                Confirmar Reserva
              </button>
            </div>
          </form>
        </div>
      )}
    </DndProvider>
  );
}
