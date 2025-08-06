// src/app/components/CategoryCard.tsx
import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  id: number;
  nombre: string;
  imagen_url?: string; // Opcional, ya que puede que no todas tengan
}

export default function CategoryCard({ id, nombre, imagen_url }: CategoryCardProps) {
  // Usamos una imagen de placeholder si no se proporciona una URL o es nula/vacía
  const imageUrl = imagen_url || 'https://via.placeholder.com/300x200?text=Categoria+sin+imagen';

  return (
    <Link href={`/products?category=${id}`} className="block">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
        <div className="relative w-full h-48"> {/* Altura fija para las imágenes */}
          <Image
            src={imageUrl}
            alt={nombre}
            layout="fill" // Esto hace que la imagen ocupe todo el espacio del div padre
            objectFit="cover" // Esto recorta la imagen para que cubra el área sin distorsionarse
            className="rounded-t-lg"
            unoptimized // Usar si la imagen viene de un dominio no configurado en next.config.js o es un placeholder
          />
        </div>
        <div className="p-4 text-center">
          <h3 className="text-xl font-semibold text-gray-800">{nombre}</h3>
          {/* Puedes añadir más detalles aquí si la categoría los tuviera, como una descripción */}
        </div>
      </div>
    </Link>
  );
}