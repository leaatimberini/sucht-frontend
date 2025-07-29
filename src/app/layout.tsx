import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/header';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins', // opcional si quieres usar CSS variables
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
    <html lang="es">
      <body
        className={`${poppins.className} bg-zinc-950 text-zinc-50 antialiased`}
      >
        <Toaster position="top-center" />
        <Header />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
