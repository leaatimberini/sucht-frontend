'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from "@/lib/axios";

export default function WorkWithUsPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        position: 'Bartender',
        message: '',
        instagram: '',
    });
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cvFile) {
            toast.error('Por favor, sube tu CV.');
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('position', formData.position);
            data.append('message', formData.message);
            if (formData.instagram) data.append('instagram', formData.instagram);
            data.append('cv', cvFile);

            await api.post('/job-applications', data);

            toast.success('¡Postulación enviada con éxito! Te contactaremos pronto.');
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                position: 'Bartender',
                message: '',
                instagram: '',
            });
            setCvFile(null);
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al enviar la postulación.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="container mx-auto max-w-2xl">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-8 text-center">
                    Trabaja con Nosotros
                </h1>
                <p className="text-zinc-400 text-center mb-12">
                    ¡Únete al equipo de SUCHT! Estamos buscando personas apasionadas y talentosas para crear las mejores experiencias nocturnas.
                </p>

                <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Nombre Completo</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                placeholder="Juan Pérez"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                placeholder="juan@ejemplo.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Teléfono</label>
                            <input
                                type="tel"
                                required
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                placeholder="+54 11 ..."
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Puesto de Interés</label>
                            <select
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            >
                                <option value="Bartender">Bartender</option>
                                <option value="Barback">Barback</option>
                                <option value="Cajero">Cajero/a</option>
                                <option value="Seguridad">Seguridad</option>
                                <option value="RRPP">Relaciones Públicas</option>
                                <option value="DJ">DJ</option>
                                <option value="Fotografo">Fotógrafo/a</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Tu Mensaje (Opcional)</label>
                            <textarea
                                rows={4}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                                placeholder="Cuéntanos por qué quieres trabajar con nosotros..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Instagram (Opcional)</label>
                            <input
                                type="text"
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                placeholder="@tuusuario"
                                value={formData.instagram}
                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Curriculum Vitae (PDF/Word)</label>
                        <div className="relative border-2 border-dashed border-zinc-700 rounded-lg p-6 hover:border-pink-500 transition-colors text-center cursor-pointer">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => e.target.files && setCvFile(e.target.files[0])}
                            />
                            <div className="flex flex-col items-center justify-center space-y-2 text-zinc-400">
                                <Upload className="h-8 w-8 text-pink-500" />
                                {cvFile ? (
                                    <span className="text-white font-medium">{cvFile.name} ({Math.round(cvFile.size / 1024)} KB)</span>
                                ) : (
                                    <span>Haz clic o arrastra tu CV aquí</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-pink-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Postulación'}
                    </button>
                </form>
            </div>
        </div>
    );
}
