'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Loader2, Eye, Ticket, Users, BarChart, Plus, Mail, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

export default function AdminPartnersPage() {
    const [partners, setPartners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const { data } = await api.get('/partners/admin/all');
            setPartners(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/partners/${id}/approve`);
            // toast.success('Partner aprobado');
            fetchPartners();
        } catch (error) {
            console.error(error);
            alert('Error al aprobar');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('¿Rechazar solicitud?')) return;
        try {
            await api.patch(`/partners/${id}/reject`);
            fetchPartners();
        } catch (error) {
            console.error(error);
            alert('Error al rechazar');
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        setInviteError('');
        setInviteSuccess('');

        try {
            await api.post('/users/invite-staff', {
                email: inviteEmail,
                roles: ['partner']
            });
            setInviteSuccess(`Invitación enviada correctamente a ${inviteEmail}`);
            setInviteEmail('');
            setTimeout(() => {
                setIsInviteModalOpen(false);
                setInviteSuccess('');
                fetchPartners(); // Refresh list in case they were already a user and just got the role
            }, 2000);
        } catch (error: any) {
            console.error(error);
            setInviteError(error.response?.data?.message || 'Error al enviar invitación');
        } finally {
            setIsInviting(false);
        }
    };

    const handleDelete = async (partnerId: string, partnerName: string) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar a "${partnerName}"?\n\n¡ESTA ACCIÓN ES IRREVERSIBLE!\nSe borrarán TODOS los datos asociados:\n- Perfil del Partner\n- Todos los Beneficios/Cupones\n- Historial de canjes y estadísticas\n\n¿Confirmar eliminación?`)) {
            try {
                await api.delete(`/partners/${partnerId}`);
                // toast.success('Partner eliminado correctamente'); // Can add toast here if imported, or just refresh
                fetchPartners();
            } catch (error: any) {
                console.error(error);
                alert('Hubo un error al eliminar el partner.');
            }
        }
    };

    if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline" /></div>;

    // Calculate Global Stats
    const globalStats = partners.reduce((acc, p) => ({
        totalViews: acc.totalViews + (Number(p.stats?.totalViews) || 0),
        totalCouponsIssued: acc.totalCouponsIssued + (Number(p.stats?.coupons?.totalRedemptions) || 0),
        totalCouponsRedeemed: acc.totalCouponsRedeemed + (Number(p.stats?.coupons?.redeemedCount) || 0),
    }), { totalViews: 0, totalCouponsIssued: 0, totalCouponsRedeemed: 0 });

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Administración de Partners</h1>
                    <p className="text-zinc-500">Gestión y monitoreo del Club de Beneficios.</p>
                </div>
                <Button onClick={() => setIsInviteModalOpen(true)} className="bg-pink-600 hover:bg-pink-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Invitar Partner
                </Button>
            </div>

            {/* Global Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-400"><Eye className="w-6 h-6" /></div>
                    <div>
                        <p className="text-zinc-500 text-sm">Vistas Totales (Perfiles)</p>
                        <p className="text-2xl font-bold">{globalStats.totalViews}</p>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-full text-purple-400"><Ticket className="w-6 h-6" /></div>
                    <div>
                        <p className="text-zinc-500 text-sm">Cupones Generados</p>
                        <p className="text-2xl font-bold">{globalStats.totalCouponsIssued}</p>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full text-green-400"><Users className="w-6 h-6" /></div>
                    <div>
                        <p className="text-zinc-500 text-sm">Canjes Reales</p>
                        <p className="text-2xl font-bold">{globalStats.totalCouponsRedeemed}</p>
                        <span className="text-xs text-zinc-500">Conv: {globalStats.totalCouponsIssued > 0 ? Math.round((globalStats.totalCouponsRedeemed / globalStats.totalCouponsIssued) * 100) : 0}%</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'active' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:text-white'}`}
                >
                    Activos
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:text-white'}`}
                >
                    Solicitudes {partners.filter(p => !p.status || p.status === 'pending').length > 0 && <span className="ml-2 bg-pink-600 text-white px-2 py-0.5 rounded-full text-xs">{partners.filter(p => p.status === 'pending').length}</span>}
                </button>
            </div>

            {/* Partners Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                    <h3 className="font-bold flex items-center gap-2"><BarChart className="w-4 h-4" /> {activeTab === 'active' ? 'Listado de Partners' : 'Solicitudes Pendientes'}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-zinc-400 uppercase">
                            <tr>
                                <th className="p-4">Partner</th>
                                <th className="p-4">Instagram</th>
                                <th className="p-4">Vistas</th>
                                <th className="p-4">Cupones (Gen/Canj)</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {partners
                                .filter(p => activeTab === 'active' ? (p.status === 'approved' || !p.status) : p.status === 'pending')
                                .map(p => (
                                    <tr key={p.id} className="hover:bg-zinc-800/50">
                                        <td className="p-4 font-bold">{p.name || 'Sin nombre'}</td>
                                        <td className="p-4 text-zinc-400">{p.instagramUrl || '-'}</td>
                                        <td className="p-4">{p.stats?.totalViews || 0}</td>
                                        <td className="p-4">
                                            <span className="text-blue-400 font-bold">{p.stats?.coupons?.totalRedemptions || 0}</span>
                                            <span className="text-zinc-600 mx-1">/</span>
                                            <span className="text-green-400 font-bold">{p.stats?.coupons?.redeemedCount || 0}</span>
                                        </td>
                                        <td className="p-4">
                                            {/* Status badge */}
                                            <span className={`px-2 py-1 rounded text-xs ${p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                                                {p.status === 'pending' ? 'Pendiente' : 'Activo'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex items-center justify-end gap-2">
                                            {p.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(p.id)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold"
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(p.id)}
                                                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded text-xs"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(p.id, p.name || 'Sin Nombre')}
                                                className="text-zinc-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                                title="Eliminar Partner y todos sus datos"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            {partners.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No hay partners registrados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invitation Modal */}
            <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invitar Nuevo Partner">
                <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Email del Partner</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                            <input
                                type="email"
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-600"
                                placeholder="partner@empresa.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">
                            Si el usuario no existe, se le enviará un email con instrucciones. Si ya existe, se le asignará el rol de PARTNER.
                        </p>
                    </div>

                    {inviteError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                            {inviteError}
                        </div>
                    )}

                    {inviteSuccess && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm">
                            {inviteSuccess}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isInviting}>
                            {isInviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Enviar Invitación
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
