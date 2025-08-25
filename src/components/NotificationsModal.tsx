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
function NotificationDetailView({ notification, onClose, onBack, onDelete }: { notification: Notification, onClose: () => void, onBack: () => void, onDelete: (id: string) => void }) {
    
    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
            await onDelete(notification.id);
        }
    };

    const handleFeedback = async (feedback: 'like' | 'dislike') => {
        try {
            await api.post(`/notifications/${notification.id}/feedback`, { feedback });
            toast.success('¡Gracias por tu feedback!');
        } catch (error) {
            toast.error('No se pudo enviar el feedback.');
        }
    };
    
    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-700">
                <button onClick={onBack} className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800">
                    <ArrowLeft size={20}/>
                </button>
                <h4 className="font-semibold text-white">Detalle</h4>
                <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800">
                    <X size={20}/>
                </button>
            </div>

            <div className="flex-grow overflow-y-auto">
                <h5 className="font-bold text-white">{notification.title}</h5>
                <p className="text-xs text-zinc-500 mt-1 mb-4">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                </p>
                <p className="text-zinc-300 text-sm">{notification.body}</p>
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-700 flex justify-between items-center flex-shrink-0">
                <div className="flex gap-2">
                    <button onClick={() => handleFeedback('like')} className="p-2 rounded-full hover:bg-green-500/20 text-zinc-400 hover:text-green-400"><ThumbsUp size={20}/></button>
                    <button onClick={() => handleFeedback('dislike')} className="p-2 rounded-full hover:bg-red-500/20 text-zinc-400 hover:text-red-400"><ThumbsDown size={20}/></button>
                </div>
                <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-semibold"><Trash2 size={16}/> Eliminar</button>
            </div>
        </div>
    )
}


// --- COMPONENTE PRINCIPAL DEL MODAL ---
export function NotificationsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { notifications, isLoading, markAsRead, unreadCount, removeNotification } = useNotificationStore();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      const timer = setTimeout(() => { markAsRead(unreadIds); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, unreadCount, notifications, markAsRead]);

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      removeNotification(id);
      toast.success('Notificación eliminada.');
      setSelectedNotification(null);
    } catch (error) {
      toast.error('No se pudo eliminar la notificación.');
    }
  };

  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-lg h-[70vh] flex flex-col">
            
            {selectedNotification ? (
                <NotificationDetailView 
                    notification={selectedNotification} 
                    onClose={onClose}
                    onBack={() => setSelectedNotification(null)}
                    onDelete={handleDeleteNotification}
                />
            ) : (
                <>
                    <div className="p-4 border-b border-zinc-700 flex-shrink-0 flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-white">Notificaciones</h3>
                        <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800">
                            <X size={20}/>
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center p-8 h-full"><Loader2 className="animate-spin text-pink-500"/></div>
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
                </>
            )}
        </div>
        <style jsx>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.2s ease-out forwards;
            }
        `}</style>
    </div>
  );
}