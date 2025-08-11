'use client';

import { useNotificationStore } from "@/stores/notification-store";
import { useEffect } from "react";
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { es } from 'date-fns/locale';
import { BellRing, Loader2 } from "lucide-react";

export function NotificationPopover() {
  const { notifications, isLoading, markAsRead, unreadCount } = useNotificationStore();

  useEffect(() => {
    // Cuando el popover se monta y hay notificaciones sin leer, las marcamos como leídas
    if (unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      // Pequeño delay para que el usuario vea la transición del contador
      const timer = setTimeout(() => {
        markAsRead(unreadIds);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, notifications, markAsRead]);

  return (
    <div className="absolute top-16 right-0 bg-zinc-900 shadow-lg rounded-lg text-white w-80 max-w-sm z-50 border border-zinc-700">
      <div className="p-4 border-b border-zinc-700">
        <h3 className="font-semibold">Notificaciones</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
             <Loader2 className="animate-spin text-pink-500"/>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 text-zinc-500">
            <BellRing size={32} className="mx-auto mb-2"/>
            <p>No tienes notificaciones nuevas.</p>
          </div>
        ) : (
          <ul>
            {notifications.map(n => (
              <li key={n.id} className={`border-b border-zinc-800 p-4 ${!n.isRead ? 'bg-pink-500/10' : ''}`}>
                <div className="flex items-start gap-3">
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 flex-shrink-0"></div>}
                  <div className="flex-grow">
                    <p className="font-semibold text-zinc-200">{n.title}</p>
                    <p className="text-sm text-zinc-400">{n.body}</p>
                    <p className="text-xs text-zinc-500 mt-2">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}