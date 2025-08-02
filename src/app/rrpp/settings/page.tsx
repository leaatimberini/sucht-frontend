'use client';

import { RRPPSettingsForm } from "@/components/rrpp-settings-form"; // Importamos el nuevo componente

export default function RRPPSettingsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">
                Configuración de Pagos
            </h1>
            <p className="text-zinc-400 mb-8">
                Vincula tu cuenta de Mercado Pago para recibir tus comisiones por las ventas.
            </p>

            <RRPPSettingsForm /> 
        </div>
    );
}