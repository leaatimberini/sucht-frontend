// src/components/share-button.tsx
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Instagram, Download, Link as LinkIcon, CheckCircle, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function ShareButton({ eventId, eventTitle, flyerImageUrl }: { eventId: string, eventTitle: string, flyerImageUrl: string | null }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const { user } = useAuthStore();

  useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
  }, []);

  const handleOpenModal = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para compartir y ganar puntos.');
      return;
    }
    if (!user.username) {
      toast.error('Debes configurar tu nombre de usuario en "Mi Cuenta" para poder compartir.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleDownloadFlyer = async () => {
    if (!flyerImageUrl) {
      toast.error('No hay un flyer disponible para descargar.');
      return;
    }
    try {
      toast.loading('Generando descarga segura...');
      const response = await api.post('/cloudinary/signed-download-url', { publicId: flyerImageUrl });
      const { downloadUrl } = response.data;
      
      window.open(downloadUrl, '_blank');

      toast.dismiss();
      toast.success('Flyer descargado. ¡Sube esta imagen a tu historia!');
      setStep(2);
    } catch (error) {
      toast.dismiss();
      console.error("Error al generar la URL de descarga:", error);
      toast.error("No se pudo descargar el flyer. Intenta de nuevo.");
    }
  };

  const handleCopyLink = () => {
    if (!user?.username) return;
    const shareUrl = `https://sucht.com.ar/p/${user.username}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('¡Link copiado! Pégalo como "sticker de enlace" en tu historia.');
    setStep(3);
  };

  const handleConfirmShare = async () => {
    try {
      toast.loading('Confirmando...');
      await api.post('/point-transactions/social-share', { eventId });
      toast.dismiss();
      toast.success('¡Gracias por compartir! Has ganado puntos.');
      setIsModalOpen(false);
      setStep(1);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Ocurrió un error.');
    }
  };

  if (!isMobile) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center justify-center gap-2 w-full mt-6 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
      >
        <Instagram size={20} />
        Compartir en Instagram
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 text-zinc-500 hover:text-white">
              <X size={24}/>
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Compartir en Historias</h2>
            <p className="text-sm text-zinc-400 mb-6">Sigue estos pasos para compartir y ganar puntos. ¡Cada amigo que asista con tu link te dará más puntos!</p>
            
            <div className="space-y-4">
              <button
                onClick={handleDownloadFlyer}
                disabled={step !== 1}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-zinc-800 disabled:opacity-50"
              >
                <span className="font-semibold">Paso 1: Descargar Flyer</span>
                {step > 1 ? <CheckCircle className="text-green-500" /> : <Download />}
              </button>

              <button
                onClick={handleCopyLink}
                disabled={step !== 2}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-zinc-800 disabled:opacity-50"
              >
                <span className="font-semibold">Paso 2: Copiar Link de Referido</span>
                {step > 2 ? <CheckCircle className="text-green-500" /> : <LinkIcon />}
              </button>

              <button
                onClick={handleConfirmShare}
                disabled={step !== 3}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-green-600 text-white font-bold disabled:opacity-50 disabled:bg-zinc-700"
              >
                Paso 3: ¡Listo, ya lo compartí!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}