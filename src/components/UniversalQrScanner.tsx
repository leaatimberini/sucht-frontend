'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Crown, Gift, Ticket, User as UserIcon } from 'lucide-react';
import type { Ticket as TicketType } from '@/types/ticket.types';

// --- TIPOS DE DATOS ---
interface ScanDetails {
    clientName?: string | null;
    user?: { name: string | null };
    ticketType?: string;
    productName?: string;
    isVipAccess?: boolean;
    origin?: string | null;
    promoterName?: string | null;
    specialInstructions?: string | null;
    redeemedAt?: string | null;
    quantity?: number;
    redeemedCount?: number;
    id?: string;
    tier?: { name: string };
}
interface ScanResponse {
    type: 'ticket' | 'product' | 'reward';
    isValid: boolean;
    message: string;
    details: any;
}
interface ResultState {
    status: 'success' | 'error';
    message: string;
    details: ScanDetails;
    type: 'ticket' | 'product' | 'reward';
}

// --- SUB-COMPONENTE PARA MOSTRAR RESULTADOS ---
function ResultDisplay({ result, onScanNext }: { result: ResultState; onScanNext: () => void }) {
    const isSuccess = result.status === 'success';
    const { message, details, type } = result;
    const title = isSuccess ? "Acción Exitosa" : "Acción Denegada";
    const Icon = isSuccess ? CheckCircle : XCircle;
    const colorClass = isSuccess ? "text-green-400" : "text-red-500";
    const clientName = details.clientName || details.user?.name;

    return (
        <div className={`w-full max-w-md mx-auto text-center border-2 ${isSuccess ? 'border-green-500' : 'border-red-500'} bg-zinc-900 rounded-lg p-6 animate-fade-in`}>
            <Icon className={`h-16 w-16 mx-auto ${colorClass}`} />
            <h2 className={`text-3xl font-bold ${colorClass} mt-4`}>{title}</h2>
            <p className="text-zinc-300 mt-2 text-lg">{message}</p>
            {isSuccess && (
                <div className="text-left bg-zinc-800 rounded-lg p-4 mt-6 space-y-3">
                    {clientName && <p className="flex items-center"><UserIcon className="inline-block mr-2" size={16} /> {clientName}</p>}
                    {type === 'ticket' && details.tier?.name && <p className="flex items-center"><Ticket className="inline-block mr-2" size={16} /> {details.tier.name}</p>}
                    {(type === 'product' || type === 'reward') && details.productName && <p className="flex items-center"><Gift className="inline-block mr-2" size={16} /> {details.productName}</p>}
                    {details.isVipAccess && <p className="font-bold text-amber-400 flex items-center"><Crown className="inline-block mr-2" size={16} /> Acceso VIP</p>}
                    {details.specialInstructions && <p className="font-bold text-pink-400">{details.specialInstructions}</p>}
                </div>
            )}
            <button onClick={onScanNext} className="w-full mt-6 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg">Escanear Siguiente</button>
        </div>
    );
}

