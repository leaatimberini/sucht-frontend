'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, QrCode, Store, Save, Trash2, BarChart2, Edit, Power, PowerOff, X } from 'lucide-react'; // Added icons
import { useForm } from 'react-hook-form';

export default function PartnerDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [benefits, setBenefits] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null); // New state for stats
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'benefits' | 'validate' | 'analytics'>('profile');
    const [validationCode, setValidationCode] = useState('');
    const [validationResult, setValidationResult] = useState<any>(null);
    const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null); // For edit mode

    // Forms
    const { register: registerProfile, handleSubmit: handleProfileSubmit } = useForm();
    const { register: registerBenefit, handleSubmit: handleBenefitSubmit, reset: resetBenefit, setValue: setBenefitValue } = useForm();
    const [isCreatingBenefit, setIsCreatingBenefit] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, benefitsRes] = await Promise.all([
                api.get('/partners/profile/me'),
                api.get('/benefits/partner/me')
            ]);
            setProfile(profileRes.data);
            setBenefits(benefitsRes.data);

            // Fetch stats if profile exists
            if (profileRes.data?.id) {
                const statsRes = await api.get(`/partners/${profileRes.data.id}/stats`);
                setStats(statsRes.data);
            }

        } catch (error) {
            console.error(error);
            // Check if 404/403 -> Maybe redirect or show "Create Profile" if empty
            // For now assume user has the role but maybe no profile created yet
        } finally {
            setIsLoading(false);
        }
    };

    const onUpdateProfile = async (data: any) => {
        try {
            // Clean empty strings to avoid IsUrl validation errors
            const cleanData = Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
            );

            if (profile) {
                await api.patch(`/partners/${profile.id}`, cleanData);
            } else {
                await api.post('/partners', cleanData);
            }
            toast.success('Perfil actualizado');
            fetchData();
        } catch (error: any) {
            const msg = error.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg[0] : 'Error al guardar perfil');
        }
    };

    const onSaveBenefit = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            if (data.description) formData.append('description', data.description);
            // Append other fields if you add them later (conditions, validFrom, etc)

            if (data.image && data.image[0]) {
                formData.append('image', data.image[0]);
            }

            if (editingBenefitId) {
                await api.patch(`/benefits/${editingBenefitId}`, formData);
                toast.success('Beneficio actualizado');
            } else {
                await api.post('/benefits', formData);
                toast.success('Beneficio creado');
            }

            setIsCreatingBenefit(false);
            setEditingBenefitId(null);
            resetBenefit();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar beneficio');
        }
    };

    const handleDeleteBenefit = async (id: string, title: string) => {
        if (!confirm(`¿Eliminar el beneficio "${title}"?`)) return;
        try {
            await api.delete(`/benefits/${id}`);
            toast.success('Beneficio eliminado');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar');
        }
    };

    const handleToggleActive = async (benefit: any) => {
        try {
            await api.patch(`/benefits/${benefit.id}`, { isActive: !benefit.isActive });
            toast.success(benefit.isActive ? 'Beneficio desactivado' : 'Beneficio activado');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Error al cambiar estado');
        }
    };

    const startEditBenefit = (benefit: any) => {
        setEditingBenefitId(benefit.id);
        setBenefitValue('title', benefit.title);
        setBenefitValue('description', benefit.description);
        setIsCreatingBenefit(true);
    };

    const cancelEdit = () => {
        setIsCreatingBenefit(false);
        setEditingBenefitId(null);
        resetBenefit();
    };

    const onValidateCoupon = async () => {
        if (!validationCode) return;
        try {
            setValidationResult(null);
            const { data } = await api.post(`/benefits/validate/${validationCode}`);
            setValidationResult({ success: true, data });
            toast.success('¡Cupón validado con éxito!');
        } catch (error: any) {
            setValidationResult({ success: false, message: error.response?.data?.message || 'Código inválido' });
            toast.error('Cupón inválido');
        }
    };

    if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline" /></div>;

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen">
            <header className="mb-8 border-b border-zinc-800 pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                        Partner Dashboard {profile?.name ? `- ${profile.name}` : ''}
                    </h1>
                    <p className="text-zinc-500">Gestiona tu negocio y valida cupones</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-pink-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                >
                    <Store className="w-4 h-4 inline mr-2" />
                    Perfil
                </button>
                <button
                    onClick={() => setActiveTab('benefits')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'benefits' ? 'bg-pink-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Beneficios
                </button>
                <button
                    onClick={() => setActiveTab('validate')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'validate' ? 'bg-pink-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                >
                    <QrCode className="w-4 h-4 inline mr-2" />
                    Validar Cupón
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'analytics' ? 'bg-pink-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                >
                    <BarChart2 className="w-4 h-4 inline mr-2" />
                    Estadísticas
                </button>
            </div>

            {/* CONTENT */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">

                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileSubmit(async (data: any) => {
                        try {
                            const formData = new FormData();
                            formData.append('name', data.name);
                            if (data.description) formData.append('description', data.description);
                            if (data.instagramUrl) formData.append('instagramUrl', data.instagramUrl);
                            if (data.address) formData.append('address', data.address);
                            if (data.whatsapp) formData.append('whatsapp', data.whatsapp);

                            // Handle file logic
                            if (data.logo && data.logo[0]) {
                                formData.append('logo', data.logo[0]);
                            }

                            if (data.cover && data.cover[0]) {
                                formData.append('cover', data.cover[0]);
                            }

                            if (profile) {
                                await api.patch(`/partners/${profile.id}`, formData);
                            } else {
                                await api.post('/partners', formData);
                            }
                            toast.success('Perfil actualizado');
                            fetchData();
                        } catch (error: any) {
                            const msg = error.response?.data?.message;
                            toast.error(Array.isArray(msg) ? msg[0] : 'Error al guardar perfil');
                        }
                    })} className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre del Negocio</label>
                            <input {...registerProfile('name', { required: true })} defaultValue={profile?.name} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción</label>
                            <textarea {...registerProfile('description')} defaultValue={profile?.description} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 h-24" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Logo</label>
                                <div className="flex flex-col gap-2">
                                    {profile?.logoUrl && (
                                        <div className="w-16 h-16 rounded overflow-hidden border border-zinc-700">
                                            <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...registerProfile('logo')}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Imagen de Portada (Opcional)</label>
                                <div className="flex flex-col gap-2">
                                    {profile?.coverUrl && (
                                        <div className="h-16 w-full rounded overflow-hidden border border-zinc-700 relative group">
                                            <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...registerProfile('cover')}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Dirección (Se mostrará &quot;Cómo llegar&quot;)</label>
                                <input {...registerProfile('address')} defaultValue={profile?.address} placeholder="Ej: Av. Santa Fe 1234, CABA" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Instagram URL</label>
                                <input {...registerProfile('instagramUrl')} defaultValue={profile?.instagramUrl} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">WhatsApp (Número Completo)</label>
                                <input {...registerProfile('whatsapp')} defaultValue={profile?.whatsapp} placeholder="Ej: 5491112345678" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2" />
                            </div>
                        </div>
                        <button type="submit" className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2">
                            <Save className="w-4 h-4" /> Guardar Perfil
                        </button>
                    </form>
                )}

                {activeTab === 'benefits' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Mis Beneficios</h2>
                            {!isCreatingBenefit && (
                                <button onClick={() => { setIsCreatingBenefit(true); setEditingBenefitId(null); resetBenefit(); }} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Crear Nuevo
                                </button>
                            )}
                        </div>

                        {isCreatingBenefit && (
                            <form onSubmit={handleBenefitSubmit(onSaveBenefit)} className="mb-8 p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-white">{editingBenefitId ? 'Editar Beneficio' : 'Nuevo Beneficio'}</h3>
                                    <button type="button" onClick={cancelEdit} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                                </div>
                                <input {...registerBenefit('title', { required: true })} placeholder="Título (Ej: 2x1 en Tragos)" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2" />
                                <textarea {...registerBenefit('description')} placeholder="Descripción" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2" />
                                <div className="space-y-1">
                                    <label className="text-sm text-zinc-400 font-medium">Imagen del Beneficio (Opcional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...registerBenefit('image')}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded text-sm text-zinc-400 hover:text-white">Cancelar</button>
                                    <button type="submit" className="bg-white text-black px-4 py-2 rounded text-sm font-bold">{editingBenefitId ? 'Guardar Cambios' : 'Publicar Beneficio'}</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {benefits.map(b => (
                                <div key={b.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        {b.imageUrl && (
                                            <div className="w-16 h-16 rounded overflow-hidden">
                                                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-lg">{b.title}</h4>
                                            <p className="text-zinc-500 text-sm line-clamp-1">{b.description}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${b.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {b.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                        <button
                                            onClick={() => handleToggleActive(b)}
                                            className={`p-2 rounded-lg transition-colors ${b.isActive ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                                            title={b.isActive ? 'Desactivar' : 'Activar'}
                                        >
                                            {b.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => startEditBenefit(b)}
                                            className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBenefit(b.id, b.title)}
                                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {benefits.length === 0 && <p className="text-zinc-500 italic text-center py-8">No tienes beneficios creados.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'validate' && (
                    <div className="max-w-md mx-auto text-center py-10">
                        <h2 className="text-2xl font-bold mb-6">Validar Cupón de Cliente</h2>
                        <div className="flex gap-2 mb-8">
                            <input
                                type="text"
                                value={validationCode}
                                onChange={(e) => setValidationCode(e.target.value.toUpperCase())}
                                placeholder="Ingresa el código (Ej: A1B2)"
                                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-center text-2xl tracking-widest uppercase font-mono"
                            />
                            <button onClick={onValidateCoupon} className="bg-pink-600 hover:bg-pink-700 px-6 rounded-lg font-bold">
                                Validar
                            </button>
                        </div>

                        {validationResult && (
                            <div className={`p-4 rounded-lg border ${validationResult.success ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                                {validationResult.success ? (
                                    <div className="text-left">
                                        <p className="text-green-400 font-bold text-lg mb-2">✅ Cupón Válido</p>
                                        <p className="text-zinc-300">Beneficio: <span className="text-white font-bold">{validationResult.data?.benefit?.title}</span></p>
                                        <p className="text-zinc-300">Cliente: <span className="text-white">{validationResult.data?.user?.name || validationResult.data?.user?.email}</span></p>
                                        <p className="text-zinc-500 text-sm mt-2">Canjeado exitosamente.</p>
                                    </div>
                                ) : (
                                    <p className="text-red-400 font-bold">❌ Error: {validationResult.message}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Estadísticas del Negocio</h2>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                                <p className="text-zinc-500 text-sm mb-1">Visitas al Perfil</p>
                                <p className="text-3xl font-bold text-white">{stats?.totalViews || 0}</p>
                            </div>
                            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                                <p className="text-zinc-500 text-sm mb-1">Cupones Solicitados</p>
                                <p className="text-3xl font-bold text-blue-400">{stats?.coupons?.totalRedemptions || 0}</p>
                            </div>
                            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                                <p className="text-zinc-500 text-sm mb-1">Cupones Canjeados</p>
                                <p className="text-3xl font-bold text-green-400">{stats?.coupons?.redeemedCount || 0}</p>
                                <p className="text-xs text-zinc-500 mt-1">Tasa de conversión: {stats?.coupons?.totalRedemptions > 0 ? Math.round((stats.coupons.redeemedCount / stats.coupons.totalRedemptions) * 100) : 0}%</p>
                            </div>
                        </div>

                        {/* Simple Chart (Views by Month) */}
                        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                            <h3 className="text-lg font-bold mb-4">Visitas Mensuales</h3>
                            {stats?.viewsByMonth && stats.viewsByMonth.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.viewsByMonth.map((m: any) => (
                                        <div key={m.month} className="flex items-center gap-4">
                                            <span className="w-20 text-sm text-zinc-400">{m.month}</span>
                                            <div className="flex-1 h-4 bg-zinc-900 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-pink-600 rounded-full"
                                                    style={{ width: `${Math.min((m.count / Math.max(...stats.viewsByMonth.map((x: any) => Number(x.count)))) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="w-12 text-sm font-bold text-right">{m.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 py-10 text-center">Aún no hay datos de visitas mensuales.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
