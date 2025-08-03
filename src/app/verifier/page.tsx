// frontend/src/app/verifier/page.tsx
'use client';

import { useState } from 'react';
import { QrScanner } from "@/components/qr-scanner";
import { ScanHistory } from '@/components/scan-history';
import { PremiumProductsList } from '@/components/premium-products-list';
import { EventSelectorForVerifier } from '@/components/event-selector-verifier';

type VerifierTab = 'scanner' | 'history' | 'premium';

export default function VerifierPage() {
  const [activeTab, setActiveTab] = useState<VerifierTab>('scanner');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Panel de Verificador</h1>
        <p className="mt-1 text-zinc-400">
          Selecciona un evento para empezar a escanear o ver los registros.
        </p>
      </div>

      {/* Selector de Evento */}
      <EventSelectorForVerifier onEventSelect={setSelectedEventId} />

      {selectedEventId && (
        <>
          {/* Pestañas de Navegación */}
          <div className="border-b border-zinc-800 mt-8">
            <nav className="flex justify-center space-x-4">
              <button onClick={() => setActiveTab('scanner')} className={`py-2 px-4 ${activeTab === 'scanner' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Escanear</button>
              <button onClick={() => setActiveTab('history')} className={`py-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Historial</button>
              <button onClick={() => setActiveTab('premium')} className={`py-2 px-4 ${activeTab === 'premium' ? 'border-b-2 border-pink-500 text-white' : 'text-zinc-400'}`}>Mesas y Vouchers</button>
            </nav>
          </div>

          {/* Contenido de las Pestañas */}
          <div className="mt-6">
            {/* CORRECCIÓN: Pasamos el 'selectedEventId' al QrScanner */}
            {activeTab === 'scanner' && <QrScanner eventId={selectedEventId} />}
            {activeTab === 'history' && <ScanHistory eventId={selectedEventId} />}
            {activeTab === 'premium' && <PremiumProductsList eventId={selectedEventId} />}
          </div>
        </>
      )}
    </div>
  );
}