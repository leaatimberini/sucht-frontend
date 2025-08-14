'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<any | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      if (!localStorage.getItem('pwaInstallDismissed')) {
        setIsVisible(true);
      }
    };

    // --- CORRECCIÓN CLAVE ---
    // Verificamos si el navegador soporta el evento ANTES de añadir el listener.
    // Esto previene errores en navegadores no compatibles como Safari en iOS.
    const isSupported = 'onbeforeinstallprompt' in window;
    if (isSupported) {
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    } else {
        console.log("PWA install prompt not supported by this browser.");
    }

    return () => {
      // Nos aseguramos de solo intentar remover el listener si fue añadido.
      if (isSupported) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA installation');
    } else {
      console.log('User dismissed the PWA installation');
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
    <div className="fixed top-20 left-0 right-0 z-50 flex justify-center p-2">
       <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg shadow-lg flex items-center justify-between w-full max-w-2xl p-3 animate-fade-in-down">
            <div className="flex items-center gap-3">
                <Download size={24}/>
                <p className="font-semibold text-sm">¡Lleva a SUCHT contigo! Instala la App.</p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleInstallClick} 
                    className="bg-white text-pink-600 font-bold text-xs px-4 py-1.5 rounded-md hover:bg-zinc-200 transition-colors"
                >
                    Instalar
                </button>
                <button onClick={handleDismiss} className="p-1.5 rounded-md hover:bg-white/20 transition-colors">
                    <X size={18} />
                </button>
            </div>
       </div>
       <style jsx>{`
        @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
       `}</style>
    </div>
  );
}