'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext'; // Asegúrate de que la ruta sea correcta
import { useState } from 'react'; // Importar useState

interface ProductCardProps {
    id: number;
    nombre: string;
    precio: number;
    imagen_url: string;
    marca: string;
    stock: number; // Añadido: Propiedad de stock
    colors?: { name: string; hex: string; }[]; // Propiedad opcional para colores
}

export default function ProductCard({ id, nombre, precio, imagen_url, marca, stock, colors }: ProductCardProps) {
    const { addToCart } = useCart();

    // Estado para el color HEX seleccionado en esta tarjeta de producto
    // Se inicializa con el HEX del primer color si hay colores, de lo contrario, null
    const [selectedColorHex, setSelectedColorHex] = useState<string | null>(
        colors && colors.length > 0 ? colors[0].hex : null
    );

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Previene la navegación al hacer clic en el botón
        e.stopPropagation(); // Evita que el clic se propague al Link padre

        if (stock === 0) {
            console.warn('Producto sin stock.');
            // Aquí podrías añadir una notificación al usuario (ej. con un modal personalizado)
            return;
        }

        // Encuentra el objeto de color completo basado en el hex seleccionado
        const colorToAdd = colors?.find(c => c.hex === selectedColorHex);
        // Obtiene el nombre del color seleccionado para pasarlo al carrito
        const colorName = colorToAdd ? colorToAdd.name : undefined;

        addToCart({
            id,
            nombre,
            precio,
            imagen_url,
            stock,
            colors: colors // Pasamos el array completo de colores para la información del producto
        }, 1, colorName); // Pasamos el nombre del color seleccionado

        // Opcional: Mostrar una confirmación al usuario (usar un modal personalizado en lugar de alert)
        // console.log(`Producto ${nombre} ${colorName ? `(${colorName})` : ''} añadido al carrito.`);
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
            <Link href={`/products/${id}`} className="block relative h-48 w-full overflow-hidden">
                <Image
                    src={imagen_url || '/placeholder-product.png'}
                    alt={nombre}
                    fill={true}
                    style={{ objectFit: 'contain' }} // Cambiado a 'contain' para que la imagen se vea completa
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x300/E0E0E0/ADADAD?text=Imagen+no+disponible'; // Fallback image
                        e.currentTarget.srcset = ''; // Clear srcset to prevent browser from trying to load original
                    }}
                />
            </Link>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate" title={nombre}>
                    {nombre}
                </h3>
                <p className="text-gray-600 text-sm mb-1">Marca: {marca || 'N/A'}</p>

                {/* Sección de selección de colores/tonos */}
                {colors && colors.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Colores/Tonos:</p>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((color) => (
                                <div
                                    key={color.hex}
                                    className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all duration-200
                                                ${selectedColorHex === color.hex ? 'border-[#9b0018] scale-110' : 'border-gray-300'}
                                                ${stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                    style={{ backgroundColor: color.hex }}
                                    onClick={() => stock > 0 && setSelectedColorHex(color.hex)} // Solo permite seleccionar si hay stock
                                    title={color.name}
                                ></div>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-2xl font-bold text-purple-700 mb-3">${precio.toFixed(2)}</p>

                {/* Indicador de Stock */}
                {stock === 0 && ( // Solo muestra "SIN STOCK" si el stock es 0
                    <p className="text-red-600 font-bold text-lg mb-4">SIN STOCK</p>
                )}

                <button
                    onClick={handleAddToCart}
                    className={`mt-auto w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-white font-semibold transition-colors duration-300 ${
                        stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                    disabled={stock === 0} // Deshabilita el botón si no hay stock
                >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>{stock === 0 ? 'Agotado' : 'Añadir al Carrito'}</span>
                </button>
            </div>
        </div>
    );
}
