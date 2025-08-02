// frontend/src/components/ticket-acquirer.tsx
'use client';

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { TicketTier, ProductType } from "@/types/ticket.types";
import { useAuthStore } from "@/stores/auth-store";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
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
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  
  const [termsAndConditionsText, setTermsAndConditionsText] = useState<string | null>(null);

  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiersRes, configRes] = await Promise.all([
          api.get(`/events/${eventId}/ticket-tiers`),
          api.get('/configuration')
        ]);
        setTiers(tiersRes.data);
        if (configRes.data.termsAndConditionsText) {
          setTermsAndConditionsText(configRes.data.termsAndConditionsText);
        }
      } catch (error) { console.error("Failed to fetch data", error); }
    };
    fetchData();
  }, [eventId]);

  const selectedTier = useMemo(() => {
    return tiers.find(tier => tier.id === selectedTierId);
  }, [selectedTierId, tiers]);

  const handleAcquireFree = async () => {
    setIsLoading(true);
    try {
      const promoterUsername = searchParams.get('promoter');
      const payload = {
        eventId,
        ticketTierId: selectedTierId,
        quantity,
        promoterUsername,
      };

      const response = await api.post('/tickets/acquire', payload);
      toast.success('Producto adquirido con éxito.');
      // CORRECCIÓN: Redirigimos al usuario después de la adquisición
      router.push('/mi-cuenta');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcquirePaid = async () => {
    setIsLoading(true);
    try {
      const promoterUsername = searchParams.get('promoter');
      const payload = {
        eventId,
        ticketTierId: selectedTierId,
        quantity,
        promoterUsername,
        paymentType,
      };

      const response = await api.post('/payments/create-preference', payload);
      setPreferenceId(response.data.preferenceId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFree = selectedTier?.price === 0;

  if (!isLoggedIn()) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center space-y-4">
        <h3 className="text-xl font-semibold text-white">Obtener Entradas</h3>
        <p className="text-zinc-400">Debes iniciar sesión para obtener entradas.</p>
        <Link href="/login" className="w-full inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (tiers.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center text-zinc-400">
        No hay entradas disponibles para este evento.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white">Obtener Entradas / Productos</h3>
      
      {!preferenceId ? (
        <>
          <div>
            <label htmlFor="ticket-tier" className="block text-sm font-medium text-zinc-300 mb-1">Producto</label>
            <select id="ticket-tier" value={selectedTierId} onChange={(e) => { setSelectedTierId(e.target.value); setPaymentType('full'); }} className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700">
              <option value="">Selecciona una opción...</option>
              {tiers.map(tier => (<option key={tier.id} value={tier.id}>{tier.name} - ${tier.price}</option>))}
            </select>
          </div>
          
          {selectedTier?.productType !== ProductType.VIP_TABLE && (
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-zinc-300 mb-1">Cantidad</label>
              <input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full bg-zinc-800 rounded-md p-2 text-white border border-zinc-700"/>
            </div>
          )}

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
          
          {termsAndConditionsText && (
            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="termsAccepted"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 accent-pink-600"
              />
              <label htmlFor="termsAccepted" className="text-sm text-zinc-400">
                Acepto los <Link href="/terminos-y-condiciones" target="_blank" className="underline text-pink-500">Términos y Condiciones</Link>
              </label>
            </div>
          )}
          
          <button 
            onClick={isFree ? handleAcquireFree : handleAcquirePaid}
            disabled={isLoading || !acceptedTerms || !selectedTierId} 
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Procesando...' : (isFree ? 'Obtener gratis' : 'Pagar')}
          </button>
        </>
      ) : (
        <div id="wallet_container">
          <Wallet initialization={{ preferenceId: preferenceId }} />
        </div>
      )}
    </div>
  );
}