// src/app/mi-cuenta/components/BirthdayBenefitCard.tsx

'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { BirthdayBenefit } from "@/types/birthday.types";
import { Loader2, PartyPopper, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import { format } from 'date-fns';
// CORRECCIÓN: Eliminamos la importación de 'es' locale para simplificar
// import { es } from 'date-fns/locale';

export function BirthdayBenefitCard() {
  const [benefit, setBenefit] = useState<BirthdayBenefit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBenefit = async () => {
      try {
        const { data } = await api.get<BirthdayBenefit | ''>('/birthday/my-benefit');
        if (data) {
          setBenefit(data);
        }
      } catch (err) {
        console.error("No se encontró beneficio existente, lo cual es normal.", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBenefit();
  }, []);

  const handleClaimBenefit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post<BirthdayBenefit>('/birthday/claim');
      setBenefit(data);
      toast.success('¡Beneficio reclamado con éxito!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "No se pudo reclamar el beneficio.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-pink-500/30 rounded-lg p-6 shadow-lg text-white">
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <CardWrapper>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-pink-500" size={32} />
        </div>
      </CardWrapper>
    );
  }

  // --- VISTA DEL BENEFICIO YA RECLAMADO ---
  if (benefit) {
    const qrData = JSON.stringify({ type: 'BIRTHDAY', id: benefit.id });
    const eventDate = new Date(benefit.event.startDate);
    const expirationDate = new Date(benefit.expiresAt);

    return (
      <CardWrapper>
        <div className="flex items-center gap-4 mb-4">
          <PartyPopper className="text-amber-400" size={40} />
          <div>
            <h2 className="text-2xl font-bold text-white">¡Tu Beneficio de Cumpleaños!</h2>
            <p className="text-zinc-300">¡Felicidades! Usa estos QRs para el evento:</p>
            <p className="font-bold text-amber-400">{benefit.event.title}</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6 items-center">
            {/* QR de Ingreso */}
            <div className="bg-white p-4 rounded-lg flex flex-col items-center text-center">
                 <QRCode value={qrData} size={180} />
                 <div className="mt-4 text-black">
                    <p className="font-bold text-lg">QR de Ingreso y Regalo</p>
                    <p className="text-sm text-zinc-700">Presenta este QR en la puerta para tu ingreso y el de tus <strong>{benefit.guestLimit} invitados</strong>.</p>
                    <p className="text-sm text-zinc-700 mt-1">Luego, muéstralo en la barra para canjear tu regalo.</p>
                    {/* CORRECCIÓN: Se eliminó el tercer argumento de format() */}
                    <p className="text-xs font-semibold text-red-600 mt-2 uppercase">Válido hasta {format(expirationDate, "HH:mm'hs del' EEEE dd/MM")}</p>
                 </div>
            </div>

            {/* Instrucciones */}
            <div className="text-zinc-300 space-y-3">
                <h3 className="text-xl font-semibold text-white">¿Cómo funciona?</h3>
                <p><strong>1. Ingreso:</strong> Al llegar, presenta este QR al personal de seguridad. Ellos registrarán tu ingreso y el de todo tu grupo junto.</p>
                <p><strong>2. Regalo:</strong> Una vez dentro, acércate a la barra y vuelve a mostrar el mismo QR para recibir tu champagne de regalo.</p>
                 {/* CORRECCIÓN: Se eliminó el tercer argumento de format() */}
                <p><strong>Importante:</strong> Todo el grupo debe ingresar junto antes de la hora de vencimiento. El beneficio es válido solo para el evento del <strong>{format(eventDate, "EEEE d 'de' MMMM")}</strong>.</p>
            </div>
        </div>
      </CardWrapper>
    );
  }

  // --- VISTA PARA RECLAMAR EL BENEFICIO ---
  return (
    <CardWrapper>
      <div className="text-center">
        <PartyPopper className="mx-auto text-amber-400 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-white">¡Es tu semana de cumpleaños!</h2>
        <p className="text-zinc-300 mt-2 mb-4">Reclama tu beneficio especial para el próximo evento: entrada gratis para vos, tus invitados y un champagne de regalo.</p>
        
        {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-md mb-4 flex items-center gap-2">
                <AlertTriangle size={20}/>
                <p>{error}</p>
            </div>
        )}

        <button
          onClick={handleClaimBenefit}
          disabled={isLoading}
          className="bg-pink-600 hover:bg-pink-700 disabled:bg-pink-900/50 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Reclamar mi Beneficio'}
        </button>
      </div>
    </CardWrapper>
  );
}