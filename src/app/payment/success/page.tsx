// payment/success/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader, XCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Obtenemos los parámetros de la URL
    const status = searchParams.get('status');

    if (status === 'approved') {
      // No hacemos ninguna llamada al backend desde aquí por seguridad.
      // La confirmación del ticket la gestiona el webhook de Mercado Pago.
      // Simplemente mostramos un mensaje de éxito.
      setIsProcessing(false);
      toast.success("¡Pago aprobado! El ticket se está generando.");
    } else {
      // Aunque estemos en la página de éxito, si el status no es 'approved',
      // redirigimos a la página de fallo.
      router.push('/payment/failure');
    }
  }, [searchParams, router]);

  if (isProcessing) {
    return (
      <div className="text-center">
        <Loader className="h-12 w-12 text-pink-500 animate-spin mx-auto" />
        <p className="mt-4 text-zinc-300">Tu pago ha sido aprobado. Procesando la compra, por favor espera...</p>
        <p className="text-xs text-zinc-500 mt-2">No cierres esta ventana.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white">¡Compra Exitosa!</h2>
      <p className="mt-2 text-zinc-400">Tu ticket se está generando. Puedes verlo en tu panel de control.</p>
      <Link href="/mi-cuenta" className="mt-6 inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg">
        Ver mis entradas
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 min-h-[300px] flex items-center">
        <Suspense fallback={<p>Cargando...</p>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}