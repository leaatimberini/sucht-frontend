// OwnerDashboardPage Component - src/app/dashboard/owner/page.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { SummaryMetrics, EventPerformance } from "@/types/dashboard.types";
import { Ticket, Users, Calendar, Crown, CheckCircle, XCircle } from "lucide-react";
import { DashboardFilters } from "@/components/dashboard-filters";
import { AuthCheck } from "@/components/auth-check";
import { UserRole } from "@/types/user.types";
import toast from 'react-hot-toast';

// --- DEFINICIÓN DE TIPOS ---
interface Filters {
    eventId?: string;
    startDate?: string;
    endDate?: string;
}

interface InvitationHistoryItem {
    invitedUser: { name: string, email: string };
    event: { title: string };
    ticket: {
        quantity: number;
        redeemedCount: number;
        isVipAccess: boolean;
        status: string;
    };
    gifts: Record<string, number>;
}

// --- SUB-COMPONENTES DE LA PÁGINA ---

function StatCard({ title, value, icon: Icon, className = "" }: { title: string, value: string | number, icon: React.ElementType, className?: string }) {
    return (
        <div className={`bg-zinc-900 p-6 rounded-lg border border-zinc-800 ${className}`}>
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-zinc-400">{title}</p>
                <Icon className="h-5 w-5 text-zinc-500" />
            </div>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
    );
}

