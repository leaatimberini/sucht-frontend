'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { ScanResult } from './scan-result';

export function QrScanner() {
  const [scanResult, setScanResult] = useState<any | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    const onScanSuccess = (decodedText: string) => {
      if (scanner) {
        scanner.pause(true);
      }

      // --- CORRECCIÓN AQUÍ ---
      // Apuntamos a la nueva ruta '/redeem' y enviamos la cantidad a validar.
      api.post(`/tickets/${decodedText}/redeem`, { quantity: 1 })
        .then(response => {
          setScanResult({ type: 'success', data: response.data });
        })
        .catch(error => {
          setScanResult({ type: 'error', data: error.response.data });
        });
    };

    const onScanFailure = (error: any) => {
      // No hacemos nada en caso de fallo
    };

    if (!scanResult) {
      scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      }, false);
      scanner.render(onScanSuccess, onScanFailure);
    }
    
    return () => {
      if (scanner) {
        // Usamos un try-catch para evitar errores si el scanner ya fue limpiado
        try {
          if (scanner.getState() !== 1 /* NOT_STARTED */) {
            scanner.clear();
          }
        } catch (e) {
          console.error("Error al limpiar el escáner:", e);
        }
      }
    };
  }, [scanResult]);

  const handleScanNext = () => {
    setScanResult(null);
  };

  return (
    <div>
      {scanResult ? (
        <ScanResult result={scanResult} onScanNext={handleScanNext} />
      ) : (
        <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
      )}
    </div>
  );
}