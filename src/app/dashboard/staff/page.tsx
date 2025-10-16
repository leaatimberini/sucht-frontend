'use client';

import { StaffManager } from "@/components/staff-manager";
import { StaffList } from "@/components/staff-list";
import { User } from "@/types/user.types";
import api from "@/lib/axios";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStaff, setTotalStaff] = useState(0);
  const limit = 10;

  const fetchStaff = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/staff', {
        params: { page, limit }
      });
      
      setStaff(response.data.data);
      setTotalStaff(response.data.total);
      setTotalPages(Math.ceil(response.data.total / limit));
      setCurrentPage(response.data.page);

    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff(currentPage);
  }, [fetchStaff, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Staff</h1>
        <p className="mt-1 text-zinc-400">
          Busca un usuario para asignarle o modificar sus roles. Si no existe, se le enviará una invitación.
        </p>
      </div>

      <StaffManager onStaffChange={() => fetchStaff(1)} />
      
      <hr className="my-8 border-zinc-700" />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Equipo Actual ({totalStaff})</h2>
        <div className="flex items-center gap-2">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-zinc-800 rounded-md disabled:opacity-50"><ChevronLeft size={16}/></button>
            <span className="text-sm text-zinc-400">Página {currentPage} de {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-zinc-800 rounded-md disabled:opacity-50"><ChevronRight size={16}/></button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-pink-500"/></div>
      ) : (
        <StaffList staff={staff} onDataChange={() => fetchStaff(currentPage)} />
      )}
    </div>
  );
}