// --- SUB-COMPONENTE PARA CANJE PARCIAL ---
function RedeemInterface({ ticket, onRedeem, onCancel }: { ticket: TicketType, onRedeem: (result: { status: 'success' | 'error', message: string }) => void, onCancel: () => void }) {
    const [quantity, setQuantity] = useState(1);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const remaining = ticket.quantity - ticket.redeemedCount;

    const handleRedeem = async () => {
        if (quantity > remaining || quantity <= 0) {
            toast.error(`La cantidad a canjear no es válida.`);
            return;
        }
        setIsRedeeming(true);
        try {
            const response = await api.post(`/tickets/${ticket.id}/redeem`, { quantity });
            onRedeem({ status: 'success', message: response.data.message });
        } catch (error: any) {
            onRedeem({ status: 'error', message: error.response?.data?.message || 'Error desconocido.' });
        } finally {
            setIsRedeeming(false);
        }
    };
    return (
        <div className="w-full max-w-md mx-auto text-center border border-zinc-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white">Entrada Válida</h2>
            {ticket.isVipAccess && (
                <div className="mt-4 font-bold text-lg p-3 bg-yellow-400 text-black rounded-md animate-pulse flex items-center justify-center">
                    <Crown className="inline-block mr-2" size={20} /> ACCESO VIP
                </div>
            )}
            <p className="text-zinc-300 mt-4">{ticket.user?.name}</p>
            <p className="text-zinc-400 text-sm">{ticket.tier?.name}</p>
            {ticket.specialInstructions && <p className="font-bold text-pink-400 mt-2">{ticket.specialInstructions}</p>}
            <p className="font-bold text-3xl text-pink-500 my-4">{remaining} / {ticket.quantity} disponibles</p>
            <div className="space-y-2">
                <label htmlFor="redeem-quantity" className="block text-sm font-medium text-zinc-300">¿Cuántas personas ingresan?</label>
                <input id="redeem-quantity" type="number" min="1" max={remaining} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full bg-zinc-800 rounded-md p-2 text-white text-center text-xl" />
            </div>
            <div className="mt-6 space-y-3">
                <button onClick={handleRedeem} disabled={isRedeeming} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
                    {isRedeeming ? 'Validando...' : `Validar ${quantity} Ingreso(s)`}
                </button>
                <button onClick={onCancel} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 rounded-lg">
                    Cancelar
                </button>
            </div>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL DEL ESCÁNER ---
export function UniversalQrScanner() {
    const [result, setResult] = useState<ResultState | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [scannedTicket, setScannedTicket] = useState<TicketType | null>(null);

    useEffect(() => {
        if (!isScanning) return;

        const scanner = new Html5QrcodeScanner(
            'qr-reader',
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                videoConstraints: {
                    facingMode: "environment"
                }
            },
            false
        );

        const handleScanSuccess = async (decodedText: string) => {
            setIsScanning(false);
            scanner.clear();
            toast.loading('Verificando QR...');

            try {
                // Paso 1: Verificar el QR para obtener los detalles.
                const response = await api.post<ScanResponse>('/verifier/scan', { qrId: decodedText });
                const scanData = response.data;
                toast.dismiss();

                if (!scanData.isValid) {
                    throw new Error(scanData.message);
                }

                // --- FIX: LÓGICA DE ESCANEO UNIFICADA ---
                if (scanData.type === 'ticket') {
                    // CUALQUIER ticket válido (individual o grupal) ahora pasa a la pantalla de canje.
                    // Esto soluciona el bug de no-canje y unifica la experiencia de usuario.
                    setScannedTicket(scanData.details as TicketType);
                } else {
                    // Los productos y premios (que se canjean al escanear) se muestran directamente.
                    setResult({
                        status: 'success',
                        message: scanData.message,
                        details: scanData.details,
                        type: scanData.type,
                    });
                }
                // --- FIN DEL FIX ---

            } catch (error: any) {
                toast.dismiss();
                const errorMessage = error.response?.data?.message || error.message || 'Error al procesar el QR.';
                toast.error(errorMessage);
                setResult({ status: 'error', message: errorMessage, details: {}, type: 'ticket' });
            }
        };

        scanner.render(handleScanSuccess, () => { });

        return () => {
            if (scanner && scanner.getState()) {
                scanner.clear().catch(err => console.error("Fallo al limpiar el scanner de QR.", err));
            }
        };
    }, [isScanning]);

    const resetScanner = () => {
        setResult(null);
        setScannedTicket(null);
        setIsScanning(true);
    };

    if (result) {
        return <ResultDisplay result={result} onScanNext={resetScanner} />;
    }

    if (scannedTicket) {
        return <RedeemInterface
            ticket={scannedTicket}
            onCancel={resetScanner}
            onRedeem={({ status, message }) => setResult({ status, message, details: scannedTicket, type: 'ticket' })}
        />;
    }

    return (
        <div className="w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div id="qr-reader" />
            <div className="p-4 text-center border-t border-zinc-800">
                <p className="text-zinc-400 text-sm">Apunta la cámara al código QR</p>
            </div>
        </div>
    );
}