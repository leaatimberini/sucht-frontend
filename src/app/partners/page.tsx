'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, QrCode, Store, Save, Trash2, BarChart2, Edit, Power, PowerOff, X, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { PartnerScratchPanel } from '@/components/partners/PartnerScratchPanel';

export default function PartnerDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [benefits, setBenefits] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'benefits' | 'validate' | 'analytics' | 'scratch'>('profile');
    const [validationCode, setValidationCode] = useState('');
    const [validationResult, setValidationResult] = useState<any>(null);
    const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);

    // Forms
    const { register: registerProfile, handleSubmit: handleProfileSubmit } = useForm();
    const { register: registerBenefit, handleSubmit: handleBenefitSubmit, reset: resetBenefit, setValue: setBenefitValue } = useForm();
    const [isCreatingBenefit, setIsCreatingBenefit] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, benefitsRes, categoriesRes] = await Promise.all([
                api.get('/partners/profile/me'),
                api.get('/benefits/partner/me'),
                api.get('/partners/categories')
            ]);
            setProfile(profileRes.data);
            setBenefits(benefitsRes.data);
            setCategories(categoriesRes.data);

            if (profileRes.data?.id) {
                const statsRes = await api.get(`/partners/${profileRes.data.id}/stats`);
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const onUpdateProfile = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            if (data.description) formData.append('description', data.description);
            if (data.instagramUrl) formData.append('instagramUrl', data.instagramUrl);
            if (data.address) formData.append('address', data.address);
            if (data.whatsapp) formData.append('whatsapp', data.whatsapp);
            if (data.category) formData.append('category', data.category);

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
    };

    const onSaveBenefit = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            if (data.description) formData.append('description', data.description);
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
        } catch (error: any) {
            console.error(error);
            toast.error('Error al guardar beneficio');
        }
    };

    const handleDeleteBenefit = async (id: string, title: string) => {
        if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return;
        try {
            await api.delete(`/benefits/${id}`);
            toast.success('Beneficio eliminado');
            fetchData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleToggleActive = async (benefit: any) => {
        try {
            await api.patch(`/benefits/${benefit.id}/toggle`); // Assumes endpoint exists
            toast.success(`Beneficio ${benefit.isActive ? 'desactivado' : 'activado'}`);
            fetchData();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    const startEditBenefit = (benefit: any) => {
        setEditingBenefitId(benefit.id);
        setIsCreatingBenefit(true);
        setBenefitValue('title', benefit.title);
        setBenefitValue('description', benefit.description);
        // Image cannot be set on file input, user must re-upload if changing
    };

    const cancelEdit = () => {
        setIsCreatingBenefit(false);
        setEditingBenefitId(null);
        resetBenefit();
    };

    const onValidateCoupon = async () => {
        if (!validationCode) {
            toast.error('Ingresa un código');
            return;
        }
        try {
            const { data } = await api.post('/partners/validate-coupon', { code: validationCode });
            setValidationResult({ success: true, data });
            toast.success('Cupón válido');
            fetchData(); // Refresh stats
        } catch (error: any) {
            setValidationResult({ success: false, message: error.response?.data?.message || 'Cupón inválido' });
            toast.error('Cupón inválido o ya canjeado');
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                            Panel de Partner
                        </h1>
                        <p className="text-zinc-500">Gestiona tu perfil, beneficios y canjes.</p>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-8 border-b border-zinc-800">
                    <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <Store className="w-4 h-4 inline mr-2" /> Mi Perfil
                    </button>
                    <button onClick={() => setActiveTab('benefits')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'benefits' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <Plus className="w-4 h-4 inline mr-2" /> Beneficios
                    </button>
                    <button onClick={() => setActiveTab('validate')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'validate' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <QrCode className="w-4 h-4 inline mr-2" /> Validar Cupón
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'analytics' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <BarChart2 className="w-4 h-4 inline mr-2" /> Estadísticas
                    </button>
                    <button onClick={() => setActiveTab('scratch')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'scratch' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <Sparkles className="w-4 h-4 inline mr-2" /> Raspe y Gane
                    </button>
                </div>

                {/* Content */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">

                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4 max-w-xl">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre del Negocio</label>
                                <input {...registerProfile('name', { required: true })} defaultValue={profile?.name} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción</label>
                                <textarea {...registerProfile('description')} defaultValue={profile?.description} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 h-24 text-white" />
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
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Imagen de Portada</label>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Dirección</label>
                                    <input {...registerProfile('address')} defaultValue={profile?.address} placeholder="Ej: Av. Santa Fe 1234, CABA" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Rubro / Categoría</label>
                                    <input
                                        list="categories-list"
                                        {...registerProfile('category')}
                                        defaultValue={profile?.category}
                                        placeholder="Ej: Gastronomía"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                                    />
                                    <datalist id="categories-list">
                                        {categories.map((c: string) => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Instagram URL</label>
                                    <input {...registerProfile('instagramUrl')} defaultValue={profile?.instagramUrl} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">WhatsApp</label>
                                    <input {...registerProfile('whatsapp')} defaultValue={profile?.whatsapp} placeholder="Ej: 5491112345678" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white" />
                                </div>
                            </div>

                            <button type="submit" className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 mt-4">
                                <Save className="w-4 h-4" /> Guardar Perfil
                            </button>
                        </form>
                    )}

                    {activeTab === 'benefits' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Mis Beneficios</h2>
                                {!isCreatingBenefit && (
                                    <button onClick={() => { setIsCreatingBenefit(true); setEditingBenefitId(null); resetBenefit(); }} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-white">
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
                                    <input {...registerBenefit('title', { required: true })} placeholder="Título (Ej: 2x1 en Tragos)" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" />
                                    <textarea {...registerBenefit('description')} placeholder="Descripción" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" />
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
                                                <h4 className="font-bold text-lg text-white">{b.title}</h4>
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
                            <h2 className="text-2xl font-bold mb-6 text-white">Validar Cupón</h2>
                            <div className="flex gap-2 mb-8">
                                <input
                                    type="text"
                                    value={validationCode}
                                    onChange={(e) => setValidationCode(e.target.value.toUpperCase())}
                                    placeholder="CÓDIGO (Ej: A1B2)"
                                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-center text-2xl tracking-widest uppercase font-mono text-white"
                                />
                                <button onClick={onValidateCoupon} className="bg-pink-600 hover:bg-pink-700 text-white px-6 rounded-lg font-bold">
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
                            <h2 className="text-xl font-bold mb-6 text-white">Estadísticas</h2>
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
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'scratch' && (
                        <PartnerScratchPanel />
                    )}

                </div>
            </div>
        </div>
    );
}
