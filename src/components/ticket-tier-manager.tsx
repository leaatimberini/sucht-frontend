'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { TicketTier } from "@/types/ticket.types";
import { Modal } from "./ui/modal";
import { CreateTicketTierForm } from "./create-ticket-tier-form";
import { PlusCircle } from "lucide-react";

export function TicketTierManager({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTiers = async () => {
    try {
      const response = await api.get(`/events/${eventId}/ticket-tiers`);
      setTiers(response.data);
    } catch (error) {
      console.error("Failed to fetch ticket tiers", error);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, [eventId]);

  return (
    <>
      <div className="flex justify-between items-center mt-8">
        <h3 className="text-xl font-semibold text-white">Entradas Disponibles</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
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
              </div>
              <p className="font-bold text-lg text-pink-500">${tier.price}</p>
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
        onClose={() => setIsModalOpen(false)}
        title="Añadir Nuevo Tipo de Entrada"
      >
        <CreateTicketTierForm
          eventId={eventId}
          onClose={() => setIsModalOpen(false)}
          onTierCreated={fetchTiers}
        />
      </Modal>
    </>
  );
}