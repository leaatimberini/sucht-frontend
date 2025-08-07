'use client';

import { User } from "@/types/user.types";
import { QRCodeSVG } from 'qrcode.react';
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Star, ShieldCheck } from "lucide-react";

// Tipos que movimos aquí desde page.tsx
type UserProfile = User & { 
  isPushSubscribed?: boolean; 
  points?: number;
  loyalty?: {
    currentLevel: string;
    nextLevel: string | null;
    progressPercentage: number;
    pointsToNextLevel: number;
  }
};

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  stock: number | null;
  isActive: boolean;
}

interface UserReward {
  id: string;
  reward: Reward;
  redeemedAt: string | null;
  createdAt: string;
}

// Componente para la Barra de Progreso
function LoyaltyProgressBar({ user }: { user: UserProfile }) {
  if (!user.loyalty) return null;

  const { currentLevel, nextLevel, progressPercentage, pointsToNextLevel } = user.loyalty;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
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

export function MisPremiosTab({ user, rewards, userRewards, onRedeem }: { user: UserProfile, rewards: Reward[], userRewards: UserReward[], onRedeem: () => void }) {
  const handleRedeem = async (rewardId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres canjear este premio? Se restarán los puntos de tu cuenta.')) return;
    try {
      toast.loading('Canjeando premio...');
      await api.post(`/rewards/${rewardId}/redeem`);
      toast.dismiss();
      toast.success('¡Premio canjeado con éxito!');
      onRedeem();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'No se pudo canjear el premio.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Se reemplaza el contador de puntos simple por el nuevo componente */}
      <LoyaltyProgressBar user={user} />
      
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Tienda de Canje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map(reward => (
            <div key={reward.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col">
              <div className="flex-grow">
                <h4 className="font-bold text-white">{reward.name}</h4>
                <p className="text-sm text-zinc-400 mt-1">{reward.description}</p>
                <p className="text-sm text-zinc-500 mt-2">Stock: {reward.stock ?? 'Ilimitado'}</p>
              </div>
              <button 
                onClick={() => handleRedeem(reward.id)}
                disabled={!user.points || user.points < reward.pointsCost || reward.stock === 0}
                className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Star size={16} />
                Canjear por {reward.pointsCost} puntos
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Mis Premios Canjeados</h3>
        {userRewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userRewards.map(ur => (
              <div key={ur.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg"><QRCodeSVG value={ur.id} size={160} /></div>
                <h2 className="text-2xl font-bold text-white mt-6">{ur.reward.name}</h2>
                <p className="text-zinc-400 text-sm mt-2">{ur.reward.description}</p>
                <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold ${ur.redeemedAt ? 'bg-zinc-500/20 text-zinc-400' : 'bg-green-500/20 text-green-400'}`}>
                  {ur.redeemedAt ? `CANJEADO EL ${new Date(ur.redeemedAt).toLocaleDateString()}` : 'LISTO PARA USAR'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-10">Aún no has canjeado ningún premio.</p>
        )}
      </div>
    </div>
  );
}