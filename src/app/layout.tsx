import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/header'; // <-- 1. IMPORTAR

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'SUCHT',
  description: 'La experiencia nocturna definitiva.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${poppins.className} bg-zinc-950 text-zinc-50 antialiased`}
      >
        <Toaster position="top-center" />
        <Header /> {/* <-- 2. AÑADIR EL HEADER */}
        <main className="pt-20"> {/* <-- 3. AÑADIR PADDING SUPERIOR PARA NO QUEDAR DETRÁS DEL HEADER */}
          {children}
        </main>
      </body>
    </html>
  );
}