// LoyaltyPage Component - src/app/dashboard/loyalty/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { Loader2, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { AuthCheck } from '@/components/auth-check';
import { UserRole } from '@/types/user.types';

// --- Interfaces del Componente ---
interface AttendanceRanking {
    userId: string;
    userName: string;
    userEmail: string;
    totalAttendance: number;
}

export default function LoyaltyPage() {
    const [ranking, setRanking] = useState<AttendanceRanking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/dashboard/loyalty/attendance-ranking`, {
                params: { page, limit: 10 }
            });
            // Aseguramos que 'data' sea siempre un array
            setRanking(response.data.data || []);
            setTotalPages(response.data.totalPages || 1);
            setCurrentPage(response.data.page || 1);
        } catch (error) {
            console.error(error);
            setRanking([]); // En caso de error, dejamos la tabla vacía
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, fetchData]);

    return (
        <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER]}>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-white">Fidelización de Clientes</h1>
                
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Crown size={24} className="text-amber-400"/> Ranking de Asistencia
                    </h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-zinc-700">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-white text-center">#</th>
                                    <th className="p-4 text-sm font-semibold text-white">Cliente</th>
                                    <th className="p-4 text-sm font-semibold text-white text-center">Asistencias Totales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={3} className="text-center p-8"><Loader2 className="animate-spin mx-auto text-pink-500"/></td></tr>
                                ) : ranking.length > 0 ? (
                                    ranking.map((user, index) => (
                                        <tr key={user.userId} className="border-b border-zinc-800 last:border-b-0">
                                            <td className="p-4 text-zinc-400 font-bold text-center">{(currentPage - 1) * 10 + index + 1}</td>
                                            <td className="p-4">
                                                <p className="font-semibold text-zinc-200">{user.userName}</p>
                                                <p className="text-sm text-zinc-500">{user.userEmail}</p>
                                            </td>
                                            <td className="p-4 font-bold text-lg text-white text-center">{user.totalAttendance}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={3} className="text-center p-8 text-zinc-500">No hay datos de asistencia para mostrar.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-4 gap-4">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 bg-zinc-800 rounded-md disabled:opacity-50"><ChevronLeft size={16}/></button>
                            <span className="text-sm text-zinc-400">Página {currentPage} de {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 bg-zinc-800 rounded-md disabled:opacity-50"><ChevronRight size={16}/></button>
                        </div>
                    )}
                </div>
            </div>
        </AuthCheck>
    );
}