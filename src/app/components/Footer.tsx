// src/app/components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react'; // Importamos los iconos de Lucide React

export default function Footer() {
  const currentYear = new Date().getFullYear(); // Para obtener el año actual dinámicamente

  return (
    <footer className="bg-gray-900 text-white py-10 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Columna de Información de Contacto */}
        <div className="mb-6 md:mb-0">
          <h3 className="text-xl font-bold mb-4 text-pink-300">Contacto</h3>
          <p className="text-gray-400 mb-2">
            Si tienes preguntas, no dudes en contactarnos.
          </p>
          <p className="text-gray-400 mb-2">
            Teléfono: <a href="tel:+542946402814" className="hover:text-pink-300 transition-colors duration-200">+54 9 2946-402814</a>
          </p>
          <p className="text-gray-400">
            Email: <a href="mailto:@belmargiuliana@gmail.com" className="hover:text-pink-300 transition-colors duration-200">belmargiuliana@gmail.com</a> {/* Puedes cambiar este email */}
          </p>
        </div>

        {/* Columna de Enlaces Rápidos (ejemplo) */}
        <div className="mb-6 md:mb-0">
          <h3 className="text-xl font-bold mb-4 text-pink-300">Enlaces Rápidos</h3>
          <ul className="space-y-2">
            <li><Link href="/about" className="text-gray-400 hover:text-pink-300 transition-colors duration-200">Sobre Nosotros</Link></li>
            <li><Link href="/products" className="text-gray-400 hover:text-pink-300 transition-colors duration-200">Productos</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-pink-300 transition-colors duration-200">Contacto</Link></li>
            <li><Link href="/privacy-policy" className="text-gray-400 hover:text-pink-300 transition-colors duration-200">Política de Privacidad</Link></li>
          </ul>
        </div>

        {/* Columna de Redes Sociales */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-pink-300">Síguenos</h3>
          <div className="flex justify-center md:justify-start space-x-6">
            <Link
              href="https://www.instagram.com/brava.0k/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-400 hover:text-pink-300 transition-colors duration-200"
            >
              <Instagram size={32} /> {/* Icono de Instagram */}
            </Link>
            <Link
              href="https://www.facebook.com/brava.125653/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-400 hover:text-pink-300 transition-colors duration-200"
            >
              <Facebook size={32} /> {/* Icono de Facebook */}
            </Link>
          </div>
        </div>
      </div>

      {/* Sección de Derechos de Autor y Marca Registrada */}
      <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-500 text-sm">
        <p>
          &copy; {currentYear} Brava. Todos los derechos reservados.
        </p>
        <p className="mt-2">
          Diseñado con pasión para realzar tu belleza.
        </p>
      </div>
    </footer>
  );
}
