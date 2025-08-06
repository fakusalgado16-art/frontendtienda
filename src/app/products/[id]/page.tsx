// src/app/products/[id]/page.tsx (Server Component)

import { notFound } from 'next/navigation';
import ClientProductPage from './client-product-page'; // Importa el componente cliente

// Definición de la interfaz Product
interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    id_categoria: number;
    marca: string;
    imagen_url: string; // Vuelve a singular para coincidir con el backend y client-product-page.tsx
    activo: boolean;
    fecha_creacion: string;
    ultima_actualizacion: string;
    colors?: { name: string; hex: string; }[]; // AÑADIDO: Propiedad para los colores/tonos
}

interface ProductPageProps {
    params: {
        id: string;
    };
}

// Define la URL base del backend desde .env.local
// ¡ASEGÚRATE DE QUE ESTA VARIABLE DE ENTORNO APUNTE AL PUERTO CORRECTO DE TU BACKEND!
// Por ejemplo: NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:5000
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;


// ====================================================================
// FUNCIÓN generateStaticParams - NECESARIA PARA 'output: export'
// Se ejecuta en el servidor en tiempo de build.
// ====================================================================
export async function generateStaticParams() {
    let products: Product[] = [];
    if (!BASE_URL) {
        console.error('NEXT_PUBLIC_BACKEND_BASE_URL is not defined for generateStaticParams.');
        return [];
    }
    try {
        // Usa BASE_URL para la llamada a la API
        const response = await fetch(`${BASE_URL}/api/products`, {
            cache: 'no-store', // Asegura que siempre se obtengan los últimos datos durante el build
        });
        if (!response.ok) {
            console.error(`Error al cargar productos para generateStaticParams: ${response.status} ${response.statusText}`);
            return [];
        }
        products = await response.json();
    } catch (error) {
        console.error("Failed to fetch products for generateStaticParams:", error);
        return [];
    }

    return products.map((product) => ({
        id: product.id.toString(),
    }));
}

// Componente principal de la página (Server Component)
export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = params;
    let product: Product | null = null;

    if (!BASE_URL) {
        console.error('NEXT_PUBLIC_BACKEND_BASE_URL is not defined for ProductPage.');
        notFound(); // O maneja el error de otra forma
    }

    try {
        // Usa BASE_URL para el fetch del producto
        const productResponse = await fetch(`${BASE_URL}/api/products/${id}`, {
            cache: 'no-store' // Para asegurar que siempre se obtengan los datos más recientes
        });

        if (!productResponse.ok) {
            if (productResponse.status === 404) {
                notFound();
            }
            throw new Error(`Error HTTP al cargar el producto: ${productResponse.status}`);
        }
        product = await productResponse.json();
        // Asegúrate de que 'colors' sea un array, incluso si viene null/undefined de la DB
        if (product && (product.colors === null || product.colors === undefined)) {
            product.colors = [];
        }

    } catch (err: any) {
        console.error("Error al cargar el producto en el servidor:", err);
        notFound();
    }

    if (!product) {
        notFound();
    }

    return <ClientProductPage initialProduct={product} />;
}

// Opcional: Si quieres revalidar las páginas estáticas después de un tiempo
// export const revalidate = 60; // revalidate at most every 60 seconds
