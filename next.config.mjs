/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      // --- LÍNEA AÑADIDA ---
      // Permite que Next.js cargue imágenes desde tu dominio de producción
      {
        protocol: 'https',
        hostname: 'sucht.com.ar',
        pathname: '/uploads/**',
      },
      // --------------------
    ],
  },
};

export default nextConfig;