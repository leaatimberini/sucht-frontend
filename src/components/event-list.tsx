'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { type TicketTier } from '@/types/event.types';
import { Modal } from './ui/modal';
import { CreateTicketTierForm } from './create-ticket-tier-form';
import { EditTicketTierForm } from './edit-ticket-tier-form';
import { Pencil, PlusCircle } from 'lucide-react';

export function TicketTierManager({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);

  const fetchTiers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/events/${eventId}/ticket-tiers`);
      setTiers(response.data);
    } catch (error) {
      console.error("Failed to fetch ticket tiers:", error);
      setTiers([]);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const handleEditClick = (tier: TicketTier) => {
    setSelectedTier(tier);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Tipos de Entrada</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Crear Tipo</span>
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        {isLoading ? (
          <p className="p-4 text-zinc-400">Cargando...</p>
        ) : tiers.length > 0 ? (
          tiers.map(tier => (
            <div key={tier.id} className="flex justify-between items-center p-4 border-b border-zinc-800 last:border-b-0">
              <div>
                <p className="font-semibold text-white">{tier.name}</p>
                <p className="text-sm text-zinc-400">
                  ${tier.price} ARS - Cantidad: {tier.quantity} - {tier.available ? 'Activo' : 'Inactivo'}
                </p>
              </div>
              <button 
                onClick={() => handleEditClick(tier)}
                className="text-zinc-400 hover:text-white transition-colors p-1"
              >
                <Pencil className="h-5 w-5" />
              </button>
            </div>
          ))
        ) : (
          <p className="p-4 text-zinc-500">No hay tipos de entrada creados para este evento.</p>
        )}
      </div>

      {/* Modal para Crear */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Tipo de Entrada"
      >
        <CreateTicketTierForm
          eventId={eventId}
          onClose={() => setIsCreateModalOpen(false)}
          onTierCreated={fetchTiers}
        />
      </Modal>

      {/* Modal para Editar */}
      {selectedTier && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Editando: ${selectedTier.name}`}
        >
          <EditTicketTierForm
            ticketTier={selectedTier}
            onClose={() => setIsEditModalOpen(false)}
            onTicketTierUpdated={fetchTiers}
          />
        </Modal>
      )}
    </div>
  );
}