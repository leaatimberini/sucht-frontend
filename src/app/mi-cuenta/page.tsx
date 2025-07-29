'use client';

import { AuthCheck } from "@/components/auth-check";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { Ticket } from "@/types/ticket.types";
import { User } from "@/types/user.types";
import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { EditProfileForm } from "@/components/edit-profile-form";
import toast from "react-hot-toast";
import { PushNotificationManager } from "@/components/push-notification-manager";

// Sub-componente para la lógica de mostrar las entradas
function MisEntradas({ tickets, onConfirm }: { tickets: Ticket[], onConfirm: () => void }) {
  const handleConfirm = async (ticketId: string) => {
    try {
      await api.post(`/tickets/${ticketId}/confirm-attendance`);
      toast.success("¡Asistencia confirmada! Gracias.");
      onConfirm(); // Llama a la función para refrescar la lista
    } catch (error) {
      toast.error("No se pudo confirmar la asistencia.");
    }
  };

  return (
    tickets.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="bg-white p-4 rounded-lg"><QRCodeSVG value={ticket.id} size={160} /></div>
            <h2 className="text-2xl font-bold text-white mt-6">{ticket.event.title}</h2>
            <p className="text-pink-500 font-semibold">{ticket.tier.name} (x{ticket.quantity})</p>
            <p className="text-zinc-400 text-sm mt-2">{new Date(ticket.event.startDate).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })} hs.</p>
            {ticket.tier.validUntil && (<p className="text-xs text-yellow-400 mt-1">Válido hasta: {new Date(ticket.tier.validUntil).toLocaleString('es-AR', {dateStyle: 'short', timeStyle: 'short'})} hs.</p>)}
            
            {ticket.event.confirmationSentAt && !ticket.confirmedAt ? (
              <button onClick={() => handleConfirm(ticket.id)} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg">
                Confirmar Asistencia
              </button>
            ) : (
              <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold ${
                ticket.status === 'valid' ? 'bg-green-500/20 text-green-400' :
                ticket.status === 'used' ? 'bg-zinc-500/20 text-zinc-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {ticket.status === 'valid' && `LISTA PARA USAR (${ticket.redeemedCount}/${ticket.quantity})`}
                {ticket.status === 'partially_used' && `USADA PARCIALMENTE (${ticket.redeemedCount}/${ticket.quantity})`}
                {ticket.status === 'used' && `COMPLETAMENTE USADA`}
              </div>
            )}
            {ticket.confirmedAt && <p className="text-xs text-green-400 mt-1">Asistencia confirmada.</p>}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-zinc-500 text-center py-10">Aún no tienes ninguna entrada. ¡Pídesela a tu RRPP de confianza!</p>
    )
  );
}

export default function MiCuentaPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'profile' | 'notifications'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authUser = useAuthStore((state) => state.user);

  const fetchData = useCallback(async () => {
    if (!authUser) return;
    setIsLoading(true);
    try {
      const [ticketsRes, userRes] = await Promise.all([
        api.get('/tickets/my-tickets'),
        api.get('/users/profile/me')
      ]);
      setTickets(ticketsRes.data);
      setUserData(userRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-2">Hola, {authUser?.email.split('@')[0]}</h1>
        <p className="text-zinc-400 mb-8">Administra tus entradas, tu perfil y notificaciones.</p>

        <div className="border-b border-zinc-800 mb-8">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto">
            <button onClick={() => setActiveTab('tickets')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'tickets' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Mis Entradas</button>
            <button onClick={() => setActiveTab('profile')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'profile' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Editar Perfil</button>
            <button onClick={() => setActiveTab('notifications')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'notifications' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Notificaciones</button>
          </nav>
        </div>

        {isLoading ? (
          <p className="text-zinc-500">Cargando...</p>
        ) : (
          <>
            {activeTab === 'tickets' && <MisEntradas tickets={tickets} onConfirm={fetchData} />}
            {activeTab === 'profile' && userData && <EditProfileForm user={userData} />}
            {activeTab === 'notifications' && (
              <div className="max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-white mb-4">Configuración de Notificaciones</h2>
                <p className="text-zinc-400 mb-6">Activa las notificaciones para no perderte ninguna novedad, recordatorios de eventos y más.</p>
                <PushNotificationManager />
              </div>
            )}
          </>
        )}
      </div>
    </AuthCheck>
  );
}
