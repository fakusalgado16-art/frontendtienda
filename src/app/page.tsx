'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import { UserGroupIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

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
    colors?: { name: string; hex: string; }[];
}

interface Category {
    id: number;
    nombre: string;
    imagen_url?: string;
}

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Carga de productos
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            setErrorProducts(null);
            try {
                const response = await fetch(`${apiUrl}/api/products`);
                if (!response.ok) {
                    throw new Error(`Error HTTP cargando productos: ${response.status}`);
                }
                const productsData: Product[] = await response.json();
                setProducts(productsData);
            } catch (err: any) {
                console.error("Error al cargar los productos en la página de inicio:", err);
                setErrorProducts(`No se pudieron cargar los productos para la página de inicio. Error: ${err.message}`);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [apiUrl]);

    // Carga de categorías
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            setErrorCategories(null);
            try {
                const response = await fetch(`${apiUrl}/api/categories`);
                if (!response.ok) {
                    throw new Error(`Error HTTP cargando categorías: ${response.status}`);
                }
                const data: Category[] = await response.json();
                setCategories(data);
            } catch (err: any) {
                console.error('Error al cargar categorías en HomePage:', err);
                setErrorCategories(`No se pudieron cargar las categorías para la página de inicio. Error: ${err.message}`);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, [apiUrl]);

    const newArrivals = useMemo(() => {
        return [...products]
            .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
            .slice(0, 4);
    }, [products]);

    const featuredProducts = useMemo(() => {
        const startIndex = newArrivals.length;
        return products.slice(startIndex, startIndex + 4);
    }, [products, newArrivals]);

    // MODIFICADO: Selecciona categorías con IDs 8, 9 y 10
    const fixedCategories = useMemo(() => {
        if (categories.length === 0) return [];
        const desiredIds = [8, 9, 10];
        // Filtra las categorías y las ordena para asegurar el orden 8, 9, 10
        const filtered = categories.filter(category => desiredIds.includes(category.id));
        return desiredIds.map(id => filtered.find(category => category.id === id)).filter(Boolean) as Category[];
    }, [categories]);

    if (loadingProducts || loadingCategories) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-gray-700 mt-20">
                Cargando contenido de la página de inicio...
            </div>
        );
    }

    if (errorProducts || errorCategories) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-red-600 mt-20">
                {errorProducts || errorCategories}
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Hero Banner - Solo imagen */}
            <HeroBanner
                imageUrl="/portadainicio.png"
                className="h-screen"
                altText="Banner de inicio de Glow Makeup"
            />

            {/* Sección de Novedades */}
            {newArrivals.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-10">Novedades</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {newArrivals.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    nombre={product.nombre}
                                    precio={product.precio}
                                    imagen_url={product.imagen_url}
                                    marca={product.marca}
                                    stock={product.stock}
                                    colors={product.colors}
                                />
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link href="/products?sort=newest" className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-[#9b0018] hover:bg-[#800010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018] transition-colors duration-200 transform hover:scale-105">
                                Ver todas las Novedades
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Sección de Productos Destacados / Más Vendidos */}
            {featuredProducts.length > 0 && (
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-10">Productos Destacados</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    nombre={product.nombre}
                                    precio={product.precio}
                                    imagen_url={product.imagen_url}
                                    marca={product.marca}
                                    stock={product.stock}
                                    colors={product.colors}
                                />
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link href="/products?sort=featured" className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-[#9b0018] hover:bg-[#800010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018] transition-colors duration-200 transform hover:scale-105">
                                Ver todos los Productos
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Sección de Categorías Destacadas (ahora carga dinámicamente y muestra 3 aleatorias) */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-10">Explora Nuestras Categorías</h2>
                    {fixedCategories.length === 0 ? (
                        <p className="text-center text-gray-600 text-lg">No se encontraron las categorías destacadas (IDs 8, 9, 10).</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {fixedCategories.map((category) => (
                                <Link key={category.id} href={`/products?category=${category.id}`} className="block relative group overflow-hidden rounded-lg shadow-lg">
                                    <Image
                                        src={category.imagen_url || 'https://placehold.co/300x300/E0E0E0/000000?text=Sin+Imagen'} // Fallback si no hay imagen
                                        alt={category.nombre}
                                        width={300}
                                        height={300}
                                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x300/E0E0E0/000000?text=Sin+Imagen'; }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
                                        <h3 className="text-3xl font-bold text-white text-center drop-shadow-lg group-hover:text-pink-300 transition-colors duration-300">
                                            {category.nombre}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className="text-center mt-12">
                        <Link href="/categories" className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-[#9b0018] hover:bg-[#800010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018] transition-colors duration-200 transform hover:scale-105">
                            Ver todas las Categorías
                        </Link>
                    </div>
                </div>
            </section>

            {/* Sección de Beneficios / Compromiso de Marca */}
            <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-10">Nuestro Compromiso con tu Belleza</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <UserGroupIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Atención Personalizada</h3>
                            <p className="text-gray-600">Te acompañamos en cada paso para que encuentres lo que necesitas.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <SparklesIcon className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Productos de Calidad</h3>
                            <p className="text-gray-600">Seleccionamos cuidadosamente cada artículo para garantizar tu satisfacción.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                            <ShieldCheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Compra Segura</h3>
                            <p className="text-gray-600">Tu información y tus pagos están protegidos con la máxima seguridad.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
