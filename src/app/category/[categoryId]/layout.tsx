// src/app/category/[categoryId]/layout.tsx
// ESTE ARCHIVO ES UN SERVER COMPONENT POR DEFECTO.
// NO DEBE LLEVAR 'use client' AL PRINCIPIO.

import React from 'react';

// Interfaz para la estructura de una categoría, usada por generateStaticParams
interface Category {
  id: number;
  nombre: string;
}

// Define la URL base de tu API de backend
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * generateStaticParams se ejecuta en el servidor (durante la fase de "build" de Next.js)
 * para determinar qué páginas estáticas deben ser pre-generadas para esta ruta dinámica.
 *
 * Debe devolver un array de objetos, donde cada objeto tiene la clave del parámetro dinámico
 * (en este caso, `categoryId`) y su valor.
 */
export async function generateStaticParams() {
  console.log('Ejecutando generateStaticParams desde layout.tsx para obtener IDs de categorías...');
  try {
    // Realiza una petición a tu API para obtener todas las categorías.
    // Usamos { cache: 'no-store' } para asegurar que la API sea llamada siempre
    // durante la compilación y no use una caché antigua si los datos cambian.
    const response = await fetch(`${apiUrl}/api/categories`, { cache: 'no-store' });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error HTTP al cargar categorías para generateStaticParams (layout): ${response.status} - ${errorText}`);
      // Si hay un error, devolvemos un array vacío para evitar que la compilación falle,
      // pero esto significa que no se pre-generarán páginas para esta ruta.
      return [];
    }

    const categories: Category[] = await response.json();
    console.log('Categorías obtenidas para generateStaticParams (layout):', categories.map(c => c.id));

    // Mapea las categorías obtenidas al formato que Next.js espera para generateStaticParams.
    // Cada ID de categoría se convierte en una cadena.
    return categories.map((category) => ({
      categoryId: category.id.toString(),
    }));

  } catch (error) {
    console.error('Error en generateStaticParams (layout) al obtener categorías:', error);
    // En caso de error de red o similar, también devolvemos un array vacío.
    return [];
  }
}

/**
 * CategoryLayout es un Server Component que envuelve el contenido de la página.
 * Recibe `children` como prop, que es el `page.tsx` (o cualquier otro componente)
 * que se renderiza dentro de este layout.
 */
export default function CategoryLayout({
  children, // Esto representa el componente page.tsx dentro de esta ruta dinámica
}: {
  children: React.ReactNode; // Tipo para los hijos de React
}) {
  return (
    <>
      {/* Aquí puedes añadir elementos comunes a todas las páginas de categoría,
          como una barra lateral, un encabezado, etc.
          Por ahora, solo renderizamos los hijos directamente. */}
      {children}
    </>
  );
}
