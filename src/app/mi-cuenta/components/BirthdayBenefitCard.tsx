// src/app/mi-cuenta/components/BirthdayBenefitCard.tsx
'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { BirthdayBenefit } from "@/types/birthday.types";
import { Loader2, PartyPopper, AlertTriangle, Edit2, Users } from "lucide-react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import { format } from 'date-fns';

export function BirthdayBenefitCard() {
  // Estado para el flujo en varios pasos: 'initial' -> 'form' -> 'claimed'
  const [step, setStep] = useState<'initial' | 'form' | 'claimed'>('initial');

  const [benefit, setBenefit] = useState<BirthdayBenefit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestInput, setGuestInput] = useState<number>(5);
  const [isEditing, setIsEditing] = useState(false);

  // --- LÓGICA DE LA CARD ---

  const fetchBenefit = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<BirthdayBenefit | ''>('/birthday/my-benefit');
      if (data) {
        setBenefit(data);
        setStep('claimed'); // Si ya tiene beneficio, vamos directo a mostrar los QRs
      }
    } catch (err) {
      console.error("No se encontró beneficio existente.", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefit();
  }, []);

  const handleClaimBenefit = async () => {
    if (guestInput < 0) {
      toast.error("El número de invitados no puede ser negativo.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post<BirthdayBenefit>('/birthday/claim', { guestLimit: guestInput });
      setBenefit(data);
      setStep('claimed'); // Avanzamos al paso final
      toast.success('¡Beneficio reclamado con éxito!');
    } catch (err: any) {
      // Manejo de errores mejorado
      let errorMessage = "No se pudo reclamar el beneficio.";
      const errorData = err.response?.data?.message;
      if (Array.isArray(errorData)) {
        errorMessage = errorData.join('. ');
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGuestLimit = async () => {
    if (guestInput < 0) {
      toast.error("El número de invitados no puede ser negativo.");
      return;
    }
    setIsLoading(true);
    try {
      await api.patch('/birthday/my-benefit/guest-limit', { guestLimit: guestInput });
      await fetchBenefit(); // Re-cargamos los datos para mostrar los cambios
      toast.success("Cantidad de invitados actualizada.");
      setIsEditing(false); // Cerramos el modo edición
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "No se pudo actualizar.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Si el valor no es un número (ej. campo vacío), lo tratamos como 0.
    setGuestInput(isNaN(value) ? 0 : value);
  };

  // --- COMPONENTES DE UI Y RENDERIZADO ---

  const CardWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-pink-500/30 rounded-lg p-6 shadow-lg text-white transition-all duration-500">
      {children}
    </div>
  );

  const QrDisplay = ({ title, description, qrData }: { title: string, description: string, qrData: string }) => (
    <div className="bg-white p-4 rounded-lg flex flex-col items-center text-center shadow-md">
      <QRCode value={qrData} size={180} className="mb-4" />
      <div className="mt-2 text-black">
        <p className="font-bold text-lg">{title}</p>
        <p className="text-sm text-zinc-700">{description}</p>
        {/* ¡ID OCULTO! */}
      </div>
    </div>
  );

  // --- Renderizado Inicial ---
  if (isLoading) {
    return <CardWrapper><div className="flex justify-center items-center py-8"><Loader2 className="animate-spin text-pink-500" size={32} /></div></CardWrapper>;
  }

  // --- VISTA 1: INICIAL ---
  if (step === 'initial') {
    return (
      <CardWrapper>
        <div className="text-center">
          <PartyPopper className="mx-auto text-amber-400 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white">¡Es tu semana de cumpleaños!</h2>
          <p className="text-zinc-300 mt-2 mb-6">Obtén tu beneficio especial: entrada gratis para vos, tus invitados y un champagne de regalo.</p>
          <button
            onClick={() => setStep('form')} // <-- Solo cambia al siguiente paso
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
          >
            Reclamar mi Beneficio
          </button>
        </div>
      </CardWrapper>
    );
  }

  // --- VISTA 2: FORMULARIO DE INVITADOS ---
  if (step === 'form') {
      return (
        <CardWrapper>
        <div className="text-center">
          <Users className="mx-auto text-pink-400 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white">Lista de Invitados</h2>
          <p className="text-zinc-300 mt-2 mb-4">¿Cuántos invitados quieres traer al evento? <br/>El ingreso es hasta las 3 AM y deben entrar todos juntos.</p>

          <div className="my-6">
              <label htmlFor="guest-input" className="block mb-2 font-semibold">Número de invitados:</label>
              <input id="guest-input" type="number" value={guestInput} onChange={handleInputChange} className="bg-zinc-800 text-white p-2 rounded-md w-24 text-center" />
              <p className="text-xs text-zinc-500 mt-2">(Podrás modificarlo 2 veces más tarde si es necesario)</p>
          </div>

          {error && (
              <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-md mb-4 flex items-center gap-2">
                  <AlertTriangle size={20}/> <p>{error}</p>
              </div>
          )}

          <button onClick={handleClaimBenefit} disabled={isLoading} className="bg-green-600 hover:bg-green-700 disabled:bg-green-900/50 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar y Generar QRs'}
          </button>
        </div>
      </CardWrapper>
      )
  }

  // --- VISTA 3: BENEFICIO RECLAMADO (QRs) ---
  if (step === 'claimed' && benefit) {
    const entryQrData = JSON.stringify({ type: 'BIRTHDAY_ENTRY', id: benefit.entryQrId });
    const giftQrData = JSON.stringify({ type: 'BIRTHDAY_GIFT', id: benefit.giftQrId });
    const expirationDate = new Date(benefit.expiresAt);
    return (
        <CardWrapper>
            <div className="flex items-center gap-4 mb-6">
              <PartyPopper className="text-amber-400" size={40} />
              <div>
                <h2 className="text-2xl font-bold text-white">¡Tu Beneficio de Cumpleaños!</h2>
                <p className="text-zinc-300">¡Felicidades! Usa estos QRs para el evento <strong>{benefit.event.title}</strong>.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <QrDisplay title="QR de Ingreso" description={`Para vos y tus ${benefit.guestLimit} invitados. Deben ingresar todos juntos.`} qrData={entryQrData} />
              <QrDisplay title="QR de Regalo" description="Presenta este QR en la barra para canjear tu champagne." qrData={giftQrData} />
            </div>

            <div className="text-center mt-6 p-3 bg-zinc-800/50 rounded-lg">
                <p className="font-semibold text-red-400">¡Importante! El ingreso es válido hasta las {format(expirationDate, "HH:mm 'hs'.")}</p>
            </div>

            {isEditing ? (
              <div className="mt-6 text-center">
                <h4 className="font-semibold mb-2">Modificar número de invitados:</h4>
                <input type="number" value={guestInput} onChange={handleInputChange} className="bg-zinc-800 text-white p-2 rounded-md w-24 text-center" />
                <button onClick={handleUpdateGuestLimit} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md ml-3">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar'}
                </button>
                <button onClick={() => setIsEditing(false)} className="text-zinc-400 ml-3">Cancelar</button>
              </div>
            ) : (
              benefit.updatesRemaining > 0 && (
                <div className="text-center mt-6">
                  <button onClick={() => { setIsEditing(true); setGuestInput(benefit.guestLimit); }} className="text-pink-400 hover:text-pink-300 flex items-center gap-2 mx-auto">
                    <Edit2 size={16} /> Modificar Invitados ({benefit.updatesRemaining} restantes)
                  </button>
                </div>
              )
            )}
        </CardWrapper>
    );
  }

  // Fallback por si no hay beneficio y el estado no es 'initial'
  return null;
}