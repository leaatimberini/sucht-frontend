import { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

// 1. AÑADIR ESTA LÍNEA PARA RESOLVER EL ERROR DE BUILD
export const dynamic = 'force-dynamic';

// Metadata para el SEO y el título de la pestaña
export const metadata: Metadata = {
  title: 'Términos y Condiciones - SUCHT',
  description: 'Políticas de uso, compra de entradas, y derecho de admisión y permanencia de SUCHT.',
};

// Función para obtener el texto de los T&C desde el backend
async function getTermsAndConditionsText() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuration`, { 
      cache: 'no-store' 
    });

    if (!res.ok) {
      throw new Error('Failed to fetch configuration');
    }

    const config = await res.json();
    return config.termsAndConditionsText || 'Los Términos y Condiciones no están disponibles en este momento.';
  } catch (error) {
    console.error(error);
    return 'No se pudieron cargar los Términos y Condiciones. Por favor, intente más tarde.';
  }
}

export default async function TermsAndConditionsPage() {
  const termsText: string = await getTermsAndConditionsText();

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto h-12 w-12 text-pink-500 mb-4" />
          <h1 className="text-4xl font-bold text-white">Términos y Condiciones</h1>
          <p className="text-zinc-400 mt-2">Políticas de uso de la plataforma y acceso a eventos.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8">
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {termsText}
          </p>
        </div>
      </div>
    </div>
  );
}