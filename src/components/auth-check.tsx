'use client';

import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserRole } from "@/types/user.types";

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
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (!token) {
      router.push('/login');
      return;
    }

    // Lógica actualizada para comprobar el array de roles
    if (allowedRoles && user && !user.roles.some(role => allowedRoles.includes(role))) {
      toast.error('No tienes permiso para acceder a esta página.');

      if (user.roles.includes(UserRole.ADMIN)) {
        router.push('/dashboard');
      } else if (user.roles.includes(UserRole.RRPP)) {
        router.push('/rrpp');
      } else {
        router.push('/mi-cuenta');
      }
    }

  }, [token, user, isClient, router, allowedRoles]);

  if (isClient && allowedRoles && user && !user.roles.some(role => allowedRoles.includes(role))) {
    return null;
  }

  if (isClient && !token) {
    return null;
  }

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}