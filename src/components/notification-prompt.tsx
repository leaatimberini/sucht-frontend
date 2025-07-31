// src/components/notification-prompt.tsx
'use client';

import { BellRing } from "lucide-react";

interface NotificationPromptProps {
  isSubscribed: boolean;
}

export function NotificationPrompt({ isSubscribed }: NotificationPromptProps) {
  // Si el usuario ya está suscrito, no mostramos nada.
  if (isSubscribed) {
    return null;
  }

  // Si no lo está, mostramos el recordatorio.
  return (
    <div className="bg-pink-500/10 border border-pink-500/30 text-pink-300 rounded-lg p-4 flex items-center gap-4 mb-8">
      <BellRing className="h-8 w-8 flex-shrink-0" />
      <div>
        <h3 className="font-bold">¡No te pierdas de nada!</h3>
        <p className="text-sm">
          Activa las notificaciones en la pestaña (Notificaciones) para recibir beneficios exclusivos, entradas gratis y saludos en tu cumpleaños.
        </p>
      </div>
    </div>
  );
}