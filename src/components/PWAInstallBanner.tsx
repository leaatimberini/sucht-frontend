'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<any | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      if (!localStorage.getItem('pwaInstallDismissed')) {
        setIsVisible(true);
      }
    };

    if (!isIOSDevice) {
        // Solo añadimos el listener si el navegador es compatible
        if ('onbeforeinstallprompt' in window) {
            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        } else {
            console.log("PWA install prompt not supported by this browser.");
        }
    } else {
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
        if (!isInStandaloneMode && !localStorage.getItem('pwaInstallDismissed')) {
            setIsVisible(true);
        }
    }

    return () => {
      if ('onbeforeinstallprompt' in window) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    // Opcional: puedes registrar el resultado
    if (outcome === 'accepted') {
      console.log('User accepted the PWA installation');
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwaInstallDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center p-2">
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg shadow-lg flex items-center justify-between w-full max-w-2xl p-3 animate-fade-in-up">
            <div className="flex items-center gap-3">
                <Download size={24}/>
                <div>
                    <p className="font-semibold text-sm">¡Lleva a SUCHT contigo!</p>
                    {isIos ? (
                        <p className="text-xs">Toca el ícono <Share size={12} className="inline-block mx-1"/> y luego &quot;Agregar a la pantalla de inicio&quot;.</p>
                    ) : (
                        <p className="text-xs">Instala la app en tu dispositivo para una mejor experiencia.</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {!isIos && (
                  <button 
                      onClick={handleInstallClick} 
                      className="bg-white text-pink-600 font-bold text-xs px-4 py-1.5 rounded-md hover:bg-zinc-200 transition-colors"
                  >
                      Instalar
                  </button>
                )}
                <button onClick={handleDismiss} className="p-1.5 rounded-md hover:bg-white/20 transition-colors">
                    <X size={18} />
                </button>
            </div>
       </div>
       <style jsx>{`
         @keyframes fade-in-up {
             from { opacity: 0; transform: translateY(20px); }
             to { opacity: 1; transform: translateY(0); }
         }
         .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
       `}</style>
    </div>
  );
}