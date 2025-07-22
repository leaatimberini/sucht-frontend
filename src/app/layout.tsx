import type { Metadata } from 'next';
import { Poppins } from 'next/font/google'; // Importamos la tipografía
import './globals.css';

// Configuramos la tipografía Poppins con los grosores que usaremos
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
      {/* Aplicamos la clase de la tipografía y los colores base al body */}
      <body
        className={`${poppins.className} bg-zinc-950 text-zinc-50 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}