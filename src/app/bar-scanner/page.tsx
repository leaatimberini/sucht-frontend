// frontend/src/app/bar-scanner/page.tsx
'use client';

import { useState } from 'react';
import { AuthCheck } from "@/components/auth-check";
import { UserRole } from '@/types/user.types';
import { QrScanner } from '@/components/qr-scanner';
import { RedeemedRewardsHistory } from '@/components/redeemed-rewards-history'; // <-- 1. Importar

type BarScannerTab = 'scanner' | 'history';

export default function BarScannerPage() {
  const [activeTab, setActiveTab] = useState<BarScannerTab>('scanner');

  return (
    <AuthCheck allowedRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.BARRA]}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Panel de Barra</h1>
          <p className="mt-1 text-zinc-400">
            Escanea el QR de un premio o producto para validarlo.
          </p>
        </div>

        {/* --- 2. AÑADIMOS LAS PESTAÑAS DE NAVEGACIÓN --- */}
        <div className="border-b border-zinc-800 mb-8">
          <nav className="flex justify-center space-x-4">
            <button onClick={() => setActiveTab('scanner')} className={`py-2 px-4 ${activeTab === 'scanner' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Escanear</button>
            <button onClick={() => setActiveTab('history')} className={`py-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Historial</button>
          </nav>
        </div>

        {/* --- 3. RENDERIZADO CONDICIONAL DEL CONTENIDO --- */}
        {activeTab === 'scanner' && (
          <div className='max-w-md mx-auto'>
              <QrScanner scanType="reward" />
          </div>
        )}
        {activeTab === 'history' && <RedeemedRewardsHistory />}

      </div>
    </AuthCheck>
  );
}