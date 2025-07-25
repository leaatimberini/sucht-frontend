import { QrScanner } from "@/components/qr-scanner";

export default function VerifierPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Verificar Acceso</h1>
        <p className="mt-1 text-zinc-400">
          Apunta la cámara al código QR de la entrada.
        </p>
      </div>
      <QrScanner />
    </div>
  );
}