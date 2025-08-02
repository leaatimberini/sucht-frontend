'use client';

import { SettingsManager } from "@/components/settings-manager";

export default function OwnerSettingsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">
                Configuración General y de Pagos
            </h1>
            <p className="text-zinc-400 mb-8">
                Administra las comisiones, las cuentas para recibir los pagos y otras configuraciones de la plataforma.
            </p>

            {/* Reutilizaremos el mismo gestor de configuración del Admin */}
            <SettingsManager />
        </div>
    );
}