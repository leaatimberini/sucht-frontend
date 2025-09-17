// frontend/src/components/rrpp-settings-form.tsx
'use client';

import { useAuthStore } from '@/stores/auth-store';

export function RRPPSettingsForm() {
  // Leemos la información del usuario directamente desde nuestro store de Zustand
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-xl font-semibold text-white">Mi Comisión</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Tu tasa de comisión por ventas referidas es del{' '}
          <span className="font-bold text-pink-500 text-lg">
            {user?.rrppCommissionRate !== null && user?.rrppCommissionRate !== undefined 
              ? `${user.rrppCommissionRate}%` 
              : 'No definida'}
          </span>
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          Esta comisión es calculada por el administrador. Contacta con él para cualquier consulta.
        </p>
      </div>

      {/* SECCIÓN DE VINCULACIÓN DE MERCADO PAGO ELIMINADA */}
    </div>
  );
}