// frontend/src/components/ticket-tier-manager.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { TicketTier } from "@/types/ticket.types";
import toast from "react-hot-toast";
import { Modal } from "./ui/modal";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { EditTicketTierForm } from "./edit-ticket-tier-form";

const createTierSchema = z.object({
  name: z.string().min(3, { message: "El nombre es requerido." }),
  isFree: z.boolean().default(false),
  price: z.coerce.number().min(0, { message: "El precio no puede ser negativo." }).optional(),
  quantity: z.coerce.number().int().min(1, { message: "La cantidad debe ser al menos 1." }),
  validUntil: z.string().optional(),
}).refine(data => {
  if (!data.isFree && (!data.price || data.price <= 0)) {
    return false;
  }
  return true;
}, {
  message: "El precio es requerido y debe ser mayor a cero para entradas de pago.",
  path: ['price'],
});

type CreateTierFormInputs = z.infer<typeof createTierSchema>;

export function TicketTierManager({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createTierSchema),
  });

  const isFreeTicket = watch('isFree', false);

  const fetchTiers = useCallback(async () => {
    try {
      const response = await api.get(`/events/${eventId}/ticket-tiers`);
      setTiers(response.data);
    } catch (error) {
      console.error("Failed to fetch ticket tiers", error);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchTiers();
    }
  }, [eventId, fetchTiers]);

  const onSubmitCreate = async (data: CreateTierFormInputs) => {
    try {
      const payload = {
        name: data.name,
        isFree: data.isFree,
        price: data.isFree ? 0 : data.price,
        quantity: data.quantity,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
      };
      await api.post(`/events/${eventId}/ticket-tiers`, payload);
      toast.success("Tipo de entrada creado con éxito.");
      reset();
      fetchTiers();
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error("Error al crear el tipo de entrada.");
    }
  };
  
  const handleEditClick = (tier: TicketTier) => {
    setSelectedTier(tier);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (tierId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este tipo de entrada?")) {
      try {
        await api.delete(`/events/${eventId}/ticket-tiers/${tierId}`);
        toast.success("Tipo de entrada eliminado.");
        fetchTiers();
      } catch (error) {
        toast.error("Error al eliminar el tipo de entrada.");
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mt-8">
        <h3 className="text-xl font-semibold text-white">Entradas Disponibles</h3>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-3 rounded-lg flex items-center space-x-2 text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Añadir Tipo</span>
        </button>
      </div>
      
      <div className="mt-4 space-y-3">
        {tiers.length > 0 ? (
          tiers.map(tier => (
            <div key={tier.id} className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div>
                <p className="font-semibold text-white">{tier.name}</p>
                <p className="text-sm text-zinc-400">Cantidad: {tier.quantity}</p>
                {tier.validUntil && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Válido hasta: {new Date(tier.validUntil).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })} hs.
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-bold text-lg text-pink-500">
                  {tier.isFree ? 'Entrada sin Cargo' : `$${tier.price}`}
                </p>
                <button onClick={() => handleEditClick(tier)} className="text-zinc-400 hover:text-white" title="Editar"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteClick(tier.id)} className="text-zinc-400 hover:text-red-500" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-zinc-900 border border-zinc-800 rounded-lg">
            <p className="text-zinc-500">Aún no hay tipos de entrada para este evento.</p>
          </div>
        )}
      </div>

      {/* Modal de Creación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Añadir Nuevo Tipo de Entrada"
      >
        <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">Nombre (Ej: General)</label>
            <input {...register('name')} id="name" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFree"
              {...register('isFree')}
              className="accent-pink-600"
            />
            <label htmlFor="isFree" className="text-sm font-medium text-zinc-300">Entrada sin Cargo</label>
          </div>
          {!isFreeTicket && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-zinc-300 mb-1">Precio</label>
              <input {...register('price')} id="price" type="number" step="0.01" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
          )}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad</label>
            <input {...register('quantity')} id="quantity" type="number" className="w-full bg-zinc-800 rounded-md p-2 text-white" />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
          </div>
          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-zinc-300 mb-1">Válido Hasta (Opcional)</label>
            <input id="validUntil" type="datetime-local" {...register('validUntil')} className="w-full bg-zinc-800 rounded-md p-2 text-white"/>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg disabled:opacity-50">
              {isSubmitting ? 'Añadiendo...' : 'Añadir Entrada'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edición */}
      {selectedTier && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Editando: ${selectedTier.name}`}>
          <EditTicketTierForm 
            tier={selectedTier}
            eventId={eventId}
            onClose={() => setIsEditModalOpen(false)}
            onTierUpdated={fetchTiers}
          />
        </Modal>
      )}
    </>
  );
}