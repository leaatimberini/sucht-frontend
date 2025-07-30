'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { CheckCircle, Loader, XCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast'; // <-- IMPORTACIÓN AÑADIDA

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finalizePurchase = async () => {
      // Obtenemos los datos que nos envía Mercado Pago en la URL
      const paymentId = searchParams.get('payment_id');
      const status = searchParams.get('status');
      const externalReference = searchParams.get('external_reference');

      if (paymentId && status === 'approved' && externalReference) {
        try {
          // Enviamos los datos al backend para que cree el ticket
          await api.post('/payments/finalize-purchase', {
            externalReference,
          });
          // Si todo sale bien, redirigimos al usuario a su cuenta para ver la entrada
          toast.success("¡Compra exitosa! Redirigiendo a tus entradas...");
          router.push('/mi-cuenta');
        } catch (err) {
          setError('Hubo un error al registrar tu entrada. Por favor, contacta a soporte.');
          setIsLoading(false);
        }
      } else {
        setError('Información de pago inválida o rechazada.');
        setIsLoading(false);
      }
    };

    finalizePurchase();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="text-center">
        <Loader className="h-12 w-12 text-pink-500 animate-spin mx-auto" />
        <p className="mt-4 text-zinc-300">Procesando tu compra, por favor espera...</p>
        <p className="text-xs text-zinc-500 mt-2">No cierres esta ventana.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-500">Error en la Compra</h2>
        <p className="mt-2 text-zinc-400">{error}</p>
         <Link href="/eventos" className="mt-6 inline-block bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg">
            Volver a Eventos
        </Link>
      </div>
    );
  }

  return null; // El usuario será redirigido si todo es exitoso
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
