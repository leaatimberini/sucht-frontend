'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<any | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que el mini-infobar del navegador aparezca
      e.preventDefault();
      // Guardar el evento para poder dispararlo más tarde
      setInstallPrompt(e);
      
      // Si el usuario no ha descartado el banner antes, lo mostramos
      if (!localStorage.getItem('pwaInstallDismissed')) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Limpieza del evento al desmontar el componente
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Mostrar el diálogo de instalación del navegador
    installPrompt.prompt();

    // Esperar a que el usuario responda
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('El usuario aceptó instalar la PWA');
    } else {
      console.log('El usuario canceló la instalación de la PWA');
    }
    // Ocultamos el banner después del intento
    setIsVisible(false);
  };

  const handleDismiss = () => {
    // Guardamos la preferencia del usuario para no volver a mostrar el banner
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
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-down {
            animation: fade-in-down 0.5s ease-out forwards;
        }
       `}</style>
    </div>
  );
}