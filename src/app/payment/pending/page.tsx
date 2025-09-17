// payment/pending/page.tsx
'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function PaymentPendingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <Clock className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-3xl font-bold text-white mb-2">Tu pago está pendiente</h1>
      <p className="text-lg text-zinc-400 max-w-md mb-8">
        Estamos esperando la confirmación de tu pago. Recibirás una notificación y tu entrada por correo electrónico una vez que se acredite.
      </p>
      <Link 
        href="/eventos" 
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        Volver a los eventos
      </Link>
    </div>
  );
}