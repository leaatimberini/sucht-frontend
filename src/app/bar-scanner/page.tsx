// frontend/src/app/bar-scanner/page.tsx
'use client';

import { useState } from 'react';
import { AuthCheck } from "@/components/auth-check";
import { UserRole } from '@/types/user.types';
import { QrScanner } from '@/components/qr-scanner'; // Reutilizamos el componente de escáner

export default function BarScannerPage() {

  return (
    <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.BARRA]}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Panel de Barra</h1>
          <p className="mt-1 text-zinc-400">
            Escanea el QR de un premio o producto para validarlo.
          </p>
        </div>

        {/* Reutilizamos el componente QrScanner, pero le pasamos un `scanType` diferente.
          Esto nos permitirá modificar el QrScanner para que apunte a diferentes endpoints 
          dependiendo del tipo de escaneo que se esté realizando.
        */}
        <div className='max-w-md mx-auto'>
            <QrScanner scanType="reward" />
        </div>

      </div>
    </AuthCheck>
  );
}