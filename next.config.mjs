import withPWA from 'next-pwa';
/** @type {import('next').NextConfig} */

// 1. Importar el wrapper correcto: 'next-pwa'
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

// 2. Envolver la configuración con withPWA
const nextConfig = withPWA({
  reactStrictMode: true, // Es una buena práctica tenerlo
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sucht.com.ar',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
});

module.exports = nextConfig;