function InvitationHistory({ history }: { history: InvitationHistoryItem[] }) {
    if (history.length === 0) {
        return (
            <div className="text-center py-10 bg-zinc-900 border border-zinc-800 rounded-lg">
                <p className="text-zinc-500">Aún no has enviado ninguna invitación especial.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-zinc-700">
                    <tr>
                        <th className="p-4 text-sm font-semibold text-white">Invitado</th>
                        <th className="p-4 text-sm font-semibold text-white">Evento</th>
                        <th className="p-4 text-sm font-semibold text-white text-center">Personas</th>
                        <th className="p-4 text-sm font-semibold text-white text-center">Ingresaron</th>
                        <th className="p-4 text-sm font-semibold text-white">Regalos</th>
                        <th className="p-4 text-sm font-semibold text-white text-center">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((item, index) => (
                        <tr key={index} className="border-b border-zinc-800 last:border-b-0">
                            <td className="p-4"><p className="font-semibold text-zinc-200">{item.invitedUser.name}</p><p className="text-sm text-zinc-500">{item.invitedUser.email}</p></td>
                            <td className="p-4 text-zinc-300">{item.event.title}</td>
                            <td className="p-4 text-center font-bold text-white">{item.ticket.quantity} {item.ticket.isVipAccess && <Crown className="inline ml-1 text-amber-400" size={16}/>}</td>
                            <td className="p-4 text-center text-zinc-300">{item.ticket.redeemedCount}</td>
                            <td className="p-4 text-zinc-400 text-xs">
                                {Object.entries(item.gifts).length > 0 
                                    ? Object.entries(item.gifts).map(([name, qty]) => <p key={name}>{`(x${qty}) ${name}`}</p>)
                                    : 'N/A'
                                }
                            </td>
                            <td className="p-4 text-center">
                                {item.ticket.redeemedCount > 0 ? (
                                    <span className="flex items-center justify-center gap-2 text-green-400"><CheckCircle size={16} /> Ingresó</span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2 text-zinc-400"><XCircle size={16} /> Pendiente</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function OwnerDashboardPage() {
    const [summary, setSummary] = useState<SummaryMetrics | null>(null);
    const [performance, setPerformance] = useState<EventPerformance[]>([]);
    const [invitationHistory, setInvitationHistory] = useState<InvitationHistoryItem[]>([]);
    const [filters, setFilters] = useState<Filters>({});
    const [isLoading, setIsLoading] = useState(true);
    const [nextEventId, setNextEventId] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [nextEventRes, historyRes] = await Promise.all([
                    api.get('/events/next'),
                    api.get('/owner/invitations/my-history')
                ]);

                setInvitationHistory(historyRes.data);
                
                if (nextEventRes.data) {
                    setNextEventId(nextEventRes.data.id);
                    setFilters({ eventId: nextEventRes.data.id });
                } else {
                    setFilters({});
                    setIsLoading(false); // Si no hay evento, detenemos la carga aquí
                }
            } catch (error) {
                toast.error("No se pudieron cargar los datos del panel.");
                console.error("Failed to fetch initial data", error);
                setFilters({});
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchData = useCallback(async (currentFilters: Filters) => {
        // Si no hay filtros, no hacemos nada con las métricas
        if (!currentFilters.eventId && !currentFilters.startDate) {
            setSummary(null);
            setPerformance([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const params = new URLSearchParams();
        if (currentFilters.eventId) params.append('eventId', currentFilters.eventId);
        if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
        if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);
        const queryString = params.toString();

        try {
            const [summaryRes, performanceRes] = await Promise.all([
                api.get(`/dashboard/summary?${queryString}`),
                api.get(`/dashboard/event-performance?${queryString}`),
            ]);
            setSummary(summaryRes.data);
            setPerformance(performanceRes.data);
        } catch (error) {
            toast.error("No se pudieron cargar las métricas.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (filters) {
            fetchData(filters);
        }
    }, [fetchData, filters]);

    return (
        <AuthCheck allowedRoles={[UserRole.OWNER, UserRole.ADMIN]}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Panel de Dueño</h1>
                    <p className="text-zinc-400 mt-1">Métricas en vivo e historial de invitaciones especiales.</p>
                </div>
                <DashboardFilters onFilterChange={setFilters} initialEventId={nextEventId} />
                
                {isLoading ? (
                    <p className="text-zinc-400 text-center">Cargando métricas...</p>
                ) : summary ? (
                    <>
                        {/* Tarjetas de Resumen */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Entradas Generales" value={summary.totalTicketsGenerated} icon={Ticket} />
                            <StatCard title="Personas Generales" value={summary.totalPeopleAdmitted} icon={Users} />
                            <StatCard title="Entradas VIP" value={summary.totalVIPTicketsGenerated} icon={Crown} className="bg-amber-400/10 border-amber-400/20 text-amber-400" />
                            <StatCard title="Personas VIP" value={summary.totalVIPPeopleAdmitted} icon={Crown} className="bg-amber-400/10 border-amber-400/20 text-amber-400" />
                        </div>
                        <StatCard title="Eventos (Filtrados)" value={summary.totalEvents} icon={Calendar} />

                        {/* Tabla de Rendimiento por Evento */}
                        <div className="mt-10">
                            <h2 className="text-2xl font-bold text-white mb-4">Rendimiento del Evento</h2>
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-zinc-700">
                                        <tr>
                                            <th className="p-4 text-sm font-semibold text-white">Evento</th>
                                            <th className="p-4 text-sm font-semibold text-white">Entradas Generales</th>
                                            <th className="p-4 text-sm font-semibold text-white">Ingresos Generales</th>
                                            <th className="p-4 text-sm font-semibold text-white">Entradas VIP</th>
                                            <th className="p-4 text-sm font-semibold text-white">Ingresos VIP</th>
                                            <th className="p-4 text-sm font-semibold text-white">Tasa de Asistencia</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performance.map(event => (
                                            <tr key={event.id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors">
                                                <td className="p-4 text-zinc-300 font-semibold">{event.title}</td>
                                                <td className="p-4 text-zinc-300">{event.ticketsGenerated}</td>
                                                <td className="p-4 text-zinc-300">{event.peopleAdmitted}</td>
                                                <td className="p-4 text-zinc-300">{event.vipTicketsGenerated}</td>
                                                <td className="p-4 text-zinc-300">{event.vipPeopleAdmitted}</td>
                                                <td className="p-4 font-bold text-pink-400">
                                                    {event.ticketsGenerated + event.vipTicketsGenerated > 0 
                                                        ? `${(((event.peopleAdmitted + event.vipPeopleAdmitted) / (event.ticketsGenerated + event.vipTicketsGenerated)) * 100).toFixed(0)}%` 
                                                        : '0%'}
                                                </td>
                                            </tr>
                                        ))}
                                        {performance.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan={6} className="p-4 text-center text-zinc-500">No hay datos de rendimiento para los filtros seleccionados.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : null}

                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-white mb-4">Historial de Invitaciones Enviadas</h2>
                    <InvitationHistory history={invitationHistory} />
                </div>
            </div>
        </AuthCheck>
    );
}