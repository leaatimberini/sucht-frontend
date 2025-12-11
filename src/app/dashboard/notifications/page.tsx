'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Bell, Loader2, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { NotificationSender } from '@/components/notification-sender';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';
import { formatDate } from '@/lib/date-utils';

// --- TIPOS DE DATOS ---
interface NotificationHistoryItem {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    likes: number;
    dislikes: number;
}

interface AppConfig {
    notifications_newEvent_enabled?: boolean;
    notifications_birthday_enabled?: boolean;
    notifications_raffle_enabled?: boolean;
}

// --- SUB-COMPONENTE: INTERRUPTOR DE CONFIGURACIÓN (CORREGIDO) ---
function AutomationToggle({ label, configKey, initialValue, onToggle }: { label: string; configKey: string; initialValue: boolean; onToggle: (key: string, value: boolean) => void }) {
    const [isEnabled, setIsEnabled] = useState(initialValue);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setIsEnabled(newValue);
        setIsSaving(true);
        try {
            // --- CORRECCIÓN CLAVE ---
            // Creamos un FormData para asegurar el formato correcto de la petición
            const formData = new FormData();
            formData.append(configKey, String(newValue));

            await api.patch('/configuration', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // --- FIN DE LA CORRECCIÓN ---

            toast.success(`'${label}' ${newValue ? 'activada' : 'desactivada'}.`);
            onToggle(configKey, newValue);
        } catch {
            toast.error('No se pudo guardar el cambio.');
            setIsEnabled(!newValue);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-md">
            <label htmlFor={configKey} className="text-sm font-medium text-zinc-300">{label}</label>
            <div className="flex items-center gap-2">
                {isSaving && <Loader2 className="animate-spin h-4 w-4" />}
                <label htmlFor={configKey} className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id={configKey} checked={isEnabled} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
            </div>
        </div>
    );
}


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function NotificationsPage() {
    const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
    const [config, setConfig] = useState<AppConfig>({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [historyRes, configRes] = await Promise.all([
                api.get('/notifications/history'),
                api.get('/configuration')
            ]);
            setHistory(historyRes.data);
            setConfig(configRes.data);
        } catch (error) {
            toast.error("No se pudieron cargar los datos de notificaciones.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggle = (key: string, value: boolean) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER]}>
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Bell className="text-pink-400" />
                        Gestión de Notificaciones
                    </h1>
                    <p className="text-zinc-400">Controla las notificaciones automáticas, envía mensajes masivos y mide su impacto.</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Notificaciones Automáticas</h2>
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                        <div className="space-y-3">
                            <AutomationToggle label="Notificar sobre nuevos eventos" configKey="notifications_newEvent_enabled" initialValue={!!config.notifications_newEvent_enabled} onToggle={handleToggle} />
                            <AutomationToggle label="Notificar inicio de semana de cumpleaños" configKey="notifications_birthday_enabled" initialValue={!!config.notifications_birthday_enabled} onToggle={handleToggle} />
                            <AutomationToggle label="Notificar ganador del sorteo semanal" configKey="notifications_raffle_enabled" initialValue={!!config.notifications_raffle_enabled} onToggle={handleToggle} />
                        </div>
                    )}
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-2">Envío Manual Masivo</h2>
                    <p className="text-zinc-400 mb-4">Envía un mensaje a todos los usuarios que hayan activado las notificaciones.</p>
                    <NotificationSender />
                </div>

                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-white mb-4">Historial y Métricas de Feedback</h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-zinc-700">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-white">Fecha</th>
                                    <th className="p-4 text-sm font-semibold text-white">Título</th>
                                    <th className="p-4 text-sm font-semibold text-white text-center">Likes 👍</th>
                                    <th className="p-4 text-sm font-semibold text-white text-center">Dislikes 👎</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={4} className="text-center p-6 text-zinc-400"><Loader2 className="animate-spin mx-auto" /></td></tr>
                                ) : history.map((notif) => (
                                    <tr key={notif.id} className="border-b border-zinc-800 last:border-b-0">
                                        <td className="p-4 text-zinc-400 text-sm">{formatDate(notif.createdAt, 'dd/MM/yy HH:mm')}hs</td>
                                        <td className="p-4"><p className="font-semibold text-zinc-200">{notif.title}</p><p className="text-sm text-zinc-500">{notif.body}</p></td>
                                        <td className="p-4 font-bold text-green-400 text-center">{notif.likes}</td>
                                        <td className="p-4 font-bold text-red-400 text-center">{notif.dislikes}</td>
                                    </tr>
                                ))}
                                {history.length === 0 && !isLoading && (
                                    <tr><td colSpan={4} className="text-center p-6 text-zinc-500">No hay notificaciones enviadas.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthCheck>
    );
}