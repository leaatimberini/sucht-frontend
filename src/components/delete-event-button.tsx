'use client';

import { useState } from "react";
import { Modal } from "./ui/modal";
import { Trash2 } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export function DeleteEventButton({
  eventId,
  onEventDeleted,
}: {
  eventId: string;
  onEventDeleted: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // --- LÍNEA CORREGIDA ---
      // Se añade el prefijo /api a la ruta
      await api.delete(`/events/${eventId}`);
      // -----------------------

      toast.success('Evento eliminado correctamente.');
      onEventDeleted(); // Refresca la lista de eventos
      setIsModalOpen(false);
    } catch (error) {
      toast.error('No se pudo eliminar el evento.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
        title="Eliminar evento"
      >
        <Trash2 className="h-5 w-5" />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <div>
          <p className="text-zinc-300">
            ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}