'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

// Enum debe coincidir con backend
enum GoogleReviewStatus {
    NONE = 'NONE',
    PENDING_VALIDATION = 'PENDING_VALIDATION',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

interface ReviewUser {
    id: string;
    name: string;
    email: string;
    googleReviewStatus: GoogleReviewStatus;
    updatedAt: string;
}

interface Reward {
    id: string;
    name: string;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<ReviewUser[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedRewardId, setSelectedRewardId] = useState<string>('');

    const fetchReviews = async (status?: string) => {
        setLoading(true);
        try {
            const params = status && status !== 'ALL' ? { status } : {};
            const { data } = await api.get('/users/google-reviews', { params });
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Error al cargar las reseñas');
        } finally {
            setLoading(false);
        }
    };

    const fetchRewards = async () => {
        try {
            // Asumimos un endpoint para obtener premios activos.
            // Si /rewards no devuelve solo activos, filtraríamos en cliente.
            // Revisando endpoints comunes: /rewards suele devolver lista.
            const { data } = await api.get('/rewards');
            // Filtramos localmente para asegurar que solo mostramos premios "útiles" o activos si la API retorna todo
            // Ajustar según estructura real de Reward. Asumo 'isActive' o similar si existe, sino mostramos todos.
            setRewards(data.filter((r: any) => r.isActive !== false));
        } catch (error) {
            console.error('Error fetching rewards', error);
        }
    };

    useEffect(() => {
        fetchReviews('PENDING_VALIDATION'); // Cargar pendientes por defecto
        fetchRewards();
        fetchConfiguration();
    }, []);

    const fetchConfiguration = async () => {
        try {
            const { data } = await api.get('/configuration');
            if (data.google_review_reward_id) {
                setSelectedRewardId(data.google_review_reward_id);
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
        }
    };

    const handleRewardChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setSelectedRewardId(newValue);

        // Guardar configuración globalmente en BD
        try {
            await api.patch('/configuration', {
                google_review_reward_id: newValue
            });
            toast.success('Preferencia guardada globalmente');
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar preferencia');
        }
    };

