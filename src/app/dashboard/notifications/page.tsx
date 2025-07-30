import { NotificationSender } from "@/components/notification-sender";

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Enviar Notificaciones Push</h1>
      <p className="text-zinc-400 mb-8">
        Envía un mensaje a todos los usuarios que hayan activado las notificaciones.
      </p>
      <NotificationSender />
    </div>
  );
}
