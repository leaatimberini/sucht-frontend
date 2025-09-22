// src/components/ticket-tier-manager.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { TicketTier } from "@/types/ticket.types";
import toast from "react-hot-toast";
import { Modal } from "./ui/modal";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { EventTierForm } from "./EventTierForm";

export function TicketTierManager({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTiers = useCallback(async () => {
    try {
      // Nota: Este endpoint solo muestra entradas públicas. Si como admin necesitas ver
      // las invitaciones privadas aquí, necesitaremos crear un nuevo endpoint en el backend.
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

  const handleOpenCreateModal = () => {
    setSelectedTier(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tier: TicketTier) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTier(null);
  };
  
  const handleFormSubmit = async (data: Partial<TicketTier>) => {
    setIsLoading(true);
    // El eventId se añade aquí al payload, no se pasa al formulario.
    const payload = { ...data, eventId };

    try {
        if (selectedTier) {
            await api.patch(`/events/${eventId}/ticket-tiers/${selectedTier.id}`, payload);
            toast.success("Tipo de entrada actualizado.");
        } else {
            await api.post(`/events/${eventId}/ticket-tiers`, payload);
            toast.success("Tipo de entrada creado con éxito.");
        }
        fetchTiers();
        handleCloseModal();
    } catch (error: any) {
        const errorMessages = error.response?.data?.message;
        const displayError = Array.isArray(errorMessages) ? errorMessages.join(', ') : "Ocurrió un error.";
        toast.error(displayError);
    } finally {
        setIsLoading(false);
    }
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
          onClick={handleOpenCreateModal}
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
                <p className="text-sm text-zinc-400">Tipo: {tier.productType} | Cantidad: {tier.quantity}</p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-bold text-lg text-pink-500">
                  {tier.price === 0 ? 'Gratis' : `$${tier.price}`}
                </p>
                <button onClick={() => handleOpenEditModal(tier)} className="text-zinc-400 hover:text-white" title="Editar"><Edit className="h-4 w-4" /></button>
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedTier ? `Editando: ${selectedTier.name}` : "Añadir Nuevo Tipo de Entrada"}
      >
        <EventTierForm
            // FIX: Se elimina la prop 'eventId' que causaba el error.
            existingTier={selectedTier || undefined}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            onClose={handleCloseModal}
        />
      </Modal>
    </>
  );
}