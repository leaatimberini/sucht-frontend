// src/app/dashboard/staff/page.tsx
'use client';

import { StaffManager } from "@/components/staff-manager";
import { StaffList } from "@/components/staff-list";
import { User } from "@/types/user.types";
import api from "@/lib/axios";
import { useEffect, useState, useCallback } from "react";

export default function StaffPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/staff');
      // ✅ CORRECCIÓN: Si los datos no son un array, devuelve un array vacío
      const staffData = Array.isArray(response.data) ? response.data : [];
      setStaff(staffData);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setStaff([]); // En caso de error, aseguramos que staff sea un array vacío
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Staff</h1>
        <p className="mt-1 text-zinc-400">
          Busca un usuario para asignarle o modificar sus roles. Si no existe, se le enviará una invitación.
        </p>
      </div>

      <StaffManager onStaffChange={fetchStaff} />
      
      <hr className="my-8 border-zinc-700" />
      
      <h2 className="text-2xl font-bold text-white mb-4">Equipo Actual</h2>
      
      {isLoading ? (
        <p className="text-zinc-400">Cargando equipo...</p>
      ) : (
        <StaffList staff={staff} onDataChange={fetchStaff} />
      )}
    </div>
  );
}