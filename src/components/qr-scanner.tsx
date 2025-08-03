// frontend/src/components/qr-scanner.tsx
'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Ticket, TicketStatus } from '@/types/ticket.types';
import toast from 'react-hot-toast';

// Componente para manejar el resultado del escaneo
function ScanResult({ result, onScanNext }: { result: any, onScanNext: () => void }) {
  const isSuccess = result.type === 'success';

  return (
    <div className="w-full max-w-md mx-auto text-center border border-zinc-700 rounded-lg p-6">
      {isSuccess ? (
        <>
          <svg className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <h2 className="text-2xl font-bold text-white mt-4">Ingreso Autorizado</h2>
          <p className="text-zinc-300 mt-2">
            <span className="font-semibold">{result.data.userName}</span>
            <br />
            <span className="text-sm text-zinc-400">{result.data.ticketType}</span>
          </p>
          <div className="mt-4 text-sm text-zinc-500">
            <p>Validado a las: {new Date(result.data.validatedAt).toLocaleString('es-AR')}</p>
          </div>
        </>
      ) : (
        <>
          <svg className="h-16 w-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          <h2 className="text-2xl font-bold text-red-500 mt-4">Ingreso Denegado</h2>
          <p className="text-zinc-400 mt-2">{result.data.message}</p>
        </>
      )}
      <button onClick={onScanNext} className="w-full mt-6 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg">
        Escanear Siguiente
      </button>
    </div>
  );
}

// Componente para la interfaz de canje
function RedeemInterface({ ticket, onRedeemed, onCancel }: { ticket: Ticket, onRedeemed: (result: any) => void, onCancel: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const remaining = ticket.quantity - ticket.redeemedCount;

  const handleRedeem = async () => {
    if (quantity > remaining) {
      toast.error(`No puedes canjear más de ${remaining} entradas.`);
      return;
    }
    setIsRedeeming(true);
    try {
      // CORRECCIÓN: Usamos el endpoint con el ID del ticket para el canje
      const response = await api.post(`/tickets/${ticket.id}/redeem`, { quantity });
      // CORRECCIÓN: Pasamos el resultado del backend a 'onRedeemed'
      onRedeemed({ type: 'success', data: response.data });
    } catch (error: any) {
      onRedeemed({ type: 'error', data: error.response?.data || { message: 'Error desconocido.' } });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center border border-zinc-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white">Entrada Válida</h2>
      <p className="text-zinc-300 mt-2">{ticket.user?.name}</p>
      <p className="text-zinc-400 text-sm">{ticket.tier?.name}</p>
      <p className="font-bold text-3xl text-pink-500 my-4">{remaining} / {ticket.quantity} disponibles</p>

      <div className="space-y-2">
        <label htmlFor="redeem-quantity" className="block text-sm font-medium text-zinc-300">¿Cuántas personas ingresan?</label>
        <input 
          id="redeem-quantity" 
          type="number"
          min="1"
          max={remaining}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full bg-zinc-800 rounded-md p-2 text-white text-center text-xl"
        />
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

export function QrScanner({ eventId }: { eventId: string }) {
  const [scannedTicket, setScannedTicket] = useState<Ticket | null>(null);
  const [redeemResult, setRedeemResult] = useState<any | null>(null);

  useEffect(() => {
    // Si ya tenemos un resultado o un ticket escaneado, no iniciamos el scanner
    if (scannedTicket || redeemResult) return;

    const onScanSuccess = async (decodedText: string) => {
      // Pausamos el scanner después del primer escaneo
      html5QrcodeScanner.pause(true);
      
      try {
        // CORRECCIÓN: Hacemos la llamada al backend con el ID del evento para buscar el ticket
        const response = await api.get(`/tickets/${decodedText}?eventId=${eventId}`);
        setScannedTicket(response.data);
        toast.success('Entrada encontrada.');
      } catch (error: any) {
        setRedeemResult({ type: 'error', data: error.response?.data || { message: 'Error desconocido.' } });
        toast.error(error.response?.data?.message || 'Error al buscar la entrada.');
      }
    };

    const html5QrcodeScanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    html5QrcodeScanner.render(onScanSuccess, undefined);

    return () => {
      // Limpiamos el scanner al desmontar el componente
      if (html5QrcodeScanner.getState() === 2 /* SCANNING */) {
        html5QrcodeScanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [scannedTicket, redeemResult, eventId]);

  const resetScanner = () => {
    setScannedTicket(null);
    setRedeemResult(null);
  };

  if (redeemResult) {
    return <ScanResult result={redeemResult} onScanNext={resetScanner} />;
  }
  if (scannedTicket) {
    return <RedeemInterface ticket={scannedTicket} onRedeemed={setRedeemResult} onCancel={resetScanner} />;
  }
  return <div id="qr-reader" className="w-full max-w-md mx-auto"></div>;
}