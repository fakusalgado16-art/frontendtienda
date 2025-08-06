'use client'; // Necesario porque usa useState y useEffect

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Define la interfaz para la estructura de un objeto de categoría
interface Category {
    id: number;
    nombre: string;
    imagen_url?: string; // '?' indica que la propiedad es opcional
}

// Define la URL base de tu API de backend desde las variables de entorno
// Asegúrate de que NEXT_PUBLIC_API_URL esté configurado correctamente en tu .env.local
// Ejemplo: NEXT_PUBLIC_API_URL=https://brava-6sbk.onrender.com
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Función asíncrona para obtener las categorías del backend
    const fetchCategories = async () => {
        setLoading(true);
        setError(null); // Limpiar cualquier error previo al intentar de nuevo
        try {
            // Verificar si la URL de la API está definida
            if (!API_BASE_URL) {
                throw new Error("La URL de la API no está definida. Configura NEXT_PUBLIC_API_URL en tu .env.local");
            }

            // Realiza la solicitud a tu API de categorías usando la variable de entorno
            const response = await fetch(`${API_BASE_URL}/api/categories`);

            if (!response.ok) {
                // Si la respuesta no es OK, lee el texto del error si está disponible
                const errorDetail = await response.text();
                throw new Error(`Error HTTP: ${response.status} - ${errorDetail || 'Error desconocido'}`);
            }

            const data: Category[] = await response.json();

            // Simplemente establece las categorías obtenidas de la API
            setCategories(data);
        } catch (err: any) {
            console.error('Error al cargar categorías:', err);
            setError(`No se pudieron cargar las categorías: ${err.message}. Asegúrate de que el backend esté funcionando y la URL de la API sea correcta.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-8">
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-xl">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center border-b-2 border-pink-300 pb-4">
                    Explora Nuestras Categorías
                </h1>

                {loading ? (
                    <p className="text-center text-gray-600 text-lg">Cargando categorías...</p>
                ) : error ? (
                    <div className="text-center text-red-600 text-lg font-semibold p-4 bg-red-100 border border-red-400 rounded-md">
                        <p>{error}</p>
                        <button
                            onClick={fetchCategories} // Permite reintentar la carga
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : categories.length === 0 ? (
                    <p className="text-center text-gray-700 text-lg">No hay categorías disponibles en este momento. Vuelve pronto.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category) => (
                            <Link
                                // ¡MODIFICACIÓN CLAVE AQUÍ!
                                // Ahora apunta a la nueva ruta dinámica /category/[categoryId]
                                href={`/category/${category.id}`}
                                key={category.id}
                                className="block group"
                            >
                                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden transform hover:scale-105">
                                    <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
                                        {category.imagen_url ? (
                                            <Image
                                                src={category.imagen_url}
                                                alt={category.nombre}
                                                layout="fill"
                                                objectFit="cover"
                                                className="transition-transform duration-300 group-hover:scale-110"
                                                unoptimized // Considera si realmente necesitas esto para todas las imágenes
                                                onError={(e) => {
                                                    // Fallback para imágenes que no cargan
                                                    e.currentTarget.src = 'https://placehold.co/600x400/E0E0E0/000000?text=Sin+Imagen';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-500 text-sm">
                                                Imagen no disponible
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 text-center">
                                        <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                                            {category.nombre}
                                        </h2>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-10 text-center">
                <Link href="/" className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition duration-300 ease-in-out shadow-lg hover:shadow-xl">
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
}
