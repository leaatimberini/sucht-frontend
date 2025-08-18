'use client';

import { EventList } from "@/components/event-list"
import { CreateEventForm } from "@/components/create-event-form";
import { EditEventForm } from "@/components/edit-event-form";
import { Modal } from "@/components/ui/modal";
import api from "@/lib/axios";
import { CalendarPlus } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { type Event } from "@/types/event.types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      // --- LÍNEA CORREGIDA ---
      // Llamamos al nuevo endpoint que trae TODOS los eventos para el admin.
      const response = await api.get('/events/all-for-admin');
      setEvents(response.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDataChange = () => {
    fetchEvents();
  };
  
  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Eventos</h1>
          <p className="mt-1 text-zinc-400">
            Administra los eventos de SUCHT.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2"
        >
          <CalendarPlus className="h-5 w-5" />
          <span>Crear Evento</span>
        </button>
      </div>
      
      <EventList events={events} onDataChange={handleDataChange} onEditEvent={handleEditClick} />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Evento"
      >
        <CreateEventForm 
          onClose={() => setIsCreateModalOpen(false)}
          onEventCreated={handleDataChange}
        />
      </Modal>

      {selectedEvent && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Editando: ${selectedEvent.title}`}
        >
          <EditEventForm 
            event={selectedEvent}
            onClose={() => setIsEditModalOpen(false)}
            onEventUpdated={handleDataChange}
          />
        </Modal>
      )}
    </div>
  );
}