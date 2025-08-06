// src/app/category/[categoryId]/page.tsx
'use client'; // ESTA LÍNEA ES CRUCIAL: Marca este componente como un Client Component

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hook para acceder a los parámetros de la URL
import ProductCard from '@/app/components/ProductCard'; // Asegúrate de que la ruta a ProductCard sea correcta

// Interfaz para la estructura de un producto
interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    id_categoria: number;
    marca: string;
    imagen_url: string;
    activo: boolean;
    fecha_creacion: string;
    ultima_actualizacion: string;
    colors?: { name: string; hex: string; }[]; // Asegúrate de incluir esto si ProductCard lo espera
}

// Interfaz para la estructura de una categoría (solo para obtener el nombre)
interface Category {
    id: number;
    nombre: string;
}

// Define la URL base de tu API de backend
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CategoryProductsPage() {
    const params = useParams();
    // Obtiene el categoryId de la URL. useParams devuelve un objeto con los parámetros dinámicos.
    const categoryId = params.categoryId as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [categoryName, setCategoryName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Solo intenta cargar datos si categoryId está disponible
        if (!categoryId) {
            setLoading(false);
            setError('ID de categoría no proporcionado en la URL.');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null); // Limpia errores anteriores
            try {
                // 1. Obtener todos los productos
                // MODIFICACIÓN: Eliminado { cache: 'no-store' }
                const productsResponse = await fetch(`${apiUrl}/api/products`);
                if (!productsResponse.ok) {
                    const errorText = await productsResponse.text();
                    throw new Error(`Error HTTP cargando productos: ${productsResponse.status} - ${errorText}`);
                }
                const allProducts: Product[] = await productsResponse.json();

                // Filtrar productos por la categoría actual y que estén activos
                const filteredProducts = allProducts.filter(
                    (product) => product.activo === true && product.id_categoria === parseInt(categoryId)
                );
                setProducts(filteredProducts);

                // 2. Obtener el nombre de la categoría específica
                // MODIFICACIÓN: Eliminado { cache: 'no-store' }
                const categoryResponse = await fetch(`${apiUrl}/api/categories/${categoryId}`);
                if (!categoryResponse.ok) {
                    const errorText = await categoryResponse.text();
                    throw new Error(`Error HTTP cargando categoría: ${categoryResponse.status} - ${errorText}`);
                }
                const categoryData: Category = await categoryResponse.json();
                setCategoryName(categoryData.nombre);

            } catch (err: unknown) {
                // Manejo de errores más robusto
                console.error(`Error al cargar datos para la categoría ${categoryId}:`, err);
                if (err instanceof Error) {
                    setError(`No se pudieron cargar los productos o la categoría. Error: ${err.message}. Asegúrate de que el backend esté funcionando.`);
                } else {
                    setError(`No se pudieron cargar los productos o la categoría. Error desconocido.`);
                }
            } finally {
                setLoading(false); // Siempre desactiva el estado de carga al finalizar
            }
        };

        fetchData(); // Llama a la función para cargar los datos cuando el componente se monta o categoryId cambia
    }, [categoryId]); // Dependencia del useEffect: se ejecuta cuando categoryId cambia

    // Renderizado condicional basado en el estado de carga y error
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-gray-700">
                Cargando productos de la categoría...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 md:p-8 lg:p-10">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">
                Productos en: {categoryName || 'Categoría Desconocida'}
            </h1>
            <p className="text-xl text-center text-gray-600 mb-12">
                Explora los productos disponibles en esta categoría.
            </p>

            {products.length === 0 ? (
                <div className="text-center text-gray-600 text-lg mt-12">
                    No hay productos disponibles en esta categoría por el momento.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            nombre={product.nombre}
                            precio={product.precio}
                            imagen_url={product.imagen_url}
                            marca={product.marca}
                            stock={product.stock}
                            colors={product.colors} // Asegúrate de pasar la propiedad colors si existe
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
