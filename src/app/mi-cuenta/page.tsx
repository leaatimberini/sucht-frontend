'use client';

import { AuthCheck } from "@/components/auth-check";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { Ticket } from "@/types/ticket.types";
import { User } from "@/types/user.types";
import { Event } from "@/types/event.types";
import { Reward, UserReward } from "@/types/reward.types";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { NotificationPrompt } from "@/components/notification-prompt";
import { Gift, Ticket as TicketIcon, History as HistoryIcon, Edit, Bell, ShoppingBag, ShieldCheck } from "lucide-react"; 
import { MisEntradasTab } from "./components/MisEntradasTab";
import { MisPremiosTab } from "./components/MisPremiosTab";
import { EditarPerfilTab } from "./components/EditarPerfilTab";
import { NotificacionesTab } from "./components/NotificacionesTab";
import { HistoryTab } from "./components/HistoryTab";
import { UsernamePrompt } from "./components/UsernamePrompt";
import { BirthdayBenefitCard } from "./components/BirthdayBenefitCard";
import { MisProductosTab } from "./components/MisProductosTab"; 
import { ProductPurchase } from "@/types/product-purchase.types";

export type UserProfile = User & { 
  isPushSubscribed?: boolean; 
  points?: number;
  isBirthdayWeek?: boolean;
  loyalty?: {
    currentLevel: string;
    nextLevel: string | null;
    progressPercentage: number;
    pointsToNextLevel: number;
  }
};

function LoyaltyProgressBar({ user }: { user: UserProfile }) {
  if (!user.loyalty) return null;

  const { currentLevel, nextLevel, progressPercentage, pointsToNextLevel } = user.loyalty;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="text-amber-400" />
          Nivel de Lealtad: <span className="text-amber-400">{currentLevel}</span>
        </h3>
        <p className="text-sm font-bold text-white">{user.points} <span className="font-normal text-zinc-400">Puntos</span></p>
      </div>
      
      {nextLevel ? (
        <>
          <div className="w-full bg-zinc-700 rounded-full h-2.5">
            <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="text-xs text-zinc-400 mt-2 text-right">
            Te faltan {pointsToNextLevel} puntos para alcanzar el nivel {nextLevel}
          </p>
        </>
      ) : (
        <p className="text-sm text-amber-400">¡Has alcanzado el nivel máximo!</p>
      )}
    </div>
  );
}

export default function MiCuentaPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'products' | 'rewards' | 'profile' | 'notifications' | 'history'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [productPurchases, setProductPurchases] = useState<ProductPurchase[]>([]);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<{ isRewardsStoreEnabled?: boolean }>({});
  const authUser = useAuthStore((state) => state.user);

  const fetchData = useCallback(async () => {
    if (!authUser) return;
    setIsLoading(true);
    try {
      const [ticketsRes, userRes, rewardsRes, userRewardsRes, configRes, productPurchasesRes] = await Promise.all([
        api.get('/tickets/my-tickets'),
        api.get('/users/profile/me'),
        api.get('/rewards'),
        api.get('/rewards/my-rewards'),
        api.get('/configuration'),
        api.get('/store/purchase/my-products'),
      ]);
      setTickets(ticketsRes.data);
      setUserData(userRes.data);
      setRewards(rewardsRes.data.filter((r: Reward) => r.isActive));
      setUserRewards(userRewardsRes.data);
      setConfig(configRes.data);
      setProductPurchases(productPurchasesRes.data);
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
        <p className="text-zinc-400 mb-8">Administra tus entradas, premios, perfil y notificaciones.</p>
        
        {/* LÓGICA AGREGADA: Renderiza la barra de progreso si hay datos de usuario */}
        {userData && <LoyaltyProgressBar user={userData} />}
        
        {userData?.isBirthdayWeek && (
          <div className="mb-8">
            <BirthdayBenefitCard />
          </div>
        )}
        
        <UsernamePrompt />
        {userData && <NotificationPrompt isSubscribed={!!userData.isPushSubscribed} />}

        <div className="border-b border-zinc-800 mb-8">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto">
            <button onClick={() => setActiveTab('tickets')} className={`py-2 px-4 whitespace-nowrap flex items-center gap-2 ${activeTab === 'tickets' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}><TicketIcon size={16} /> Mis Entradas</button>
            <button onClick={() => setActiveTab('products')} className={`py-2 px-4 whitespace-nowrap flex items-center gap-2 ${activeTab === 'products' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}><ShoppingBag size={16} /> Mis Productos</button>
            {config.isRewardsStoreEnabled && (
              <button onClick={() => setActiveTab('rewards')} className={`py-2 px-4 whitespace-nowrap flex items-center gap-2 ${activeTab === 'rewards' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}><Gift size={16} /> Premios</button>
            )}
            <button onClick={() => setActiveTab('history')} className={`py-2 px-4 whitespace-nowrap flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}><HistoryIcon size={16} /> Historial</button>
            <button onClick={() => setActiveTab('profile')} className={`py-2 px-4 whitespace-nowrap flex items-center gap-2 ${activeTab === 'profile' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}><Edit size={16} /> Editar Perfil</button>
            <button onClick={() => setActiveTab('notifications')} className={`py-2 px-4 whitespace-nowrap flex items-center gap-2 ${activeTab === 'notifications' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}><Bell size={16} /> Notificaciones</button>
          </nav>
        </div>

        {isLoading ? (
          <p className="text-zinc-500 text-center py-10">Cargando...</p>
        ) : (
          <>
            {activeTab === 'tickets' && <MisEntradasTab tickets={tickets.filter(t => t.status === 'valid' || t.status === 'partially_used')} onConfirm={fetchData} />}
            {activeTab === 'products' && <MisProductosTab productPurchases={productPurchases} />}
            {activeTab === 'rewards' && userData && config.isRewardsStoreEnabled && <MisPremiosTab user={userData} rewards={rewards} userRewards={userRewards.filter(ur => ur.redeemedAt === null)} onRedeem={fetchData} />}
            {activeTab === 'history' && <HistoryTab tickets={tickets} rewards={userRewards} />}
            {activeTab === 'profile' && userData && <EditarPerfilTab user={userData} />}
            {activeTab === 'notifications' && <NotificacionesTab />}
          </>
        )}
      </div>
    </AuthCheck>
  );
}