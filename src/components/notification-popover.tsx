'use client';

import { useNotificationStore } from "@/stores/notification-store";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { es } from 'date-fns/locale';
import { BellRing, Loader2, X, Trash2, ThumbsUp, ThumbsDown, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Notification } from "@/types/notification.types";

// --- SUB-COMPONENTE: VISTA DE DETALLE ---
function NotificationDetailView({ notification, onClose }: { notification: Notification, onClose: () => void }) {
    const { fetchNotifications } = useNotificationStore();

    const handleDelete = async () => {
        if (!window.confirm('¿Seguro que quieres eliminar esta notificación?')) return;
        try {
            await api.delete(`/notifications/${notification.id}`);
            toast.success('Notificación eliminada.');
            fetchNotifications(); // Recargamos la lista
            onClose(); // Cerramos el detalle
        } catch (error) {
            toast.error('No se pudo eliminar la notificación.');
        }
    }

    const handleFeedback = async (feedback: 'like' | 'dislike') => {
        try {
            await api.post(`/notifications/${notification.id}/feedback`, { feedback });
            toast.success('¡Gracias por tu feedback!');
            // Opcional: podrías querer actualizar el estado local para reflejar el voto al instante
        } catch (error) {
            toast.error('No se pudo enviar el feedback.');
        }
    }

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="border-b border-zinc-700 pb-3">
                <h4 className="font-bold text-white">{notification.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                </p>
            </div>
            <div className="py-4 text-zinc-300 text-sm flex-grow overflow-y-auto">
                <p>{notification.body}</p>
            </div>
            <div className="mt-auto pt-4 border-t border-zinc-700 flex justify-between items-center flex-shrink-0">
                <div className="flex gap-2">
                    <button onClick={() => handleFeedback('like')} className="p-2 rounded-full hover:bg-green-500/20 text-zinc-400 hover:text-green-400 transition-colors"><ThumbsUp size={20}/></button>
                    <button onClick={() => handleFeedback('dislike')} className="p-2 rounded-full hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"><ThumbsDown size={20}/></button>
                </div>
                <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-semibold"><Trash2 size={16}/> Eliminar</button>
            </div>
        </div>
    )
}


// --- COMPONENTE PRINCIPAL ---
export function NotificationPopover({ onClose }: { onClose: () => void }) {
  const { notifications, isLoading, markAsRead, unreadCount } = useNotificationStore();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      const timer = setTimeout(() => {
        markAsRead(unreadIds);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, notifications, markAsRead]);

  // Si hay una notificación seleccionada, mostramos solo la vista de detalle.
  if (selectedNotification) {
    return (
        <div className="fixed inset-0 sm:absolute top-0 sm:top-16 right-0 bg-zinc-900 shadow-lg sm:rounded-lg text-white w-full sm:w-80 sm:max-w-sm z-50 border border-zinc-700 h-full sm:h-auto sm:max-h-[500px] flex flex-col">
            <div className="p-3 border-b border-zinc-700 flex-shrink-0 flex items-center gap-2">
                <button onClick={() => setSelectedNotification(null)} className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800">
                    <ArrowLeft size={20}/>
                </button>
                <h3 className="font-semibold text-white">Detalle</h3>
            </div>
            <NotificationDetailView notification={selectedNotification} onClose={() => setSelectedNotification(null)} />
        </div>
    )
  }
  
  // Vista de la lista principal
  return (
    <div className="fixed inset-0 sm:absolute top-0 sm:top-16 right-0 bg-zinc-900 shadow-lg sm:rounded-lg text-white w-full sm:w-80 sm:max-w-sm z-50 border border-zinc-700 h-full sm:h-auto sm:max-h-[500px] flex flex-col">
      <div className="p-4 border-b border-zinc-700 flex-shrink-0 flex justify-between items-center">
        <h3 className="font-semibold">Notificaciones</h3>
        {/* --- BOTÓN DE CERRAR AÑADIDO (visible en móvil) --- */}
        <button onClick={onClose} className="sm:hidden text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800">
            <X size={20}/>
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-8 h-full">
             <Loader2 className="animate-spin text-pink-500"/>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 text-zinc-500 flex flex-col items-center justify-center h-full">
            <BellRing size={32} className="mx-auto mb-2"/>
            <p>No tienes notificaciones.</p>
          </div>
        ) : (
          <ul>
            {notifications.map(n => (
              <li key={n.id} onClick={() => setSelectedNotification(n)} className={`border-b border-zinc-800 p-4 cursor-pointer hover:bg-zinc-800 ${!n.isRead ? 'bg-pink-500/5' : ''}`}>
                <div className="flex items-start gap-3">
                  {!n.isRead && <div className="w-2.5 h-2.5 rounded-full bg-pink-500 mt-1.5 flex-shrink-0"></div>}
                  <div className="flex-grow">
                    <p className={`font-semibold ${!n.isRead ? 'text-white' : 'text-zinc-300'}`}>{n.title}</p>
                    <p className="text-sm text-zinc-400 line-clamp-2">{n.body}</p>
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