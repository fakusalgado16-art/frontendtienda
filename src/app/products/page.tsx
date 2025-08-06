// app/product/page.tsx

'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import { useSearchParams } from 'next/navigation'; // Importa useSearchParams

// Definición de la interfaz Product directamente en este archivo
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

// Definición de la interfaz Category directamente en este archivo
interface Category {
    id: number;
    nombre: string;
}

// Componente principal que se exporta y que contendrá el Suspense
// Necesario para que useSearchParams funcione correctamente en un 'use client' component
export default function ProductsClientPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-gray-700">
                Cargando productos...
            </div>
        }>
            <ProductsPageContent />
        </Suspense>
    );
}

// Nuevo componente que contiene toda la lógica original de ProductsClientPage
function ProductsPageContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    // Obtiene los parámetros de búsqueda de la URL
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || ''; // Para la barra de búsqueda

    // Estado para la categoría seleccionada en el filtro.
    // Se inicializa con 'all' o con el valor del parámetro 'category' de la URL.
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<string>('default');

    // **LÓGICA CLAVE PARA EL FILTRADO POR URL:**
    // Este useEffect se ejecuta cada vez que 'searchParams' (los parámetros de la URL) cambian.
    // Esto asegura que el estado 'selectedCategory' siempre refleje lo que está en la URL.
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        // Si hay un parámetro 'category' en la URL, úsalo para establecer el filtro.
        // De lo contrario, asegúrate de que el filtro esté en 'all'.
        setSelectedCategory(categoryFromUrl || 'all');
    }, [searchParams]); // Dependencia: solo se ejecuta cuando searchParams cambia

    // Define la URL de la API, ahora unificada a 5000 para todos los endpoints
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Carga de productos desde el backend
    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            setErrorProducts(null);
            if (!apiUrl) {
                setErrorProducts('La URL del backend no está definida.');
                setLoadingProducts(false);
                return;
            }
            try {
                // MODIFICACIÓN: Eliminado { cache: 'no-store' }
                const response = await fetch(`${apiUrl}/api/products`);
                if (!response.ok) {
                    throw new Error(`Error HTTP cargando productos: ${response.status}`);
                }
                const productsData: Product[] = await response.json();
                // Filtra solo los productos activos y asegura que 'colors' exista
                const activeProducts = productsData
                    .filter(product => product.activo === true)
                    .map(product => ({
                        ...product,
                        colors: product.colors || []
                    }));
                setProducts(activeProducts);
            } catch (err: unknown) {
                console.error("Error al cargar los productos:", err);
                if (err instanceof Error) {
                    setErrorProducts(`No se pudieron cargar los productos. Error: ${err.message}`);
                } else {
                    setErrorProducts(`No se pudieron cargar los productos. Error desconocido.`);
                }
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [apiUrl]); // Se ejecuta una vez al montar y si apiUrl cambia

    // Carga de categorías desde el backend (para el dropdown de filtro)
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            setErrorCategories(null);
            if (!apiUrl) {
                setErrorCategories('La URL del backend no está definida.');
                setLoadingCategories(false);
                return;
            }
            try {
                // MODIFICACIÓN: Eliminado { cache: 'no-store' }
                const response = await fetch(`${apiUrl}/api/categories`);
                if (!response.ok) {
                    throw new Error(`Error HTTP cargando categorías: ${response.status}`);
                }
                const data: Category[] = await response.json();
                setCategories(data);
            } catch (err: unknown) {
                console.error('Error al cargar categorías en ProductsPage:', err);
                if (err instanceof Error) {
                    setErrorCategories(`No se pudieron cargar las categorías para el filtro. Error: ${err.message}`);
                } else {
                    setErrorCategories(`No se pudieron cargar las categorías para el filtro. Error desconocido.`);
                }
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, [apiUrl]); // Se ejecuta una vez al montar y si apiUrl cambia

    // Lógica de filtrado y ordenamiento de productos.
    // Usa useMemo para optimizar y solo recalcular cuando las dependencias cambian.
    const filteredAndSortedProducts = useMemo(() => {
        let currentProducts = products;

        // 1. Filtrar por término de búsqueda (barra de búsqueda)
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            currentProducts = currentProducts.filter(product =>
                product.nombre.toLowerCase().includes(lowerCaseQuery) ||
                product.descripcion.toLowerCase().includes(lowerCaseQuery) ||
                product.marca.toLowerCase().includes(lowerCaseQuery)
            );
        }

        // 2. Filtrar por categoría (desde la URL o el selector)
        if (selectedCategory !== 'all') {
            const categoryId = parseInt(selectedCategory); // Convierte a número
            // Solo filtra si categoryId es un número válido
            if (!isNaN(categoryId)) {
                currentProducts = currentProducts.filter(product => product.id_categoria === categoryId);
            } else {
                // Esto podría ocurrir si el parámetro de URL es inválido (ej. ?category=abc)
                console.warn(`Valor de categoría inválido en la URL o selector: ${selectedCategory}. No se aplicará el filtro de categoría.`);
            }
        }

        // 3. Ordenar los productos
        const sorted = [...currentProducts].sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc':
                    return a.precio - b.precio; // Precio ascendente
                case 'price-desc':
                    return b.precio - a.precio; // Precio descendente
                case 'name-asc':
                    return a.nombre.localeCompare(b.nombre); // Nombre A-Z
                case 'name-desc':
                    return b.nombre.localeCompare(a.nombre); // Nombre Z-A
                default:
                    return 0; // Sin ordenamiento específico
            }
        });

        return sorted;
    }, [products, selectedCategory, sortOrder, searchQuery]); // Dependencias para recalcular

    // Estados de carga y error
    if (loadingProducts || loadingCategories) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-gray-700">
                Cargando productos y categorías...
            </div>
        );
    }

    if (errorProducts || errorCategories) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-red-600">
                {errorProducts || errorCategories}
            </div>
        );
    }

    if (products.length === 0 && !loadingProducts) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-gray-700">
                No hay productos disponibles en este momento.
            </div>
        );
    }

    return (
        <div>
            <HeroBanner
                imageUrl="https://res.cloudinary.com/diyhkjien/image/upload/v1753384467/banner_bhle0r.png"
                altText="Descubrí la belleza con Glow Makeup"
                title="¡Descubrí la Belleza que Hay en vos!"
                subtitle="Explora nuestra colección de maquillaje de alta calidad y realza tu brillo natural."
                buttonText="Comprar Ahora"
                buttonLink="/products"
            />

            <div className="container mx-auto p-6 md:p-8 lg:p-10">
                <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">Nuestros Productos</h1>
                <p className="text-xl text-center text-gray-600 mb-12">
                    Descubre nuestra exclusiva colección de maquillaje de alta calidad.
                </p>

                {/* Controles de Filtro y Ordenamiento */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0 md:space-x-4">
                    {/* Selector de Categoría */}
                    <div className="w-full md:w-1/2">
                        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Filtrar por Categoría:
                        </label>
                        <select
                            id="category-select"
                            name="category-select"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#9b0018] focus:border-[#9b0018] sm:text-sm rounded-md shadow-sm"
                            value={selectedCategory} // El valor del selector se enlaza al estado
                            onChange={(e) => setSelectedCategory(e.target.value)} // Actualiza el estado al cambiar
                        >
                            <option value="all">Todas las Categorías</option>
                            {categories.length === 0 && !loadingCategories ? (
                                <option value="" disabled>No hay categorías disponibles</option>
                            ) : (
                                categories.map((category) => (
                                    <option key={category.id} value={category.id.toString()}>
                                        {category.nombre}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Selector de Ordenamiento */}
                    <div className="w-full md:w-1/2">
                        <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Ordenar por:
                        </label>
                        <select
                            id="sort-select"
                            name="sort-select"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#9b0018] focus:border-[#9b0018] sm:text-sm rounded-md shadow-sm"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="default">Por Defecto</option>
                            <option value="price-asc">Precio: Más Bajo a Más Alto</option>
                            <option value="price-desc">Precio: Más Alto a Más Bajo</option>
                            <option value="name-asc">Nombre: A-Z</option>
                            <option value="name-desc">Nombre: Z-A</option>
                        </select>
                    </div>
                </div>

                {/* Muestra los productos filtrados y ordenados */}
                {filteredAndSortedProducts.length === 0 && (searchQuery || selectedCategory !== 'all') ? (
                    <div className="text-center text-gray-600 text-lg mt-12">
                        No se encontraron productos que coincidan con tu búsqueda o filtros.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                        {filteredAndSortedProducts.map((product) => (
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
                )}
            </div>
        </div>
    );
}
