'use client';

import { AuthCheck } from "@/components/auth-check";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { Ticket } from "@/types/ticket.types";
import { User } from "@/types/user.types";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { NotificationPrompt } from "@/components/notification-prompt";
import { Gift, Ticket as TicketIcon } from "lucide-react";

// Importamos los nuevos componentes de cada pestaña
import { MisEntradasTab } from "./components/MisEntradasTab";
import { MisPremiosTab } from "./components/MisPremiosTab";
import { EditarPerfilTab } from "./components/EditarPerfilTab";
import { NotificacionesTab } from "./components/NotificacionesTab";

// Los tipos ahora pueden vivir aquí o en un archivo centralizado de tipos
type UserProfile = User & { isPushSubscribed?: boolean; points?: number };
interface Reward { id: string; name: string; description: string | null; pointsCost: number; stock: number | null; isActive: boolean; }
interface UserReward { id: string; reward: Reward; redeemedAt: string | null; createdAt: string; }

export default function MiCuentaPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'rewards' | 'profile' | 'notifications'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<{ isRewardsStoreEnabled?: boolean }>({}); // Estado para la configuración
  const authUser = useAuthStore((state) => state.user);

  const fetchData = useCallback(async () => {
    if (!authUser) return;
    setIsLoading(true);
    try {
      const [ticketsRes, userRes, rewardsRes, userRewardsRes, configRes] = await Promise.all([
        api.get('/tickets/my-tickets'),
        api.get('/users/profile/me'),
        api.get('/rewards'),
        api.get('/rewards/my-rewards'),
        api.get('/configuration'), // Se añade la llamada a la configuración
      ]);
      setTickets(ticketsRes.data);
      setUserData(userRes.data);
      setRewards(rewardsRes.data.filter((r: Reward) => r.isActive));
      setUserRewards(userRewardsRes.data);
      setConfig(configRes.data); // Se guarda la configuración
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("No se pudieron cargar todos tus datos.");
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
        <h1 className="text-4xl font-bold text-white mb-2">Hola, {userData?.name || authUser?.email.split('@')[0]}</h1>
        <p className="text-zinc-400 mb-8">Administra tus entradas, tu perfil y notificaciones.</p>
        
        {userData && <NotificationPrompt isSubscribed={!!userData.isPushSubscribed} />}

        <div className="border-b border-zinc-800 mb-8">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto">
            <button onClick={() => setActiveTab('tickets')} className={`py-2 px-4 whitespace-nowrap flex items-center gap-2 ${activeTab === 'tickets' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}><TicketIcon size={16} /> Mis Entradas</button>
            
            {/* RENDERIZADO CONDICIONAL DE LA PESTAÑA PREMIOS */}
            {config.isRewardsStoreEnabled && (
              <button onClick={() => setActiveTab('rewards')} className={`py-2 px-4 whitespace-nowrap flex items-center gap-2 ${activeTab === 'rewards' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}><Gift size={16} /> Premios</button>
            )}
            
            <button onClick={() => setActiveTab('profile')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'profile' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Editar Perfil</button>
            <button onClick={() => setActiveTab('notifications')} className={`py-2 px-4 whitespace-nowrap ${activeTab === 'notifications' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Notificaciones</button>
          </nav>
        </div>

        {isLoading ? (
          <p className="text-zinc-500 text-center py-10">Cargando...</p>
        ) : (
          <>
            {activeTab === 'tickets' && <MisEntradasTab tickets={tickets} onConfirm={fetchData} />}
            {activeTab === 'rewards' && userData && config.isRewardsStoreEnabled && <MisPremiosTab user={userData} rewards={rewards} userRewards={userRewards} onRedeem={fetchData} />}
            {activeTab === 'profile' && userData && <EditarPerfilTab user={userData} />}
            {activeTab === 'notifications' && <NotificacionesTab />}
          </>
        )}
      </div>
    </AuthCheck>
  );
}