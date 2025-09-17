// src/components/dashboard/EventPerformance.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Event } from '@/types/event.types';

interface PerformanceData {
  generatedTickets: { general: number; vip: number; tables: number; total: number; };
  realAdmissions: { general: number; vip: number; tables: number; total: number; };
  attendanceRate: string;
}

export function EventPerformance() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [data, setData] = useState<PerformanceData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            const response = await api.get('/events');
            setEvents(response.data);
            // Selecciona el evento más reciente por defecto
            if (response.data.length > 0) {
                const latestEvent = response.data.sort((a: Event, b: Event) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
                setSelectedEventId(latestEvent.id);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (!selectedEventId) return;
        const fetchPerformance = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/dashboard/event-performance/${selectedEventId}`);
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch performance data", error);
                setData(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPerformance();
    }, [selectedEventId]);

    return (
        <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Rendimiento por Evento</h2>
            <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full md:w-1/3 bg-zinc-800 rounded-md p-2 text-white border border-zinc-700 mb-6"
            >
                {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                ))}
            </select>

            {isLoading && <p>Cargando métricas...</p>}
            
            {data && !isLoading && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-700">
                                <th className="p-2 text-zinc-400">Métrica</th>
                                <th className="p-2 text-center text-zinc-400">Generales</th>
                                <th className="p-2 text-center text-zinc-400">VIP</th>
                                <th className="p-2 text-center text-zinc-400">Mesas</th>
                                <th className="p-2 text-center text-white font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            <tr>
                                <td className="p-2 font-semibold">Entradas Generadas</td>
                                <td className="p-2 text-center text-xl">{data.generatedTickets.general}</td>
                                <td className="p-2 text-center text-xl">{data.generatedTickets.vip}</td>
                                <td className="p-2 text-center text-xl">{data.generatedTickets.tables}</td>
                                <td className="p-2 text-center text-xl font-bold text-white">{data.generatedTickets.total}</td>
                            </tr>
                            <tr>
                                <td className="p-2 font-semibold">Ingresos Reales</td>
                                <td className="p-2 text-center text-xl text-green-400">{data.realAdmissions.general}</td>
                                <td className="p-2 text-center text-xl text-green-400">{data.realAdmissions.vip}</td>
                                <td className="p-2 text-center text-xl text-green-400">{data.realAdmissions.tables}</td>
                                <td className="p-2 text-center text-xl font-bold text-green-400">{data.realAdmissions.total}</td>
                            </tr>
                            <tr>
                                <td className="p-2 font-semibold">Tasa de Asistencia</td>
                                <td colSpan={4} className="p-2 text-center text-3xl font-bold text-pink-400">{data.attendanceRate}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}