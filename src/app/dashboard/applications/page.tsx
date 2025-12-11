'use client';

import api from "@/lib/axios";
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useState } from 'react';
import { Loader2, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface JobApplication {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    cvUrl: string;
    message: string;
    status: 'pending' | 'reviewed' | 'contacted' | 'rejected';
    createdAt: string;
}

export default function JobApplicationsPage() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const { data } = await api.get('/job-applications');
            setApplications(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar postulaciones');
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/job-applications/${id}/status`, { status: newStatus });
            setApplications(apps => apps.map(app => app.id === id ? { ...app, status: newStatus as any } : app));
            toast.success('Estado actualizado');
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs flex items-center gap-1"><Clock size={12} /> Pendiente</span>;
            case 'reviewed': return <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-xs flex items-center gap-1"><CheckCircle size={12} /> Revisado</span>;
            case 'contacted': return <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs flex items-center gap-1"><CheckCircle size={12} /> Contactado</span>;
            case 'rejected': return <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs flex items-center gap-1"><XCircle size={12} /> Rechazado</span>;
            default: return null;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Postulaciones Laborales</h1>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-pink-500" /></div>
            ) : applications.length === 0 ? (
                <p className="text-zinc-400">No hay postulaciones aún.</p>
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-950 text-zinc-400 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">Puesto</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">CV</th>
                                    <th className="px-6 py-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(app.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-white">{app.fullName}</td>
                                        <td className="px-6 py-4">{app.position || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{app.email}</span>
                                                <span className="text-xs text-zinc-500">{app.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                                        <td className="px-6 py-4">
                                            <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400 flex items-center gap-1">
                                                <Download size={16} /> Descargar
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="bg-zinc-800 border-zinc-700 rounded text-xs px-2 py-1 outline-none focus:ring-1 focus:ring-pink-500"
                                                value={app.status}
                                                onChange={(e) => updateStatus(app.id, e.target.value)}
                                            >
                                                <option value="pending">Pendiente</option>
                                                <option value="reviewed">Revisado</option>
                                                <option value="contacted">Contactado</option>
                                                <option value="rejected">Rechazado</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
