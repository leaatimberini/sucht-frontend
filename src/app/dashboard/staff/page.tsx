'use client';

import { StaffManager } from "@/components/staff-manager";

export default function StaffPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Staff</h1>
        <p className="mt-1 text-zinc-400">
          Busca un usuario por email para asignarle o modificar sus roles. Si no existe, se le enviará una invitación.
        </p>
      </div>

      <StaffManager />

      {/* Más adelante aquí podríamos añadir la lista completa del staff actual */}
    </div>
  );
}