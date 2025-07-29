'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export default function HomePage() {
  return (
    <>
      <style jsx global>{`
        body {
          font-family: ${poppins.style.fontFamily};
        }
      `}</style>

      {/* Sección Hero con Video de Fondo */}
      <section className="relative h-[calc(100vh-5rem)] flex items-center justify-center text-center overflow-hidden">
        {/* Video de Fondo */}
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          <video
            autoPlay
            loop
            muted
            className="min-w-full min-h-full object-cover"
          >
            <source
              src="https://res.cloudinary.com/di4ikaeke/video/upload/v1753741162/background_c6dman.webm"
              type="video/webm"
            />
          </video>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white uppercase tracking-wider leading-tight">
            SUCHT
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mt-4 max-w-2xl mx-auto">
            Música, amigos y noches inolvidables te esperan.
          </p>
          <div className="mt-8">
            <Link
              href="/eventos"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105"
            >
              Ver Próximos Eventos
            </Link>
          </div>
        </div>
      </section>

      {/* Otras secciones */}
      <section className="py-16 bg-zinc-900 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-6">¿Qué es SUCHT?</h2>
          <p className="text-zinc-400 max-w-3xl mx-auto">
            SUCHT es más que un boliche; es una comunidad, una experiencia, un
            lugar donde la noche cobra vida. Con la mejor música, un ambiente
            increíble y la gente más divertida de Castelar, te garantizamos una
            noche que no olvidarás. ¡Descubre nuestros próximos eventos y únete
            a la fiesta!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-800 text-zinc-400 py-6 mt-12">
        <div className="container mx-auto px-4 flex flex-col items-center space-y-4">
          <div className="flex space-x-8 text-2xl">
            <Link
              href="https://www.instagram.com/sucht.oficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram SUCHT"
              className="hover:text-pink-600 transition-colors"
            >
              <FaInstagram />
            </Link>
            <Link
              href="https://wa.me/5491152738137"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp SUCHT"
              className="hover:text-green-500 transition-colors"
            >
              <FaWhatsapp />
            </Link>
          </div>

          <p className="text-xs text-zinc-500 mt-4">
            sucht.com.ar - desarrollado por{' '}
            <Link
              href="https://www.instagram.com/leaa.emanuel"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-pink-600"
            >
              LET
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}
