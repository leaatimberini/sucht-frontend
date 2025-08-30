'use client';

import { useEffect, useState, useCallback } from "react";
import { User } from "@/types/user.types";
import api from "@/lib/axios";
import { TicketGenerator } from "@/components/ticket-generator";
import { useAuthStore } from "@/stores/auth-store";
import { Copy, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function RRPPPage() {
  // Se elimina el estado de 'events', ya no es necesario aquí.
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const authUser = useAuthStore((state) => state.user);

  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      // Ahora solo necesitamos obtener el perfil del usuario para el link de referido.
      const userRes = await api.get('/users/profile/me');
      setCurrentUser(userRes.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast.error("No se pudo cargar tu perfil.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleCopyToClipboard = () => {
    if (!currentUser?.username) return;
    const link = `https://sucht.com.ar/p/${currentUser.username}`;
    navigator.clipboard.writeText(link);
    toast.success('¡Link copiado al portapapeles!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Panel RRPP</h1>
      
      {/* Sección para compartir el link personal */}
      {currentUser?.username && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white">Tu Link de Invitado</h2>
          <p className="text-zinc-400 mt-2 mb-4">Comparte este link único con tus invitados. Todas las entradas que saquen a través de él contarán como tuyas.</p>
          <div className="flex items-center space-x-2 bg-zinc-800 p-2 rounded-md">
            <span className="text-pink-400 flex-1 truncate">{`https://sucht.com.ar/p/${currentUser.username}`}</span>
            <button onClick={handleCopyToClipboard} className="bg-pink-600 hover:bg-pink-700 p-2 rounded-md">
              <Copy className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      )}
      
      {/* * CORRECCIÓN: 
        * Ya no mapeamos los eventos. Simplemente renderizamos el 
        * componente TicketGenerator, que ahora es autónomo.
      */}
      <div className="mt-8">
        <TicketGenerator />
      </div>
    </div>
  );
}