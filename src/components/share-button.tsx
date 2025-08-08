// frontend/src/components/share-button.tsx
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Share2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function ShareButton({ eventId, eventTitle }: { eventId: string, eventTitle: string }) {
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // Detectamos si el código se ejecuta en un navegador y si es un dispositivo móvil
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
  }, []);

  const handleShare = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para ganar puntos por compartir.');
      return;
    }
    if (!user.username) {
      toast.error('Debes configurar tu nombre de usuario en "Mi Cuenta" para poder compartir.');
      return;
    }

    // Usamos el link de referido personal del usuario
    const shareUrl = `https://sucht.com.ar/p/${user.username}`;
    
    try {
      // 1. Otorgamos los puntos al usuario por la acción de compartir
      await api.post('/point-transactions/social-share', { eventId });

      // 2. Intentamos usar la API de Share nativa del navegador
      if (navigator.share) {
        await navigator.share({
          title: `¡No te pierdas ${eventTitle} en SUCHT!`,
          text: `¡Conseguí tus entradas a través de mi link!`,
          url: shareUrl,
        });
        toast.success('¡Gracias por compartir!');
      } else {
        // Fallback: Si la API de Share no está disponible, copiamos al portapapeles
        navigator.clipboard.writeText(shareUrl);
        toast.success('¡Tu link de referido fue copiado al portapapeles!');
      }
    } catch (error) {
      console.error('Error al compartir o dar puntos:', error);
      navigator.clipboard.writeText(shareUrl);
      toast.error('No se pudieron otorgar los puntos, ¡pero puedes compartir el enlace!');
    }
  };

  // No renderizamos el botón si no estamos en un dispositivo móvil o si el usuario no tiene username
  if (!isMobile || !user?.username) {
    return null;
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
    >
      <Share2 size={20} />
      Compartir y Ganar Puntos
    </button>
  );
}