'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { ScanResult } from './scan-result';

export function QrScanner() {
  const [scanResult, setScanResult] = useState<any | null>(null);

  useEffect(() => {
    // Esta variable se asegura de que solo inicialicemos el escáner una vez
    let scanner: Html5QrcodeScanner | null = null;
    
    const onScanSuccess = (decodedText: string) => {
      if (scanner) {
        scanner.pause(true); // Pausamos el escáner para procesar el resultado
      }

      // Hacemos la llamada al backend para verificar el ticket
      api.post(`/tickets/${decodedText}/verify`)
        .then(response => {
          setScanResult({ type: 'success', data: response.data });
        })
        .catch(error => {
          setScanResult({ type: 'error', data: error.response.data });
        });
    };

    const onScanFailure = (error: any) => {
      // No hacemos nada en caso de fallo (ej. no se encontró QR)
    };

    // Solo inicializa el escáner si no hay un resultado
    if (!scanResult) {
      scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      }, false);
      scanner.render(onScanSuccess, onScanFailure);
    }
    
    // Limpieza al desmontar el componente
    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [scanResult]); // Volvemos a ejecutar el efecto cuando el resultado cambia (para reiniciar)

  const handleScanNext = () => {
    setScanResult(null); // Limpia el resultado para que el escáner se reinicie
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