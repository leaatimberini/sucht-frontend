// frontend/src/components/payment-form.tsx
'use client';

import { CardPayment } from '@mercadopago/sdk-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader } from 'lucide-react';

interface PaymentFormProps {
  preferenceId: string;
  amount: number;
}

export function PaymentForm({ preferenceId, amount }: PaymentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (paymentData: any) => {
    // =================================================================
    // ===== PRUEBA DE FUEGO: Ver qué nos devuelve Mercado Pago =====
    console.log('Datos recibidos de Mercado Pago onSubmit:', paymentData);
    // =================================================================

    setIsSubmitting(true);
    toast.loading('Procesando pago...');

    try {
      // Asumimos que el ID está en 'paymentData.id', el log nos lo confirmará
      const payload = {
        paymentId: String(paymentData.id),
      };

      await api.post('/payments/finalize-purchase', payload);

      toast.dismiss();
      toast.success('¡Pago realizado con éxito!');
      router.push('/payment/success');

    } catch (error: any) {
      toast.dismiss();
      const errorMessage = error.response?.data?.message || 'El pago fue rechazado o ocurrió un error.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-zinc-800 p-6 rounded-lg'>
      <h3 className="text-xl font-bold text-white mb-4">Completa tu pago</h3>
      <CardPayment
        initialization={{
          amount: amount,
        }}
        onSubmit={handleSubmit}
        onReady={() => console.log('Mercado Pago CardPayment Brick is ready.')}
        onError={(error) => console.error('Mercado Pago CardPayment Brick error:', error)}
        customization={{
          visual: { style: { theme: 'dark' } }
        }}
      />
      {isSubmitting && (
        <div className='flex items-center justify-center space-x-2 mt-4 text-zinc-300'>
          <Loader className="animate-spin" size={20} />
          <span>Finalizando compra... No recargues la página.</span>
        </div>
      )}
    </div>
  );
}