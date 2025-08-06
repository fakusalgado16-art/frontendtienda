/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Deshabilita la optimización de imágenes en tiempo de ejecución para builds estáticas
    unoptimized: true,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/diyhkjien/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Configuración de variables de entorno accesibles en el cliente
  env: {
    // ¡CAMBIO CRUCIAL AQUÍ! Apunta a tu backend local
    NEXT_PUBLIC_API_URL: 'http://localhost:5000',
  },
};

module.exports = nextConfig;
