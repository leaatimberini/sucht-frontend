'use client';

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Este componente envuelve las páginas protegidas
export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Esto asegura que el código solo se ejecute en el navegador
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !token) {
      // Si estamos en el navegador y no hay token, redirigir al login
      router.push('/login');
    }
  }, [token, isClient, router]);

  // Mientras se verifica, o si no hay token, no mostramos nada para evitar parpadeos
  if (!token && isClient) {
    return null;
  }

  // Si hay token, mostramos el contenido de la página
  return <>{children}</>;
}