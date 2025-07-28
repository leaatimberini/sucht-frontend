/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**', // Permite cualquier ruta local
      },
      {
        protocol: 'https',
        hostname: 'sucht.com.ar',
        port: '',
        pathname: '/**', // Permite cualquier ruta de tu dominio
      },
      // --- AÑADIMOS LA CONFIGURACIÓN PARA CLOUDINARY ---
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Permite cualquier imagen de tu cuenta de Cloudinary
      },
    ],
  },
};

export default nextConfig;
