// src/app/mi-cuenta/components/NotificacionesTab.tsx
'use client';

import { PushNotificationManager } from "@/components/push-notification-manager";

export function NotificacionesTab() {
  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Configuración de Notificaciones</h2>
      <p className="text-zinc-400 mb-6">Activa las notificaciones para no perderte ninguna novedad, recordatorios de eventos y más.</p>
      <PushNotificationManager />
    </div>
  );
}