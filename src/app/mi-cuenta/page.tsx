'use client';

import { AuthCheck } from "@/components/auth-check";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { Ticket } from "@/types/ticket.types";
import { User } from "@/types/user.types";
import { useEffect, useState } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { EditProfileForm } from "@/components/edit-profile-form";

function MisEntradas({ tickets }: { tickets: Ticket[] }) {
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
            <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold ${
              ticket.status === 'valid' ? 'bg-green-500/20 text-green-400' :
              ticket.status === 'used' ? 'bg-zinc-500/20 text-zinc-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {ticket.status === 'valid' && `LISTA PARA USAR (${ticket.redeemedCount}/${ticket.quantity})`}
              {ticket.status === 'partially_used' && `USADA PARCIALMENTE (${ticket.redeemedCount}/${ticket.quantity})`}
              {ticket.status === 'used' && `COMPLETAMENTE USADA`}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-zinc-500 text-center py-10">Aún no tienes ninguna entrada. ¡Pídesela a tu RRPP de confianza!</p>
    )
  );
}

export default function MiCuentaPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'profile'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser) return;
      setIsLoading(true);
      try {
        const [ticketsRes, userRes] = await Promise.all([
          api.get('/tickets/my-tickets'),
          // --- CORRECCIÓN: LLAMAMOS AL NUEVO ENDPOINT ---
          api.get('/users/profile/me') 
        ]);
        setTickets(ticketsRes.data);
        setUserData(userRes.data);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authUser]);

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-2">Hola, {authUser?.email.split('@')[0]}</h1>
        <p className="text-zinc-400 mb-8">Administra tus entradas y tu perfil.</p>

        <div className="border-b border-zinc-800 mb-8">
          <nav className="flex space-x-4">
            <button onClick={() => setActiveTab('tickets')} className={`py-2 px-4 ${activeTab === 'tickets' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Mis Entradas</button>
            <button onClick={() => setActiveTab('profile')} className={`py-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Editar Perfil</button>
          </nav>
        </div>

        {isLoading ? (
          <p className="text-zinc-500">Cargando...</p>
        ) : activeTab === 'tickets' ? (
          <MisEntradas tickets={tickets} />
        ) : (
          userData && <EditProfileForm user={userData} />
        )}
      </div>
    </AuthCheck>
  );
}