/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'sucht.com.ar',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
