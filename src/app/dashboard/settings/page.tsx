'use client';

import { SettingsManager } from "@/components/settings-manager";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/user.types";
import { PointsSettingsForm } from "@/components/forms/points-settings-form"; // 1. Se importa el nuevo formulario

export default function SettingsPage() {
    const { user } = useAuthStore();
    
    const isOwner = user?.roles.includes(UserRole.OWNER);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">
                {isOwner ? 'Configuración General y de Pagos' : 'Configuración'}
            </h1>
            <p className="text-zinc-400 mb-8">
                Administra las comisiones, las cuentas para recibir los pagos y otras configuraciones de la plataforma.
            </p>

            <div className="space-y-8">
              <SettingsManager />
              {/* 2. Se añade el nuevo formulario a la página */}
              <PointsSettingsForm />
            </div>
        </div>
    );
}