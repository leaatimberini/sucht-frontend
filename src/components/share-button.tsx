'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Instagram } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function ShareButton({ eventId, eventTitle, flyerImageUrl }: { eventId: string, eventTitle: string, flyerImageUrl: string | null }) {
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
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
    if (!flyerImageUrl) {
      toast.error('No hay un flyer disponible para compartir para este evento.');
      return;
    }

    const shareUrl = `https://sucht.com.ar/p/${user.username}`;
    const stickerUrl = "https://res.cloudinary.com/di4ikaeke/image/upload/v1754630226/yovoyaSUCHT_uh23kb.png";
    
    try {
      toast.loading('Preparando historia...');
      await api.post('/point-transactions/social-share', { eventId });

      navigator.clipboard.writeText(shareUrl);
      toast.dismiss();
      toast.success('¡Link copiado! Pégalo como sticker en tu historia.');

      const instagramUrl = `instagram-stories://share?source_application=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&sticker_asset_uri=${encodeURIComponent(stickerUrl)}&background_asset_uri=${encodeURIComponent(flyerImageUrl)}`;
      
      window.location.href = instagramUrl;

    } catch (error) {
      toast.dismiss();
      console.error('Error al compartir o dar puntos:', error);
      toast.error('No se pudo abrir Instagram. ¡Inténtalo de nuevo desde tu celular!');
    }
  };

  if (!isMobile) {
    return null;
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full mt-6 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
    >
      <Instagram size={20} />
      Compartir en Instagram
    </button>
  );
}