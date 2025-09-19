// src/components/HomepageLoyaltyStatus.tsx
'use client';

import { useAuthStore } from "@/stores/auth-store";
import { LoyaltyProgressBar, UserProfile } from "./LoyaltyProgressBar";
import { Award, Loader } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export function HomepageLoyaltyStatus() {
  const { user } = useAuthStore();
  // FIX: Creamos un estado local para guardar el perfil del usuario.
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si no hay usuario, no hacemos nada.
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Si hay usuario, buscamos su perfil completo.
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile/me');
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile for homepage loyalty status", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]); // Este efecto se ejecuta cada vez que el estado del usuario cambia.

  // Si está cargando o no hay perfil, no mostramos nada.
  if (isLoading || !profile) {
    return null;
  }

  return (
    <section className="bg-black py-12 border-y border-zinc-800">
      <div className="container mx-auto px-4">
        <LoyaltyProgressBar user={profile} />
        <div className="text-center mt-6">
            <Link href="/mi-cuenta/premios">
                <span className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <Award size={18} />
                    Ver Premios para Canjear
                </span>
            </Link>
        </div>
      </div>
    </section>
  );
}