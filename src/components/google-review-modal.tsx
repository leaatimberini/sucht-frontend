'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { Loader2, Star, CheckCircle, Clock, XCircle, Gift } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

// Google Review Link
const GOOGLE_REVIEW_LINK = "https://share.google/F2MJtHGvzuddS1QYc"; // Link corto proporcionado por usuario
// O usar search link: https://www.google.com/search?q=Sucht+Club&ock=REVIEW

export function GoogleReviewModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<'NONE' | 'PENDING_VALIDATION' | 'APPROVED' | 'REJECTED' | 'LOADING'>('LOADING');
    const [reward, setReward] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await api.get('/users/google-review-status');
            setStatus(res.data.status);
            if (res.data.reward) {
                setReward(res.data.reward);
            }
            // Si el estado es NONE, abrir modal automáticamente (opcional, o mediante botón)
            // Por ahora, lo dejamos cerrado y que el usuario lo abra, o lo abrimos si nunca ha interactuado.
            // Decisión UX: Mostrar un banner pequeño o botón en Mi Cuenta que diga "Consumición GRATIS".
        } catch (error) {
            console.error('Error checking google review status', error);
            setStatus('NONE');
        }
    };

    const handleOpenReview = () => {
        window.open(GOOGLE_REVIEW_LINK, '_blank');
    };

    const handleClaim = async () => {
        setLoading(true);
        try {
            await api.post('/users/request-google-review-validation');
            setStatus('PENDING_VALIDATION');
            toast.success('Solicitud enviada. Nuestro staff verificará tu reseña pronto.');
        } catch (error) {
            toast.error('Error al enviar solicitud. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const getModalTitle = () => {
        if (status === 'APPROVED') return '¡Premio Desbloqueado!';
        if (status === 'PENDING_VALIDATION') return 'Verificando Reseña';
        return '¡Gana una Consumición!';
    };

    // Este componente puede ser usado como trigger + modal
    return (
        <>
            <div className="w-full mb-6">
                {status === 'NONE' && (
                    <div className="bg-gradient-to-r from-pink-600 to-purple-700 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity shadow-lg border border-pink-500/20"
                        onClick={() => setIsOpen(true)}>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-full">
                                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">¡Consumición GRATIS! 🎁</h3>
                                <p className="text-white/80 text-sm">Califícanos en Google y recibe un regalo.</p>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" className="hidden sm:flex">
                            Ver más
                        </Button>
                    </div>
                )}

                {status === 'PENDING_VALIDATION' && (
                    <div className="bg-blue-900/40 border border-blue-500/30 rounded-xl p-4 flex items-center gap-4">
                        <div className="bg-blue-500/20 p-2 rounded-full">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-100">Verificando Reseña</h3>
                            <p className="text-blue-300/70 text-sm">Estamos validando tu reseña. Te avisaremos pronto.</p>
                        </div>
                    </div>
                )}
                {status === 'REJECTED' && (
                    <div className="bg-red-900/40 border border-red-500/30 rounded-xl p-4 flex items-center justify-between cursor-pointer"
                        onClick={() => setIsOpen(true)}>
                        <div className="flex items-center gap-4">
                            <div className="bg-red-500/20 p-2 rounded-full">
                                <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-100">Reseña No Encontrada</h3>
                                <p className="text-red-300/70 text-sm">No pudimos verificar tu reseña. Toca para reintentar.</p>
                            </div>
                        </div>
                    </div>
                )}
                {status === 'APPROVED' && reward && (
                    <div className="bg-green-900/40 border border-green-500/30 rounded-xl p-4 flex items-center justify-between cursor-pointer"
                        onClick={() => setIsOpen(true)}>
                        <div className="flex items-center gap-4">
                            <div className="bg-green-500/20 p-2 rounded-full">
                                <Gift className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-100">¡Premio Disponible!</h3>
                                <p className="text-green-300/70 text-sm">Tu reseña fue aprobada. Toca para ver tu premio.</p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-green-500 text-green-400 hover:bg-green-950">
                            Ver QR
                        </Button>
                    </div>
                )}
            </div>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={getModalTitle()}>
                <div className="py-2">
                    {/* Description based on status */}
                    <p className="text-zinc-400 text-sm mb-4">
                        {status === 'APPROVED'
                            ? 'Gracias por tu reseña. Disfruta tu regalo.'
                            : 'Ayúdanos a mejorar y recibe una consumición de regalo por tu tiempo.'}
                    </p>

                    {status === 'NONE' || status === 'REJECTED' ? (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <p className="text-zinc-300">
                                    1. Toca el botón para ir a Google Maps.
                                </p>
                                <Button onClick={handleOpenReview} variant="outline" className="w-full border-pink-500 text-pink-400 hover:bg-pink-950 hover:text-pink-300">
                                    <Star className="w-4 h-4 mr-2" />
                                    Ir a Calificar en Google
                                </Button>

                                <p className="text-zinc-300 pt-4">
                                    2. Sube tu reseña de 5 estrellas ⭐⭐⭐⭐⭐
                                </p>
                                <p className="text-zinc-300 pt-2">
                                    3. Vuelve aquí y confirma.
                                </p>
                            </div>

                            <Button
                                onClick={handleClaim}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                ¡Ya dejé mi reseña!
                            </Button>
                        </div>
                    ) : null}

                    {status === 'PENDING_VALIDATION' && (
                        <div className="text-center py-8 space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                            <p className="text-lg font-medium text-blue-100">Validando tu reseña...</p>
                            <p className="text-sm text-zinc-400">
                                Nuestro staff está verificando tu reseña en Google.
                                Esto puede tomar unos minutos. Te enviaremos una notificación cuando esté lista.
                            </p>
                            <Button onClick={() => setIsOpen(false)} variant="ghost" className="w-full mt-4">
                                Cerrar
                            </Button>
                        </div>
                    )}

                    {status === 'APPROVED' && reward && (
                        <div className="flex flex-col items-center justify-center space-y-6 py-2">
                            <div className="bg-white p-4 rounded-xl shadow-lg">
                                <QRCodeSVG value={reward.id} size={200} />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-pink-400">{reward.rewardName}</p>
                                <p className="text-sm text-zinc-500">Muestra este QR en la barra para canjear.</p>
                            </div>
                            <div className="bg-zinc-900 p-3 rounded-lg w-full text-center">
                                <p className="text-xs text-zinc-500 font-mono break-all">{reward.id}</p>
                            </div>
                            <Button onClick={() => setIsOpen(false)} variant="ghost" className="w-full">
                                Cerrar
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
