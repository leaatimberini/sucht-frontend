'use client';

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { TicketTier, ProductType } from "@/types/ticket.types"; // Asumiendo que ProductType está en tus tipos
import { useAuthStore } from "@/stores/auth-store";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

const mpPublicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
if (mpPublicKey) {
  initMercadoPago(mpPublicKey);
} else {
  console.error("Mercado Pago public key is not configured.");
}

export function TicketAcquirer({ eventId }: { eventId: string }) {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full'); // 1. NUEVO ESTADO PARA EL TIPO DE PAGO
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await api.get(`/events/${eventId}/ticket-tiers`);
        setTiers(response.data);
      } catch (error) { console.error("Failed to fetch tiers", error); }
    };
    fetchTiers();
  }, [eventId]);

  // 2. HELPER PARA ENCONTRAR EL TIER SELECCIONADO
  const selectedTier = useMemo(() => {
    return tiers.find(tier => tier.id === selectedTierId);
  }, [selectedTierId, tiers]);

  const handleAcquire = async () => {
    if (!isLoggedIn()) {
      toast.error("Debes iniciar sesión.");
      router.push('/login');
      return;
    }
    if (!selectedTierId) {
      toast.error("Por favor, selecciona un tipo de entrada.");
      return;
    }

    setIsLoading(true);
    try {
      const promoterUsername = searchParams.get('promoter');
      // 3. PAYLOAD ACTUALIZADO CON EL TIPO DE PAGO
      const payload = {
        eventId,
        ticketTierId: selectedTierId,
        quantity,
        promoterUsername,
        paymentType, // Se envía 'full' o 'partial'
      };

      const response = await api.post('/payments/create-preference', payload);
      
      if (response.data.type === 'free') {
        toast.success(response.data.message);
        router.push('/mi-cuenta');
      } else {
        setPreferenceId(response.data.preferenceId);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // ... (código para usuario no logueado y sin tiers no cambia)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white">Obtener Entradas / Productos</h3>
      
      {!preferenceId ? (
        <>
          <div>
            <label htmlFor="ticket-tier" className="block text-sm font-medium text-zinc-300 mb-1">Producto</label>
            <select id="ticket-tier" value={selectedTierId} onChange={(e) => setSelectedTierId(e.target.value)} className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700">
              <option value="">Selecciona una opción...</option>
              {tiers.map(tier => (<option key={tier.id} value={tier.id}>{tier.name} - ${tier.price}</option>))}
            </select>
          </div>
          
          {/* Ocultamos cantidad para Mesas VIP, asumimos que siempre es 1 */}
          {selectedTier?.productType !== ProductType.VIP_TABLE && (
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad</label>
              <input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"/>
            </div>
          )}

          {/* 4. NUEVA UI CONDICIONAL PARA OPCIONES DE PAGO */}
          {selectedTier && selectedTier.allowPartialPayment && (
            <div className="pt-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Opción de Pago</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('partial')}
                  className={`p-3 rounded-md text-center text-sm font-semibold border-2 ${paymentType === 'partial' ? 'border-pink-500 bg-pink-500/10' : 'border-zinc-700 bg-zinc-800'}`}
                >
                  Pagar Seña <span className="block font-bold text-base">${selectedTier.partialPaymentPrice}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('full')}
                  className={`p-3 rounded-md text-center text-sm font-semibold border-2 ${paymentType === 'full' ? 'border-pink-500 bg-pink-500/10' : 'border-zinc-700 bg-zinc-800'}`}
                >
                  Pagar Total <span className="block font-bold text-base">${selectedTier.price}</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-2 pt-2">
            {/* ... (checkbox de T&C sin cambios) ... */}
          </div>

          <button 
            onClick={handleAcquire} 
            disabled={isLoading || !acceptedTerms || !selectedTierId} 
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Procesando...' : 'Continuar'}
          </button>
        </>
      ) : (
        <div id="wallet_container">
          {/* ... (código de Mercado Pago Wallet sin cambios) ... */}
        </div>
      )}
    </div>
  );
}