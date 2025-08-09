'use client';

import { useState } from 'react';
import { AuthCheck } from "@/components/auth-check";
import { UserRole } from '@/types/user.types';
import { QrScanner } from '@/components/qr-scanner';
import { RedeemedRewardsHistory } from '@/components/redeemed-rewards-history';
import { RedeemedProductsHistory } from '@/components/redeemed-products-history'; // NUEVO: Importar

type BarScannerTab = 'scanner' | 'rewards-history' | 'products-history'; // NUEVO: Añadimos 'products-history'

export default function BarScannerPage() {
  const [activeTab, setActiveTab] = useState<BarScannerTab>('scanner');
  const [scannerMode, setScannerMode] = useState<'reward' | 'product'>('reward'); // NUEVO: Estado para el modo de escaneo

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
            <button onClick={() => setActiveTab('products-history')} className={`py-2 px-4 ${activeTab === 'products-history' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Historial de Productos</button> {/* NUEVO: Pestaña para historial de productos */}
          </nav>
        </div>
        
        {/* --- RENDERIZADO CONDICIONAL DEL CONTENIDO --- */}
        {activeTab === 'scanner' && (
          <div className='max-w-md mx-auto'>
            {/* NUEVO: Controles para cambiar el modo del escáner */}
            <div className="flex justify-center space-x-4 mb-4">
              <button 
                onClick={() => setScannerMode('reward')} 
                className={`py-2 px-4 rounded ${scannerMode === 'reward' ? 'bg-pink-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                Modo Premio
              </button>
              <button 
                onClick={() => setScannerMode('product')} 
                className={`py-2 px-4 rounded ${scannerMode === 'product' ? 'bg-pink-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                Modo Producto
              </button>
            </div>
            <QrScanner scanType={scannerMode} />
          </div>
        )}
        {activeTab === 'rewards-history' && <RedeemedRewardsHistory />}
        {activeTab === 'products-history' && <RedeemedProductsHistory />} {/* NUEVO: Componente para historial de productos */}

      </div>
    </AuthCheck>
  );
}