    const handleApprove = async (userId: string) => {
        if (!selectedRewardId) {
            if (!confirm('No has seleccionado un premio específico. ¿Usar el premio automático (configurado por nombre/costo 0)?')) return;
        } else {
            if (!confirm('¿Aprobar reseña y enviar el premio seleccionado?')) return;
        }

        setProcessingId(userId);
        try {
            await api.post(`/users/${userId}/approve-google-review`, {
                rewardId: selectedRewardId || undefined
            });
            toast.success('Reseña aprobada correctamente');
            // Actualizar lista localmente o recargar
            setReviews(reviews.filter(r => r.id !== userId));
        } catch (error) {
            console.error(error);
            toast.error('Error al aprobar la reseña');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId: string) => {
        if (!confirm('¿Rechazar reseña?')) return;

        setProcessingId(userId);
        try {
            await api.post(`/users/${userId}/reject-google-review`);
            toast.success('Reseña rechazada');
            setReviews(reviews.filter(r => r.id !== userId));
        } catch (error) {
            console.error(error);
            toast.error('Error al rechazar');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold text-white mb-6">Administración de Reseñas</h1>

            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <CardTitle className="text-xl">Gestión de Solicitudes</CardTitle>
                    <CardDescription className="text-zinc-400">Valida las capturas de pantalla enviadas por los usuarios.</CardDescription>
                </CardHeader>
                <CardContent>

                    {/* Selector Global de Premio (Simplificación UX) */}
                    {/* 
                       Decisión de diseño: Poner el selector arriba para aplicar a próximas acciones 
                       evita repetir el select en cada fila o un modal complejo. 
                     */}
                    <div className="mb-6 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 max-w-md">
                        <Label className="mb-2 block text-zinc-300">Premio a otogar al aprobar:</Label>
                        <select
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                            value={selectedRewardId}
                            onChange={handleRewardChange}
                        >
                            <option value="">-- Automático (Buscar 'Google' o Costo 0) --</option>
                            {rewards.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-zinc-500 mt-1">Selecciona qué premio recibirán los usuarios al hacer clic en "Aprobar".</p>
                    </div>

                    <Tabs defaultValue="PENDING_VALIDATION" onValueChange={(val) => fetchReviews(val)}>
                        <TabsList className="grid w-full grid-cols-4 mb-4 bg-zinc-800">
                            <TabsTrigger value="PENDING_VALIDATION" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-zinc-400">Pendientes</TabsTrigger>
                            <TabsTrigger value="APPROVED" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400">Aprobadas</TabsTrigger>
                            <TabsTrigger value="REJECTED" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400">Rechazadas</TabsTrigger>
                            <TabsTrigger value="ALL" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400">Todas</TabsTrigger>
                        </TabsList>

                        <TabsContent value="PENDING_VALIDATION" className="mt-0">
                            {renderTable(reviews, loading, processingId, handleApprove, handleReject, true)}
                        </TabsContent>
                        <TabsContent value="APPROVED" className="mt-0">
                            {renderTable(reviews, loading, processingId, handleApprove, handleReject, true)}
                        </TabsContent>
                        <TabsContent value="REJECTED" className="mt-0">
                            {renderTable(reviews, loading, processingId, handleApprove, handleReject, true)}
                        </TabsContent>
                        <TabsContent value="ALL" className="mt-0">
                            {renderTable(reviews, loading, processingId, handleApprove, handleReject, true)}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function renderTable(
    reviews: ReviewUser[],
    loading: boolean,
    processingId: string | null,
    onApprove: (id: string) => void,
    onReject: (id: string) => void,
    showActions: boolean
) {
    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>;
    }

    if (reviews.length === 0) {
        return <div className="text-center p-8 text-zinc-500">No hay reseñas en esta categoría.</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableHead className="text-zinc-400">Fecha</TableHead>
                    <TableHead className="text-zinc-400">Usuario</TableHead>
                    <TableHead className="text-zinc-400">Email</TableHead>
                    <TableHead className="text-zinc-400">Estado</TableHead>
                    {showActions && <TableHead className="text-right text-zinc-400">Acciones</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {reviews.map((review) => (
                    <TableRow key={review.id} className="border-zinc-800 hover:bg-zinc-900/50">
                        <TableCell className="text-zinc-300">{new Date(review.updatedAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                        <TableCell className="font-medium text-white">{review.name || 'N/A'}</TableCell>
                        <TableCell className="text-zinc-300">{review.email}</TableCell>
                        <TableCell>
                            {review.googleReviewStatus === 'APPROVED' && <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border-green-600/50">Aprobada</Badge>}
                            {review.googleReviewStatus === 'REJECTED' && <Badge className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border-red-600/50">Rechazada</Badge>}
                            {review.googleReviewStatus === 'PENDING_VALIDATION' && <Badge className="bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 border-yellow-600/50">Pendiente</Badge>}
                            {review.googleReviewStatus === 'NONE' && <Badge variant="outline" className="text-zinc-500 border-zinc-700">N/A</Badge>}
                        </TableCell>
                        {showActions && (
                            <TableCell className="text-right space-x-2">
                                {/* Approve Button: Show if NOT Approved */}
                                {review.googleReviewStatus !== 'APPROVED' && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white border-0"
                                        onClick={() => onApprove(review.id)}
                                        disabled={processingId === review.id}
                                        title="Aprobar"
                                    >
                                        {processingId === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </Button>
                                )}

                                {/* Reject Button: Show if NOT Rejected */}
                                {review.googleReviewStatus !== 'REJECTED' && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="bg-red-600/80 hover:bg-red-700"
                                        onClick={() => onReject(review.id)}
                                        disabled={processingId === review.id}
                                        title="Rechazar"
                                    >
                                        {processingId === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                    </Button>
                                )}
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
