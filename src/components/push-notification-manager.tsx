'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { BellRing } from 'lucide-react';

// Función auxiliar para convertir la clave VAPID a un formato que el navegador entiende
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Comprobamos si el usuario ya está suscrito cuando el componente se carga
    navigator.serviceWorker.ready.then(registration => {
      registration.pushManager.getSubscription().then(subscription => {
        if (subscription) {
          setIsSubscribed(true);
        }
        setIsLoading(false);
      });
    });
  }, []);

  const handleSubscribe = async () => {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      toast.error("La clave de notificación no está configurada.");
      return;
    }
    
    // Pedimos permiso al usuario
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.error('Has denegado los permisos de notificación.');
      return;
    }

    // Obtenemos la suscripción del navegador
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    });

    try {
      // Enviamos la suscripción a nuestro backend para guardarla
      await api.post('/notifications/subscribe', subscription);
      toast.success('¡Notificaciones activadas!');
      setIsSubscribed(true);
    } catch (error) {
      toast.error('No se pudieron activar las notificaciones.');
    }
  };

  if (isLoading) {
    return null; // No mostramos nada mientras se comprueba el estado
  }

  if (isSubscribed) {
    return <p className='text-sm text-green-400'>✓ Notificaciones activadas.</p>;
  }

  return (
    <button
      onClick={handleSubscribe}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2"
    >
      <BellRing className="h-5 w-5" />
      <span>Activar Notificaciones</span>
    </button>
  );
}