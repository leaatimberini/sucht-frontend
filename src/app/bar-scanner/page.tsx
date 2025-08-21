'use client';

import { useState } from 'react';
import { AuthCheck } from "@/components/auth-check";
import { UserRole } from '@/types/user.types';
import { UniversalQrScanner } from '@/components/UniversalQrScanner'; // 1. Importar el nuevo escáner
import { RedeemedRewardsHistory } from '@/components/redeemed-rewards-history';
import { RedeemedProductsHistory } from '@/components/redeemed-products-history';

type BarScannerTab = 'scanner' | 'rewards-history' | 'products-history';

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

        <div className="border-b border-zinc-800 mb-8">
          <nav className="flex justify-center space-x-4">
            <button onClick={() => setActiveTab('scanner')} className={`py-2 px-4 ${activeTab === 'scanner' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Escanear</button>
            <button onClick={() => setActiveTab('rewards-history')} className={`py-2 px-4 ${activeTab === 'rewards-history' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Historial de Premios</button>
            <button onClick={() => setActiveTab('products-history')} className={`py-2 px-4 ${activeTab === 'products-history' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Historial de Productos</button>
          </nav>
        </div>
        
        {activeTab === 'scanner' && (
          <div className='max-w-md mx-auto'>
            {/* 2. Reemplazar el antiguo QrScanner por el nuevo UniversalQrScanner */}
            <UniversalQrScanner />
          </div>
        )}
        {activeTab === 'rewards-history' && <RedeemedRewardsHistory />}
        {activeTab === 'products-history' && <RedeemedProductsHistory />}

      </div>
    </AuthCheck>
  );
}