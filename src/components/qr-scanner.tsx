'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { ScanResult } from './scan-result';

export function QrScanner() {
  const [scanResult, setScanResult] = useState<any | null>(null);

  useEffect(() => {
    // Solo inicializa el escáner si no hay un resultado previo
    if (scanResult) return;

    // El objeto escáner se manejará dentro del efecto
    const qrScanner = new Html5QrcodeScanner(
      'qr-reader', 
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      }, 
      false
    );

    const onScanSuccess = (decodedText: string) => {
      // Pausamos inmediatamente para evitar múltiples escaneos
      qrScanner.pause(true);

      // Hacemos la llamada al backend para verificar el ticket
      // --- LÍNEA CORREGIDA ---
      // Se añade el prefijo /api a la ruta
      api.post(`/api/tickets/${decodedText}/verify`)
      // -----------------------
        .then(response => {
          setScanResult({ type: 'success', data: response.data });
        })
        .catch(error => {
          setScanResult({ type: 'error', data: error.response?.data || { message: 'Error de red' } });
        });
    };

    const onScanFailure = (error: any) => {
      // Ignoramos errores comunes como "QR code not found"
    };

    qrScanner.render(onScanSuccess, onScanFailure);

    // Función de limpieza para desmontar el componente de forma segura
    return () => {
      // Verificamos el estado del escáner antes de intentar limpiarlo
      if (qrScanner && qrScanner.getState()) {
        qrScanner.clear().catch(error => 
          console.error("Error al limpiar el escáner.", error)
        );
      }
    };
  }, [scanResult]);

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