'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { User } from '@/types/user.types';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

// --- COMPONENT INTERFACES ---
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
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '10',
        });

        try {
            const rankingRes = await api.get(`/dashboard/loyalty/attendance-ranking?${params.toString()}`);
            setRanking(rankingRes.data.data);
            setTotalPages(rankingRes.data.totalPages);
            setCurrentPage(rankingRes.data.currentPage);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Fidelización de Clientes</h1>
            
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Ranking de Asistencia</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-zinc-700">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-white">#</th>
                                <th className="p-4 text-sm font-semibold text-white">Cliente</th>
                                <th className="p-4 text-sm font-semibold text-white">Asistencias Totales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={3} className="text-center p-6"><Loader2 className="animate-spin mx-auto"/></td></tr>
                            ) : ranking.map((user, index) => (
                                <tr key={user.userId} className="border-b border-zinc-800 last:border-b-0">
                                    <td className="p-4 text-zinc-400">{(currentPage - 1) * 10 + index + 1}</td>
                                    <td className="p-4">
                                        <p className="font-semibold text-zinc-200">{user.userName}</p>
                                        <p className="text-sm text-zinc-500">{user.userEmail}</p>
                                    </td>
                                    <td className="p-4 font-bold text-white">{user.totalAttendance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <button onClick={() => fetchData(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-zinc-800 rounded-md disabled:opacity-50"><ChevronLeft size={16}/></button>
                    <span className="text-sm text-zinc-400">Página {currentPage} de {totalPages}</span>
                    <button onClick={() => fetchData(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-zinc-800 rounded-md disabled:opacity-50"><ChevronRight size={16}/></button>
                </div>
            </div>
        </div>
    );
}