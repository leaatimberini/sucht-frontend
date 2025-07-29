'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { TicketTier } from "@/types/ticket.types";
import { useAuthStore } from "@/stores/auth-store";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function TicketAcquirer({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const router = useRouter();

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await api.get(`/events/${eventId}/ticket-tiers`);
        setTiers(response.data);
      } catch (error) {
        console.error("Failed to fetch tiers", error);
      }
    };
    fetchTiers();
  }, [eventId]);

  const handleAcquire = async () => {
    if (!isLoggedIn()) {
      toast.error("Debes iniciar sesión para obtener entradas.");
      router.push('/login');
      return;
    }
    if (!selectedTierId) {
      toast.error("Por favor, selecciona un tipo de entrada.");
      return;
    }

    setIsLoading(true);
    try {
      // --- LÓGICA DE RASTREO AÑADIDA ---
      // Buscamos si hay un RRPP guardado en la memoria del navegador
      const promoterUsername = localStorage.getItem('promoterUsername');
      
      const payload = {
        eventId,
        ticketTierId: selectedTierId,
        quantity,
        promoterUsername: promoterUsername, // Lo añadimos al payload
      };

      await api.post('/tickets/acquire', payload);
      toast.success(`¡Felicitaciones! Has adquirido ${quantity} entrada(s).`);
      
      // Limpiamos el tracker para que no se acrediten futuras compras al mismo RRPP
      localStorage.removeItem('promoterUsername');

      router.push('/mi-cuenta');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudieron obtener las entradas.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // El resto del JSX no cambia
  if (!isLoggedIn()) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
        <h3 className="text-xl font-semibold text-white">¿Quieres venir?</h3>
        <p className="text-zinc-400 mt-2 mb-4">Inicia sesión o crea una cuenta para obtener tus entradas.</p>
        <Link href="/login" className="w-full block bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg">
          Ingresar
        </Link>
      </div>
    );
  }
  if (tiers.length === 0) {
    return <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center"><p className="text-zinc-400">No hay entradas disponibles para este evento en este momento.</p></div>;
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white">Obtener Entradas</h3>
      <div>
        <label htmlFor="ticket-tier" className="block text-sm font-medium text-zinc-300 mb-1">Tipo de Entrada</label>
        <select id="ticket-tier" value={selectedTierId} onChange={(e) => setSelectedTierId(e.target.value)} className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700">
          <option value="">Selecciona una opción...</option>
          {tiers.map(tier => (<option key={tier.id} value={tier.id}>{tier.name} - ${tier.price} (Quedan: {tier.quantity})</option>))}
        </select>
      </div>
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad</label>
        <input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"/>
      </div>
      <button onClick={handleAcquire} disabled={isLoading} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
        {isLoading ? 'Procesando...' : 'Obtener Entradas'}
      </button>
    </div>
  );
}
