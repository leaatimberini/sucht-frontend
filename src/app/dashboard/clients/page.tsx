// src/app/dashboard/clients/page.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { User } from "@/types/user.types";
import { ChevronLeft, ChevronRight, Edit, Trash2, Key } from 'lucide-react';
import { EditClientModal, ResetPasswordModal } from "@/components/client-management-modals";
import toast from "react-hot-toast";

interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export default function ClientsPage() {
  const [paginatedData, setPaginatedData] = useState<PaginatedUsers>({
    data: [],
    total: 0,
    page: 1,
    limit: 20, // ✅ Límite de 20 clientes por página
  });
  const [isLoading, setIsLoading] = useState(true);

  // States for Modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const fetchClients = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/users/clients?page=${page}&limit=${paginatedData.limit}`);
      setPaginatedData(response.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setPaginatedData({ data: [], total: 0, page: 1, limit: 20 });
    } finally {
      setIsLoading(false);
    }
  }, [paginatedData.limit]);

  useEffect(() => {
    fetchClients(paginatedData.page);
  }, [fetchClients, paginatedData.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(paginatedData.total / paginatedData.limit)) {
      setPaginatedData(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.name || user.email}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}/delete`); // O el endpoint que hayas configurado
      toast.success('Cliente eliminado correctamente');
      fetchClients(paginatedData.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar cliente');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Listado de Clientes</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-white">Nombre</th>
              <th className="p-4 text-sm font-semibold text-white">Email</th>
              <th className="p-4 text-sm font-semibold text-white">Fecha de Registro</th>
              <th className="p-4 text-sm font-semibold text-white text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="text-center p-6 text-zinc-400">Cargando Clientes...</td></tr>
            ) : (
              paginatedData.data.length > 0 ? (
                paginatedData.data.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 text-zinc-300">{user.name || '-'}</td>
                    <td className="p-4 text-zinc-300">{user.email}</td>
                    <td className="p-4 text-zinc-300">
                      {new Date(user.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => { setSelectedUser(user); setIsEditOpen(true); }}
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors"
                        title="Editar Datos"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setIsPasswordOpen(true); }}
                        className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-colors"
                        title="Cambiar Contraseña"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                        title="Eliminar Cliente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="text-center p-6 text-zinc-400">No se encontraron clientes.</td></tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Controles de paginación */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(paginatedData.page - 1)}
          disabled={paginatedData.page === 1}
          className="flex items-center space-x-2 text-zinc-400 hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Anterior</span>
        </button>
        <span className="text-zinc-400">
          Página {paginatedData.page} de {Math.max(1, Math.ceil(paginatedData.total / paginatedData.limit))}
        </span>
        <button
          onClick={() => handlePageChange(paginatedData.page + 1)}
          disabled={paginatedData.page * paginatedData.limit >= paginatedData.total}
          className="flex items-center space-x-2 text-zinc-400 hover:text-white disabled:opacity-50"
        >
          <span>Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* MODALS */}
      {selectedUser && (
        <>
          <EditClientModal
            user={selectedUser}
            isOpen={isEditOpen}
            onClose={() => { setIsEditOpen(false); setSelectedUser(null); }}
            onSuccess={() => fetchClients(paginatedData.page)}
          />
          <ResetPasswordModal
            user={selectedUser}
            isOpen={isPasswordOpen}
            onClose={() => { setIsPasswordOpen(false); setSelectedUser(null); }}
          />
        </>
      )}
    </div>
  );
}