// src/components/HeroContent.tsx
'use client';

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { UserProfile, LoyaltyProgressBar } from "./LoyaltyProgressBar";
import { Award, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export function HeroContent() {
    // FIX: El store solo nos da el usuario. Quitamos 'isLoading' y 'profile'.
    const { user } = useAuthStore();

    // Creamos estados locales para manejar el perfil y la carga.
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Si no hay usuario logueado, terminamos la carga y no hacemos nada más.
        if (!user) {
            setIsLoading(false);
            return;
        }

        // Si hay un usuario, buscamos su perfil completo.
        const fetchProfile = async () => {
            setIsLoading(true); // Ponemos en modo carga
            try {
                const response = await api.get('/users/profile/me');
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch user profile for hero content", error);
            } finally {
                setIsLoading(false); // Terminamos la carga
            }
        };

        fetchProfile();
    }, [user]); // Este efecto se ejecuta cada vez que el estado del 'user' cambia (login/logout).

    // Muestra un loader mientras se verifica el usuario o se carga el perfil.
    if (isLoading) {
        return <Loader className="animate-spin text-pink-500" />;
    }

    // Si el usuario ESTÁ logueado y tenemos su perfil, muestra el panel de lealtad.
    if (user && profile) {
        return (
            <div className="container mx-auto px-4 w-full">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Hola, {profile.name}
                </h1>
                <p className="text-zinc-300 text-lg mt-2 mb-8">
                    Bienvenido de nuevo a tu panel.
                </p>
                <div className="max-w-xl mx-auto">
                    <LoyaltyProgressBar user={profile} />
                    <div className="text-center mt-6">
                        <Link href="/mi-cuenta/premios">
                            <span className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                <Award size={18} />
                                Ver Premios para Canjear
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Si el usuario NO está logueado, muestra el mensaje de bienvenida general.
    return (
        <>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white uppercase tracking-wider">
                SUCHT
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 mt-4 max-w-2xl mx-auto">
                Música, amigos y noches inolvidables te esperan.
            </p>
            <div className="mt-8">
                <Link href="#proximos-eventos" className="bg-pink-600 hover:bg-pink-700 font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105">
                    Ver Próximos Eventos
                </Link>
            </div>
        </>
    );
}