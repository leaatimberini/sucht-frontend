// src/components/ReferralCTA.tsx
'use client';

import { useAuthStore } from "@/stores/auth-store";
import { Gift } from "lucide-react";
import Link from "next/link";

export function ReferralCTA() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <section className="bg-zinc-900 py-20">
      <div className="container mx-auto px-4 text-center">
        <Gift size={48} className="mx-auto text-pink-500 mb-4" />
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Gana Premios por Invitar
        </h2>
        <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
          ¿Sabías que tienes un link de referido único? Compártelo con tus amigos. Por cada uno que asista a un evento gracias a ti, acumularás puntos que podrás canjear por premios exclusivos.
        </p>
        <Link href="/mi-cuenta">
          <span className="mt-8 inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105">
            Obtener mi Link de Referido
          </span>
        </Link>
      </div>
    </section>
  );
}