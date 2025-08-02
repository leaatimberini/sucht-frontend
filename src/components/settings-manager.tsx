'use client';

import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/user.types";

// Importamos los nuevos formularios
import { OwnerSettingsForm } from "./forms/owner-settings-form";
import { AdminSettingsForm } from "./forms/admin-settings-form";
// Suponiendo que creamos también los otros formularios
// import { MarketingForm } from "./forms/marketing-form";
// import { TermsAndConditionsForm } from "./forms/tc-form";

export function SettingsManager() {
  const { user } = useAuthStore();
  
  const isOwner = user?.roles.includes(UserRole.OWNER);
  const isAdmin = user?.roles.includes(UserRole.ADMIN);

  // NOTA: Un usuario puede ser AMBOS, en cuyo caso verá todos los paneles.
  return (
    <div className="space-y-8">
      {isOwner && <OwnerSettingsForm />}
      {isAdmin && (
        <>
          <AdminSettingsForm />
          {/* Aquí irían los otros formularios de Admin */}
          {/* <TermsAndConditionsForm /> */}
          {/* <MarketingForm /> */}
        </>
      )}
    </div>
  );
}