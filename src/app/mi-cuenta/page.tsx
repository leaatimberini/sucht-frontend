'use client';

import { AuthCheck } from "@/components/auth-check";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { Ticket } from "@/types/ticket.types";
import { User } from "@/types/user.types";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react"; 
import { BirthdayBenefitCard } from "./components/BirthdayBenefitCard";
import { SpecialTicketDisplay } from "./components/special-ticket-display";

// --- TIPOS Y COMPONENTES INTERNOS ---

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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 md:p-6 mb-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md md:text-lg font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="text-amber-400" />
          Nivel: <span className="text-amber-400">{currentLevel}</span>
        </h3>
        <p className="text-sm font-bold text-white">{user.points} <span className="font-normal text-zinc-400">Puntos</span></p>
      </div>
      {nextLevel ? (
        <>
          <div className="w-full bg-zinc-700 rounded-full h-2.5">
            <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="text-xs text-zinc-400 mt-2 text-right">
            Te faltan {pointsToNextLevel} puntos para el nivel {nextLevel}
          </p>
        </>
      ) : (
        <p className="text-sm text-amber-400">¡Has alcanzado el nivel máximo!</p>
      )}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function MiCuentaPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authUser = useAuthStore((state) => state.user);

  const fetchData = useCallback(async () => {
    if (!authUser) return;
    setIsLoading(true);
    try {
      const [ticketsRes, userRes] = await Promise.all([
        api.get('/tickets/my-tickets'),
        api.get('/users/profile/me'),
      ]);
      setTickets(ticketsRes.data);
      setUserData(userRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("No se pudieron cargar tus datos.");
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lógica para separar las entradas especiales de las normales
  const specialTickets = tickets.filter(
    t => (t.origin === 'OWNER_INVITATION' || t.tier.productType === 'vip_table') && (t.status === 'valid' || t.status === 'partially_used')
  );
  
  return (
    <AuthCheck>
      {isLoading ? (
        <p className="text-zinc-500 text-center py-10">Cargando tu información...</p>
      ) : userData ? (
        <>
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Hola, {userData.name}</h1>
            <p className="text-zinc-400">Bienvenido a tu panel de control.</p>
          </div>

          <LoyaltyProgressBar user={userData} />

          {/* Renderizamos la nueva sección de Invitaciones Especiales */}
          {specialTickets.length > 0 && (
            <div className="space-y-6 mb-8">
              {specialTickets.map(ticket => (
                <SpecialTicketDisplay key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}

          {userData.isBirthdayWeek && (
            <div className="mb-8">
              <BirthdayBenefitCard />
            </div>
          )}
          
        </>
      ) : (
         <p className="text-zinc-500 text-center py-10">No se pudo cargar tu perfil.</p>
      )}
    </AuthCheck>
  );
}