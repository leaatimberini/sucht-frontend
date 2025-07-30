'use client';

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { RRPPPerformance } from "@/types/dashboard.types";
import { Event } from "@/types/event.types"; // Importar el tipo Event

export default function RRPPStatsPage() {
  const [performance, setPerformance] = useState<RRPPPerformance[]>([]);
  const [events, setEvents] = useState<Event[]>([]); // Estado para la lista de eventos
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para los filtros
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Construimos los parámetros de la URL para los filtros
      const params = new URLSearchParams();
      if (selectedEventId) params.append('eventId', selectedEventId);
      if (startDate) params.append('startDate', new Date(startDate).toISOString());
      if (endDate) params.append('endDate', new Date(endDate).toISOString());

      const response = await api.get(`/dashboard/rrpp-performance?${params.toString()}`);
      setPerformance(response.data);
    } catch (error) {
      console.error("Failed to fetch RRPP performance data", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEventId, startDate, endDate]);

  useEffect(() => {
    // Cargar la lista de eventos para el selector de filtro
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };
    
    fetchEvents();
    fetchData(); // Carga inicial de datos
  }, [fetchData]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Rendimiento de RRPP</h1>

      {/* Formulario de Filtros */}
      <form onSubmit={handleFilterSubmit} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label htmlFor="event-filter" className="block text-xs font-medium text-zinc-400 mb-1">Filtrar por Evento</label>
          <select 
            id="event-filter"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-zinc-800 rounded-md p-2 text-sm"
          >
            <option value="">Todos los eventos</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label htmlFor="start-date" className="block text-xs font-medium text-zinc-400 mb-1">Desde</label>
          <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-zinc-800 rounded-md p-2 text-sm" />
        </div>
        <div className="flex-1 w-full">
          <label htmlFor="end-date" className="block text-xs font-medium text-zinc-400 mb-1">Hasta</label>
          <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-zinc-800 rounded-md p-2 text-sm" />
        </div>
        <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg w-full md:w-auto">
          Filtrar
        </button>
      </form>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-white">RRPP</th>
              <th className="p-4 text-sm font-semibold text-white">Entradas Generadas</th>
              <th className="p-4 text-sm font-semibold text-white">Ingresos Reales</th>
              <th className="p-4 text-sm font-semibold text-white">Tasa de Conversión</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="text-center p-6 text-zinc-400">Cargando datos...</td></tr>
            ) : (
              performance.map(rrpp => (
                <tr key={rrpp.rrppId} className="border-b border-zinc-800 last:border-b-0">
                  <td className="p-4 text-zinc-300 font-semibold">{rrpp.rrppName}</td>
                  <td className="p-4 text-zinc-300">{rrpp.ticketsGenerated}</td>
                  <td className="p-4 text-zinc-300">{rrpp.peopleAdmitted}</td>
                  <td className="p-4 font-bold text-pink-400">
                    {rrpp.ticketsGenerated > 0 
                      ? `${((rrpp.peopleAdmitted / rrpp.ticketsGenerated) * 100).toFixed(0)}%` 
                      : '0%'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
