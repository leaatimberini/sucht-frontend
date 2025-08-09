import type { Metadata } from 'next';
import localFont from 'next/font/local'; // Changed to localFont
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/header';
import { TrackingScripts } from '@/components/tracking-scripts';
import { MercadoPagoProvider } from '@/components/mercado-pago-provider';
import { AppInitializer } from "@/components/app-initializer";

// Configuración de la fuente local Poppins
const poppins = localFont({
  src: [
    {
      path: './fonts/poppins/Poppins-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/poppins/Poppins-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'SUCHT',
  description: 'El clásico de Castelar, desde 2010.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={poppins.variable}>
      <body
        className={`${poppins.className} bg-zinc-950 text-zinc-50 antialiased`}
      >
        <AppInitializer />
        <MercadoPagoProvider>
          <Toaster position="top-center" />
          <Header />
          <main className="pt-20">{children}</main>
        </MercadoPagoProvider>
        
        <TrackingScripts />
      </body>
    </html>
  );
}