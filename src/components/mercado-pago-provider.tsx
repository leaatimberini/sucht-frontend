// frontend/src/components/mercado-pago-provider.tsx
'use client'; 

import { initMercadoPago } from "@mercadopago/sdk-react"; // <-- 1. Importamos 'initMercadoPago'
import { useEffect } from "react";

// Este componente ahora solo se encarga de ejecutar la inicialización una vez.
export function MercadoPagoProvider({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    // 2. Obtenemos la clave pública desde las variables de entorno.
    const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;

    if (publicKey) {
      // 3. Llamamos a la función de inicialización.
      initMercadoPago(publicKey, { locale: 'es-AR' });
    } else {
      console.error("La variable de entorno NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY no está definida.");
    }
    
  // El array vacío [] asegura que esto se ejecute solo una vez cuando el componente se monta.
  }, []); 

  // 4. Simplemente renderizamos los componentes hijos sin ningún envoltorio.
  return <>{children}</>;
}