// frontend/src/app/rrpp/settings/page.tsx
import { Suspense } from 'react';
import { RRPPSettingsForm } from '@/components/rrpp-settings-form';
import { Loader2 } from 'lucide-react';

export default function RRPPSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Configuración de RRPP</h1>
        <p className="text-zinc-400 mb-8">Gestiona tu perfil y vincula tus cuentas para recibir comisiones.</p>

        {/* CORRECCIÓN: Envolvemos el componente de cliente en un Suspense */}
        <Suspense fallback={
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        }>
          <RRPPSettingsForm />
        </Suspense>
      </div>
    </div>
  );
}