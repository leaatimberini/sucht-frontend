'use client';

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// El componente ahora acepta una lista opcional de roles permitidos
export function AuthCheck({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Esto asegura que el código solo se ejecute en el navegador
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // 1. Si no hay token, lo expulsamos al login
    if (!token) {
      router.push('/login');
      return;
    }

    // 2. Si se especifican roles y el usuario no tiene el rol correcto, lo expulsamos
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      toast.error('No tienes permiso para acceder a esta página.');
      // Lo redirigimos a su página por defecto
      if (user.role === 'CLIENT') {
        router.push('/mi-cuenta');
      } else {
        router.push('/dashboard');
      }
    }

  }, [token, user, isClient, router, allowedRoles]);

  // Si se requiere un rol específico y el usuario no lo cumple, no renderizamos nada
  if (isClient && allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }
  
  // Si no hay token, no renderizamos nada
  if (isClient && !token) {
    return null;
  }

  // Si pasa todas las validaciones, mostramos el contenido
  return <>{children}</>;
}