// src/middleware.ts (Este archivo debe estar en la raíz de tu carpeta src/ del frontend)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define las rutas que requieren autenticación (solo accesibles si hay un token de admin)
const protectedRoutes = ['/admin/dashboard', '/admin/products', '/admin/categories'];

// Define las rutas que son públicas (accesibles para todos, incluso sin autenticación)
// Incluimos '/' (la página de inicio) y '/admin/login' (la página de login) aquí.
const publicRoutes = ['/', '/admin/login'];

export function middleware(request: NextRequest) {
  // Intentamos obtener el token de administrador de las cookies del navegador.
  // En un entorno de producción, este token se establecería después de un login exitoso.
  const adminToken = request.cookies.get('admin_token')?.value; 
  const { pathname } = request.nextUrl; // Obtiene la ruta actual de la solicitud

  // 1. Si la ruta a la que se intenta acceder es una de las rutas públicas,
  // permitimos el acceso sin restricciones.
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 2. Si la ruta es una ruta protegida (empieza con '/admin/') Y no hay token de administrador,
  // redirigimos al usuario a la página de login.
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !adminToken) {
    const loginUrl = new URL('/admin/login', request.url); // Construye la URL completa de login
    return NextResponse.redirect(loginUrl); // Redirige al usuario
  }

  // 3. Para todas las demás rutas (rutas no protegidas, o rutas protegidas con un token presente),
  // permitimos que la solicitud continúe.
  return NextResponse.next();
}

// Configuración del matcher para el middleware.
// Esto especifica qué rutas deben ser procesadas por este middleware.
// La expresión regular excluye:
// - /api (rutas API de Next.js, que no tenemos en este frontend, pero es buena práctica)
// - /_next/static (archivos estáticos generados por Next.js)
// - /_next/image (archivos de imagen optimizados por Next.js)
// - /favicon.ico
// - Cualquier archivo con extensiones comunes de recursos estáticos (png, jpg, css, js, etc.)
// Esto asegura que el middleware solo se ejecute para las rutas de página.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js)$).*)'],
};
