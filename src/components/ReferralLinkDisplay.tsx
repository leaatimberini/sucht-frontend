// src/components/ReferralLinkDisplay.tsx
'use client';

import { useAuthStore } from "@/stores/auth-store";
import { Copy, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export function ReferralLinkDisplay() {
  const { user } = useAuthStore();

  // Si el usuario no tiene un nombre de usuario, no se puede generar el link.
  if (!user?.username) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg mt-8 text-center">
        <AlertCircle className="mx-auto text-yellow-400 mb-2" size={32} />
        <h3 className="text-lg font-semibold text-white">Configura tu Link de Invitado</h3>
        <p className="text-zinc-400 text-sm mt-1">
          Para poder invitar amigos y ganar puntos, primero debes elegir tu nombre de usuario único.
        </p>
        <Link href="/mi-cuenta/perfil">
          <span className="mt-4 inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg text-sm cursor-pointer">
            Ir a Mi Perfil
          </span>
        </Link>
      </div>
    );
  }

  const referralLink = `https://sucht.com.ar/p/${user.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('¡Link copiado al portapapeles!');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg mt-8">
      <h3 className="text-lg font-semibold text-white">Tu Link de Invitado</h3>
      <p className="text-zinc-400 text-sm mt-1">
        Comparte este link único con tus invitados. Todas las entradas que saquen a través de él contarán como tuyas.
      </p>
      <div className="mt-4 flex items-center bg-zinc-800 border border-zinc-700 rounded-lg pr-2">
        <input
          type="text"
          readOnly
          value={referralLink}
          className="w-full bg-transparent p-3 text-pink-400 focus:outline-none"
        />
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-md text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          aria-label="Copiar link"
        >
          <Copy size={20} />
        </button>
      </div>
    </div>
  );
}