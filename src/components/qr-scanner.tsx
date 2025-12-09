// src/components/qr-scanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '@/lib/axios';
import { Ticket } from '@/types/ticket.types';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { ProductPurchase } from '@/types/product-purchase.types';
import { isUuid } from '@/lib/utils';

// --- DEFINICIÓN DE TIPOS ACTUALIZADA ---
type ScanType = 'ticket' | 'reward' | 'product';

interface ScanResultData {
  message: string;
  userName?: string;
  ticketType?: string;
  rewardName?: string;
  productName?: string;
  validatedAt?: string;
}

interface ResultState {
  type: 'success' | 'error';
  data: ScanResultData;
}

// --- SUB-COMPONENTE PARA MOSTRAR EL RESULTADO FINAL ---
function ScanResult({ result, onScanNext }: { result: ResultState, onScanNext: () => void }) {
  const isSuccess = result.type === 'success';

  return (
    <div className={`w-full max-w-md mx-auto text-center border rounded-lg p-6 ${isSuccess ? 'border-green-500/50' : 'border-red-500/50'}`}>
      {isSuccess ? (
        <>
          <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-bold text-white mt-4">{result.data.message || 'Acción Exitosa'}</h2>
          {result.data.userName && <p className="text-zinc-300 mt-2 text-lg font-semibold">{result.data.userName}</p>}
          {result.data.ticketType && <p className="text-zinc-400 text-sm">{result.data.ticketType}</p>}
          {result.data.rewardName && <p className="text-pink-400 font-semibold">{result.data.rewardName}</p>}
          {result.data.productName && <p className="text-pink-400 font-semibold">{result.data.productName}</p>}
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold text-red-500 mt-4">Acción Denegada</h2>
          <p className="text-zinc-400 mt-2">{result.data.message}</p>
        </>
      )}
      <button onClick={onScanNext} className="w-full mt-6 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg">
        Escanear Siguiente
      </button>
    </div>
  );
}

// --- Interfaz para canjear productos ---
function RedeemProductInterface({ productPurchase, onRedeemed, onCancel }: { productPurchase: ProductPurchase, onRedeemed: (result: ResultState) => void, onCancel: () => void }) {
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async () => {
    setIsRedeeming(true);
    try {
      const response = await api.post(`/store/purchase/validate/${productPurchase.id}`);
      onRedeemed({
        type: 'success', data: {
          message: 'Producto canjeado con éxito.',
          userName: response.data.user.name,
          productName: response.data.product.name
        }
      });
    } catch (error: any) {
      onRedeemed({ type: 'error', data: error.response?.data || { message: 'Error desconocido.' } });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center border border-zinc-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white">Producto Válido</h2>
      <p className="text-zinc-300 mt-2">{productPurchase.user.name}</p>
      <p className="text-pink-400 font-semibold">{productPurchase.product.name}</p>
      <div className="mt-6 space-y-3">
        <button onClick={handleRedeem} disabled={isRedeeming} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
          {isRedeeming ? 'Validando...' : `Canjear Producto`}
        </button>
        <button onClick={onCancel} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 rounded-lg">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function RedeemInterface({ ticket, onRedeemed, onCancel }: { ticket: Ticket, onRedeemed: (result: ResultState) => void, onCancel: () => void }) {
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

// --- COMPONENTE PRINCIPAL DEL ESCÁNER REFACTORIZADO ---
export function QrScanner({ scanType, eventId }: { scanType: ScanType, eventId?: string }) {
  const [scannedData, setScannedData] = useState<any | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (result || scannedData) return;

    const onScanSuccess = async (decodedText: string) => {
      if (isPaused) return;

      setIsPaused(true);

      try {
        toast.loading('Verificando QR...');
        let response;
        let qrData: any = { type: scanType, id: decodedText };

        try {
          qrData = JSON.parse(decodedText);
        } catch (e) {
          // Si falla, el QR es una cadena simple (un UUID)
        }

        let type = qrData.type;
        let id = qrData.id;

        if (!isUuid(id)) {
          throw new Error('Formato de QR inválido o corrupto.');
        }

        switch (type) {
          case 'ticket':
            if (!eventId) { throw new Error("Se requiere un eventId para escanear tickets."); }
            response = await api.get(`/tickets/${id}`);
            setScannedData(response.data);
            break;
          case 'reward':
            response = await api.post(`/rewards/validate/${id}`);
            setResult({ type: 'success', data: response.data });
            break;
          case 'product':
            response = await api.post(`/store/purchase/validate/${id}`);
            setScannedData(response.data);
            break;
          case 'BIRTHDAY_ENTRY':
            response = await api.post(`/birthday/validate-entry/${id}`);
            setScannedData(response.data);
            break;
          case 'BIRTHDAY_GIFT':
            response = await api.post(`/birthday/validate-gift/${id}`);
            setResult({ type: 'success', data: response.data });
            break;
          default:
            throw new Error('Tipo de QR no reconocido.');
        }

        toast.dismiss();
        toast.success('QR verificado con éxito.');

      } catch (error: any) {
        toast.dismiss();
        setResult({ type: 'error', data: error.response?.data || { message: 'Error desconocido.' } });
        toast.error(error.response?.data?.message || 'Error al verificar el QR.');
      } finally {
        setIsPaused(false);
      }
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      'qr-reader-container',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        videoConstraints: {
          facingMode: "environment"
        }
      },
      false
    );
    html5QrcodeScanner.render(onScanSuccess, undefined);

    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Fallo al limpiar el scanner de QR.", error);
      });
    };
  }, [result, isPaused, scanType, eventId, scannedData]);

  const resetScanner = () => {
    setScannedData(null);
    setResult(null);
    setIsPaused(false);
  };

  const handleFinalRedeem = (redeemResult: ResultState) => {
    setScannedData(null);
    setResult(redeemResult);
  }

  if (result) {
    return <ScanResult result={result} onScanNext={resetScanner} />;
  }
  if (scannedData) {
    if (scannedData.type === 'BIRTHDAY_ENTRY' || scanType === 'ticket') {
      return <RedeemInterface ticket={scannedData} onRedeemed={handleFinalRedeem} onCancel={resetScanner} />;
    }
    if (scanType === 'product') {
      return <RedeemProductInterface productPurchase={scannedData} onRedeemed={handleFinalRedeem} onCancel={resetScanner} />;
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div id="qr-reader-container" />
      <div className="p-4 text-center border-t border-zinc-800">
        <p className="text-zinc-400 text-sm">Apunta la cámara al código QR</p>
      </div>
    </div>
  );
}