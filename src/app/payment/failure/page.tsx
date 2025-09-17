// payment/failure/page.tsx
'use client';

import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailurePage() {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white">Pago Rechazado</h1>
        <p className="mt-4 text-zinc-300">
          Hubo un problema al procesar tu pago. Por favor, verifica tus datos e inténtalo de nuevo.
        </p>
        <div className="mt-8">
          <Link href="/eventos" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg">
            Volver a Eventos
          </Link>
        </div>
      </div>
    </div>
  );
}
