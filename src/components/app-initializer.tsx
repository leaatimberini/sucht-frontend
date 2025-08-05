// frontend/src/components/app-initializer.tsx
'use client';

import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";

export function AppInitializer() {
  // Este efecto se ejecuta una sola vez cuando la aplicación carga en el cliente.
  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  // Este componente no renderiza nada, solo ejecuta la lógica de inicialización.
  return null;
}