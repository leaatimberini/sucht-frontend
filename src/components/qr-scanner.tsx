'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { ScanResult } from './scan-result';
import { Ticket } from '@/types/ticket.types';
import toast from 'react-hot-toast';

// Creamos un nuevo componente para la interfaz de canje
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
      const response = await api.post(`/tickets/${ticket.id}/redeem`, { quantity });
      onRedeemed({ type: 'success', data: response.data });
    } catch (error: any) {
      onRedeemed({ type: 'error', data: error.response.data });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center border border-zinc-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white">Entrada Válida</h2>
      <p className="text-zinc-300 mt-2">{ticket.user.name}</p>
      <p className="text-zinc-400 text-sm">{ticket.tier.name}</p>
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

export function QrScanner() {
  const [scannedTicket, setScannedTicket] = useState<Ticket | null>(null);
  const [redeemResult, setRedeemResult] = useState<any | null>(null);

  useEffect(() => {
    if (scannedTicket || redeemResult) return;

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
      html5QrcodeScanner.pause(true);
      toast.promise(
        api.get(`/tickets/${decodedText}`),
        {
          loading: 'Verificando entrada...',
          success: (response) => {
            setScannedTicket(response.data);
            return 'Entrada encontrada.';
          },
          error: (error) => {
            setRedeemResult({ type: 'error', data: error.response.data });
            return error.response?.data?.message || 'Error al buscar la entrada.';
          }
        }
      );
    };

    const html5QrcodeScanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    html5QrcodeScanner.render(onScanSuccess, undefined);

    return () => {
      if (html5QrcodeScanner.getState() === 2 /* SCANNING */) {
        html5QrcodeScanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [scannedTicket, redeemResult]);

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