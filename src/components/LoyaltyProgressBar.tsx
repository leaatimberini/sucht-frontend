// src/components/LoyaltyProgressBar.tsx
'use client';

import { ShieldCheck } from "lucide-react";
import { User } from "@/types/user.types";

export type UserProfile = User & { 
  points?: number;
  loyalty?: {
    currentLevel: string;
    nextLevel: string | null;
    progressPercentage: number;
    pointsToNextLevel: number;
  }
};

export function LoyaltyProgressBar({ user }: { user: UserProfile }) {
  if (!user.loyalty) return null;
  const { currentLevel, nextLevel, progressPercentage, pointsToNextLevel } = user.loyalty;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 md:p-6">
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