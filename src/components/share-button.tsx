'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Instagram } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function ShareButton({ eventId, eventTitle, flyerImageUrl }: { eventId: string, eventTitle: string, flyerImageUrl: string | null }) {
  const [isMobile, setIsMobile] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
    
    if (navigator.canShare && navigator.canShare({ files: [] })) {
      setCanShareFiles(true);
    }
  }, []);

  const handleShare = async () => {
    if (!user || !user.username) {
      toast.error('Debes iniciar sesión y tener un username para compartir.');
      return;
    }

    const shareUrl = `https://sucht.com.ar/p/${user.username}`;
    
    try {
      await api.post('/point-transactions/social-share', { eventId });
    } catch (error) {
      console.error('Error al otorgar puntos:', error);
    }

    if (flyerImageUrl && canShareFiles) {
      try {
        toast.loading('Preparando flyer...');
        const response = await fetch(flyerImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'flyer.jpg', { type: blob.type });

        await navigator.share({
          files: [file],
          title: `¡No te pierdas ${eventTitle} en SUCHT!`,
          text: `¡Conseguí tus entradas a través de mi link! ${shareUrl}`,
        });
        toast.dismiss();
        return;
      } catch (error) {
        console.error("Fallo al compartir el archivo, se usará el fallback:", error);
        toast.dismiss();
      }
    }
    
    try {
      await navigator.share({
        title: `¡No te pierdas ${eventTitle} en SUCHT!`,
        text: `¡Conseguí tus entradas a través de mi link!`,
        url: shareUrl,
      });
    } catch (error) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('¡Link de referido copiado al portapapeles!');
    }
  };

  if (!isMobile || typeof navigator.share === 'undefined') {
    return null;
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full mt-6 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
    >
      <Instagram size={20} />
      Compartir y Ganar Puntos
    </button>
  );
}