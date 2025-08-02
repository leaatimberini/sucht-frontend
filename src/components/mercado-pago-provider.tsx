// frontend/src/components/mercado-pago-provider.tsx
'use client';

import { initMercadoPago } from '@mercadopago/sdk-react';
import { ReactNode, useEffect } from 'react';

export function MercadoPagoProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (mpPublicKey) {
      initMercadoPago(mpPublicKey);
    } else {
      console.error("Mercado Pago public key is not configured.");
    }
  }, []);

  return <>{children}</>;
}