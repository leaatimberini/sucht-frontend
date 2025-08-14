'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { BellRing, BellOff, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

// Función para convertir la clave VAPID de base64url a un Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function SubscriptionManager() {
  const user = useAuthStore((state) => state.user);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

  // Función para comprobar el estado actual de la suscripción
  const checkSubscription = useCallback(async () => {
    if ('serviceWorker' in navigator && user) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      if (!!subscription !== user.isPushSubscribed) {
          // Si hay discrepancia, actualizamos el estado del backend (esto puede pasar si el usuario limpia cookies)
          api.get('/users/profile/me'); // Llama para sincronizar el estado
      }
    }
  }, [user]);

  useEffect(() => {
    setPermissionStatus(Notification.permission);
    checkSubscription();
  }, [checkSubscription]);

  // Mostrar el banner solo si el permiso es 'default' y el usuario no lo ha cerrado
  useEffect(() => {
    if (permissionStatus === 'default' && !sessionStorage.getItem('subscriptionBannerDismissed')) {
      setIsBannerVisible(true);
    }
  }, [permissionStatus]);

  const handleSubscribe = async () => {
    if (!VAPID_PUBLIC_KEY) {
      toast.error("Las claves de notificación no están configuradas.");
      return;
    }
    if (!user) {
        toast.error("Debes iniciar sesión para suscribirte.");
        return;
    }
    
    const registration = await navigator.serviceWorker.ready;
    try {
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        
        await api.post('/notifications/subscribe', subscription);
        toast.success('¡Suscripción a notificaciones activada!');
        setIsSubscribed(true);
        setIsBannerVisible(false);
    } catch (error) {
        console.error("Error al suscribirse:", error);
        toast.error('No se pudo activar la suscripción.');
        if(Notification.permission === 'denied') {
            setPermissionStatus('denied');
            setIsBannerVisible(false);
        }
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('subscriptionBannerDismissed', 'true');
    setIsBannerVisible(false);
  };
  
  if (!user || !isBannerVisible) return null;

  if (permissionStatus === 'default') {
    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up">
            <div className="bg-zinc-800 border border-zinc-700 text-white rounded-lg shadow-lg flex items-center justify-between w-full max-w-lg mx-auto p-4">
                <div className="flex items-center gap-3">
                    <BellRing className="text-pink-400"/>
                    <div>
                        <p className="font-semibold">¡No te pierdas de nada!</p>
                        <p className="text-sm text-zinc-400">Activa las notificaciones para recibir beneficios y novedades.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleSubscribe} className="bg-pink-600 hover:bg-pink-700 font-bold text-sm px-4 py-2 rounded-md">Activar</button>
                    <button onClick={handleDismiss} className="p-2 rounded-md hover:bg-zinc-700"><X size={18} /></button>
                </div>
            </div>
        </div>
    );
  }

  if (permissionStatus === 'denied') {
    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up">
            <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-300 rounded-lg shadow-lg flex items-center gap-3 w-full max-w-lg mx-auto p-4">
                <BellOff/>
                <p className="text-sm">Has bloqueado las notificaciones. Para activarlas, debes cambiar los permisos en la configuración de tu navegador.</p>
                <button onClick={handleDismiss} className="p-2 rounded-md hover:bg-yellow-400/20 ml-auto"><X size={18} /></button>
            </div>
        </div>
    );
  }

  return null;
}