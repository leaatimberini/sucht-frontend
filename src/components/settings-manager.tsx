// src/components/settings-manager.tsx

'use client';

import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/user.types";

// Importamos los nuevos formularios granulares
import { OwnerSettingsForm } from "./forms/owner-settings-form";
import { AdminSettingsForm } from "./forms/admin-settings-form";
import { TermsAndConditionsForm } from "./forms/terms-and-conditions-form";
import { MarketingForm } from "./forms/marketing-form";
import { FeatureSettingsForm } from "./forms/feature-settings-form"; // <-- 1. Importar el nuevo formulario

export function SettingsManager() {
  const { user } = useAuthStore();
  
  const isOwner = user?.roles.includes(UserRole.OWNER);
  const isAdmin = user?.roles.includes(UserRole.ADMIN);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Formularios que ve el Dueño */}
      {isOwner && <OwnerSettingsForm />}

      {/* Formularios que ve el Admin */}
      {isAdmin && (
        <>
          <AdminSettingsForm />
          <TermsAndConditionsForm />
          <MarketingForm />
          <FeatureSettingsForm /> {/* <-- 2. Añadir el nuevo formulario aquí */}
        </>
      )}
    </div>
  );
}