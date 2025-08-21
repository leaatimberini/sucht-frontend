'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Crown, Gift, Ticket, User as UserIcon } from 'lucide-react';

// --- TIPOS DE DATOS ---
interface ScanDetails {
    clientName?: string;
    ticketType?: string;
    productName?: string;
    isVip?: boolean;
    origin?: string;
    promoterName?: string | null;
    specialInstructions?: string | null;
    redeemedAt?: string | null;
}
interface ScanResult {
    type: 'ticket' | 'product';
    isValid: boolean;
    message: string;
    details: ScanDetails;
}

// --- SUB-COMPONENTE PARA MOSTRAR RESULTADOS ---
function ResultDisplay({ result, onScanNext }: { result: ScanResult; onScanNext: () => void }) {
    const { isValid, message, details, type } = result;
    const title = isValid ? "Acceso Autorizado" : "Acceso Denegado";
    const Icon = isValid ? CheckCircle : XCircle;
    const colorClass = isValid ? "text-green-400" : "text-red-500";

    return (
        <div className={`w-full max-w-md mx-auto text-center border-2 ${isValid ? 'border-green-500' : 'border-red-500'} bg-zinc-900 rounded-lg p-6 animate-fade-in`}>
            <Icon className={`h-16 w-16 mx-auto ${colorClass}`} />
            <h2 className={`text-3xl font-bold ${colorClass} mt-4`}>{title}</h2>
            <p className="text-zinc-300 mt-2 text-lg">{message}</p>
            
            <div className="text-left bg-zinc-800 rounded-lg p-4 mt-6 space-y-2">
                {details.clientName && <p><UserIcon className="inline-block mr-2" size={16}/> {details.clientName}</p>}
                {type === 'ticket' && details.ticketType && <p><Ticket className="inline-block mr-2" size={16}/> {details.ticketType}</p>}
                {type === 'product' && details.productName && <p><Gift className="inline-block mr-2" size={16}/> {details.productName}</p>}
                {details.isVip && <p className="font-bold text-amber-400"><Crown className="inline-block mr-2" size={16}/> Acceso VIP</p>}
                {details.specialInstructions && <p className="font-bold text-pink-400">{details.specialInstructions}</p>}
                {details.origin && details.origin.includes('INVITATION') && <p className="text-sky-400">Invitación de {details.promoterName || 'SUCHT'}</p>}
            </div>

            <button onClick={onScanNext} className="w-full mt-6 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg">Escanear Siguiente</button>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL DEL ESCÁNER ---
export function UniversalQrScanner() {
    const [result, setResult] = useState<ScanResult | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        if (!isScanning || result) return;

        const scanner = new Html5QrcodeScanner(
            'qr-reader', 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        const handleScanSuccess = async (decodedText: string) => {
            setIsScanning(false);
            scanner.clear();
            toast.loading('Verificando QR...');

            try {
                const response = await api.post('/verifier/scan', { qrId: decodedText });
                setResult(response.data);
                toast.dismiss();
            } catch (error: any) {
                toast.dismiss();
                const errorMessage = error.response?.data?.message || 'Error al procesar el QR.';
                toast.error(errorMessage);
                setResult({
                    type: 'ticket',
                    isValid: false,
                    message: errorMessage,
                    details: {}
                });
            }
        };

        scanner.render(handleScanSuccess, (error) => {
            // No hacemos nada con los errores de escaneo para no molestar al usuario
        });

        return () => {
            if (scanner && scanner.getState()) {
                scanner.clear().catch(err => console.error("Fallo al limpiar el scanner de QR.", err));
            }
        };
    }, [isScanning, result]);

    const resetScanner = () => {
        setResult(null);
        setIsScanning(true);
    };

    if (result) {
        return <ResultDisplay result={result} onScanNext={resetScanner} />;
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