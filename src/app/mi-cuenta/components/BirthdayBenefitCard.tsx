'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Ticket } from "@/types/ticket.types";
import { UserReward } from "@/types/reward.types";
import { Loader2, PartyPopper, AlertTriangle, Crown, Gift, Users } from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { format } from "date-fns";

// --- COMPONENTE PRINCIPAL ---
export function BirthdayBenefitCard() {
  const [step, setStep] = useState<'loading' | 'choice' | 'classic_form' | 'claimed'>('loading');
  const [offers, setOffers] = useState<any>({});
  const [claimedBenefit, setClaimedBenefit] = useState<{ ticket: Ticket, reward: UserReward } | null>(null);
  const [guestInput, setGuestInput] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 1. Mantenemos el estado de carga inicial en true
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkOffers = async () => {
      // No necesitamos poner setIsLoading(true) aquí porque ya empieza en true.
      try {
        const { data } = await api.get('/birthday/offers');
        setOffers(data);
        if (data.claimedBenefit) {
          setClaimedBenefit(data.claimedBenefit);
          setStep('claimed');
        } else if (data.isClassicOfferAvailable || data.isVipOfferAvailable) {
          setStep('choice');
        } else {
          // Si no hay ofertas, podemos elegir no mostrar nada o un mensaje.
          // Para no mostrar nada, simplemente no cambiamos el paso de 'loading'.
          // Esto hará que el componente devuelva 'null' al final.
        }
      } catch (err) {
        console.error("Error fetching birthday offers", err);
      } finally {
        // 2. CORRECCIÓN CLAVE: Siempre quitamos el estado de carga al finalizar.
        setIsLoading(false);
      }
    };
    checkOffers();
    // 3. CORRECCIÓN CLAVE: El array de dependencias debe estar vacío para que se ejecute solo una vez.
  }, []);

  const handleSelectOption = async (choice: 'classic' | 'vip') => {
    setIsLoading(true);
    setError(null);
    const payload: any = { choice };

    if (choice === 'classic') {
      payload.guestLimit = guestInput;
      try {
        const { data } = await api.post('/birthday/select-option', payload);
        setClaimedBenefit(data);
        setStep('claimed');
        toast.success('¡Beneficio clásico reclamado!');
      } catch (err: any) {
        handleApiError(err);
      }
    } else if (choice === 'vip') {
      if (!user?.whatsappNumber) {
        toast.error("Por favor, añade tu WhatsApp en 'Editar Perfil' para reservar una mesa.", { duration: 4000 });
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await api.post('/birthday/select-option', payload);
        if (data.type === 'paid' && data.preferenceId) {
          window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.preferenceId}`;
        }
      } catch (err: any) {
        handleApiError(err);
      }
    }
    setIsLoading(false);
  };

  const handleApiError = (err: any) => {
    let errorMessage = "Ocurrió un error.";
    const errorData = err.response?.data?.message;
    if (Array.isArray(errorData)) errorMessage = errorData.join('. ');
    else if (typeof errorData === 'string') errorMessage = errorData;
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setGuestInput(isNaN(value) ? 0 : value);
  };

  // --- RENDERIZADO ---
  if (isLoading) {
    return <div className="bg-zinc-900 rounded-lg p-6 flex justify-center items-center min-h-[200px]"><Loader2 className="animate-spin text-pink-500" /></div>;
  }

  if (step === 'choice') {
    return (
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-pink-500/30 rounded-lg p-6 text-white text-center">
        <PartyPopper className="mx-auto text-amber-400 mb-4" size={48} />
        <h2 className="text-2xl font-bold">¡Es tu semana de cumpleaños!</h2>
        <p className="text-zinc-300 mt-2 mb-6">Elige uno de los siguientes beneficios exclusivos para celebrar:</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-zinc-700 p-4 rounded-lg flex flex-col text-left">
            <div className='flex items-center gap-3 mb-2'>
              <Gift size={24} className="text-pink-400" />
              <h3 className="font-bold text-lg">Beneficio Clásico</h3>
            </div>
            <p className="text-sm text-zinc-400 flex-grow my-2">Entrada GRATIS para vos y tus invitados + 1 Champagne de regalo.</p>
            <button onClick={() => setStep('classic_form')} disabled={!offers.isClassicOfferAvailable} className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {offers.isClassicOfferAvailable ? 'Elegir' : 'No Disponible'}
            </button>
          </div>
          <div className="border border-zinc-700 p-4 rounded-lg flex flex-col text-left">
            <div className='flex items-center gap-3 mb-2'>
              <Crown size={24} className="text-amber-400" />
              <h3 className="font-bold text-lg">Upgrade a Mesa VIP</h3>
            </div>
            <p className="text-sm text-zinc-400 flex-grow my-2">Pagá $150.000 y te damos $200.000 en consumo. Válido señando con $15.000.</p>
            <button onClick={() => handleSelectOption('vip')} disabled={!offers.isVipOfferAvailable} className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {offers.isVipOfferAvailable ? 'Reservar VIP' : 'Agotado'}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    );
  }

  if (step === 'classic_form') {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-white text-center">
        <Users className="mx-auto text-pink-400 mb-4" size={48} />
        <h2 className="text-2xl font-bold">Lista de Invitados</h2>
        <p className="text-zinc-300 mt-2 mb-4">¿Cuántos invitados quieres traer? (Máximo 10)<br />El ingreso es hasta las 3 AM y deben entrar todos juntos.</p>
        <input id="guest-input" type="number" value={guestInput} onChange={handleInputChange} className="bg-zinc-800 text-white p-2 rounded-md w-24 text-center" />
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        <div className="mt-6 flex gap-4 justify-center">
          <button onClick={() => setStep('choice')} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">Volver</button>
          <button onClick={() => handleSelectOption('classic')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Confirmar y Reclamar</button>
        </div>
      </div>
    )
  }

  if (step === 'claimed' && claimedBenefit) {
    return (
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-green-500/30 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">¡Beneficio Reclamado!</h2>
        <p className="text-zinc-300 mb-6">
          Has elegido la opción clásica. Tu entrada y tu premio de regalo se han generado y añadido a tus secciones correspondientes.
          También puedes acceder a ellos directamente desde aquí.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {claimedBenefit.ticket && (
            <Link href="/mi-cuenta/entradas" className="bg-white p-4 rounded-lg flex flex-col items-center text-center hover:scale-105 transition-transform">
              <QRCodeSVG value={claimedBenefit.ticket.id} size={150} fgColor="#000000" bgColor="#ffffff" />
              <p className="font-bold text-black mt-4 text-lg">QR de Ingreso</p>
              <p className="text-sm text-zinc-600">Para vos y {claimedBenefit.ticket.quantity - 1} invitados</p>
            </Link>
          )}
          {claimedBenefit.reward && (
            <Link href="/mi-cuenta/premios" className="bg-white p-4 rounded-lg flex flex-col items-center text-center hover:scale-105 transition-transform">
              <QRCodeSVG value={claimedBenefit.reward.id} size={150} fgColor="#000000" bgColor="#ffffff" />
              <p className="font-bold text-black mt-4 text-lg">QR de Regalo</p>
              <p className="text-sm text-zinc-600">{claimedBenefit.reward.reward.name}</p>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Si ninguna condición de renderizado se cumple (ej. no es la semana de cumpleaños), no muestra nada.
  return null;
}