'use client';

import { AuthCheck } from "@/components/auth-check";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { Ticket } from "@/types/ticket.types";
import { User } from "@/types/user.types";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, Ticket as TicketIcon } from "lucide-react"; 
import { BirthdayBenefitCard } from "./components/BirthdayBenefitCard";
import { QRCodeSVG } from "qrcode.react";

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

function UpcomingTicketPreview({ tickets }: { tickets: Ticket[] }) {
  // Encontrar el próximo ticket válido
  const upcomingTicket = tickets
    .filter(t => new Date(t.event.startDate) >= new Date() && (t.status === 'valid' || t.status === 'partially_used'))
    .sort((a, b) => new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime())[0];

  if (!upcomingTicket) {
    return null; // No mostrar nada si no hay tickets próximos
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 md:p-6 mb-8">
       <h3 className="text-md md:text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <TicketIcon className="text-pink-500" />
          Tu Próxima Entrada
       </h3>
       <div className="bg-white p-4 rounded-lg flex flex-col items-center text-center max-w-xs mx-auto">
          <QRCodeSVG value={upcomingTicket.id} size={180} />
          <h4 className="text-xl font-bold text-black mt-4">{upcomingTicket.event.title}</h4>
          <p className="text-pink-600 font-semibold">{upcomingTicket.tier.name} (x{upcomingTicket.quantity})</p>
          <p className="text-zinc-600 text-sm mt-1">{new Date(upcomingTicket.event.startDate).toLocaleDateString('es-AR', { dateStyle: 'full' })}</p>
       </div>
    </div>
  )
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
      // Solo pedimos los datos necesarios para esta página principal
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
  
  // El contenido real se renderiza dentro del MiCuentaLayout
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

          {userData.isBirthdayWeek && (
            <div className="mb-8">
              <BirthdayBenefitCard />
            </div>
          )}
          
          <UpcomingTicketPreview tickets={tickets} />
          
        </>
      ) : (
         <p className="text-zinc-500 text-center py-10">No se pudo cargar tu perfil.</p>
      )}
    </AuthCheck>
  );
}