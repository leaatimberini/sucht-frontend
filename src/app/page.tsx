import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    // Hemos quitado el <main> de aquí porque ahora está en el layout.tsx
    <>
      {/* Sección Hero */}
      <section className="relative h-[calc(100vh-5rem)] flex items-center justify-center text-center overflow-hidden">
        {/* Fondo de video o imagen */}
        <div className="absolute inset-0 z-[-1]">
          {/* Reemplaza 'flyer-ejemplo.jpg' con una imagen de fondo atractiva de tu boliche */}
          <Image
            src="/flyer-ejemplo.jpg" 
            alt="Ambiente de SUCHT"
            layout="fill"
            objectFit="cover"
            className="opacity-20"
          />
        </div>
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white uppercase tracking-wider">
            Vive la Noche
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mt-4 max-w-2xl mx-auto">
            La experiencia definitiva de Castelar. Música, amigos y momentos inolvidables te esperan.
          </p>
          <div className="mt-8">
            <Link href="/eventos" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105">
              Ver Próximos Eventos
            </Link>
          </div>
        </div>
      </section>

      {/* Otras secciones que podrías añadir en el futuro */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">¿Qué Sigue?</h2>
          <p className="text-zinc-400 mt-2">Aquí podrías mostrar una galería de fotos, información de contacto, etc.</p>
        </div>
      </section>
    </>
  );
}