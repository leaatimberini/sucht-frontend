'use client';

import { SettingsManager } from "@/components/settings-manager";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/user.types";
import { PointsSettingsForm } from "@/components/forms/points-settings-form";
import { PaymentSettingsForm } from "@/components/forms/PaymentSettingsForm"; // 1. Importar

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
                {/* 2. Añadir el nuevo formulario de pagos */}
                <PaymentSettingsForm />
                <SettingsManager />
                <PointsSettingsForm />
            </div>
        </div>
    );
}