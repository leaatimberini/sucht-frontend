'use client';

import { SettingsManager } from "@/components/settings-manager";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/user.types";

export default function SettingsPage() {
    const { user } = useAuthStore();
    
    // Mostramos un título diferente si es el Dueño o Admin
    const isOwner = user?.roles.includes(UserRole.OWNER);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">
                {isOwner ? 'Configuración General y de Pagos' : 'Configuración'}
            </h1>
            <p className="text-zinc-400 mb-8">
                Administra las comisiones, las cuentas para recibir los pagos y otras configuraciones de la plataforma.
            </p>

            <SettingsManager />
        </div>
    );
}
