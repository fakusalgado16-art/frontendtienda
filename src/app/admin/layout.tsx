// src/app/admin/layout.tsx
'use client'; 

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
// ¡CORRECCIÓN AQUÍ! Importa AuthProvider y useAuth desde la carpeta 'contexts' directamente
import { AuthProvider, useAuth } from './contexts/AdminAuthContext'; 

// =========================================================
// Componente de Layout del Dashboard de Administración
// =========================================================

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth(); // user es de tipo AdminUser | null
    const pathname = usePathname();

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
            {/* Sidebar de Navegación */}
            <aside className="w-full md:w-64 bg-gray-800 text-white p-6 flex flex-col shadow-lg">
                <div className="text-2xl font-bold mb-8 text-center">Brava Admin</div>
                <nav className="flex-grow">
                    <ul>
                        <li className="mb-3">
                            <Link href="/admin/dashboard" passHref>
                                <span className={`w-full block text-left py-2 px-4 rounded-md transition duration-150 ease-in-out cursor-pointer ${
                                    pathname === '/admin/dashboard' ? 'bg-indigo-700' : 'hover:bg-gray-700'
                                }`}>
                                    Dashboard
                                </span>
                            </Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/admin/products" passHref>
                                <span className={`w-full block text-left py-2 px-4 rounded-md transition duration-150 ease-in-out cursor-pointer ${
                                    pathname === '/admin/products' ? 'bg-indigo-700' : 'hover:bg-gray-700'
                                }`}>
                                    Productos
                                </span>
                            </Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/admin/categories" passHref>
                                <span className={`w-full block text-left py-2 px-4 rounded-md transition duration-150 ease-in-out cursor-pointer ${
                                    pathname === '/admin/categories' ? 'bg-indigo-700' : 'hover:bg-gray-700'
                                }`}>
                                    Categorías
                                </span>
                            </Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/admin/orders" passHref>
                                <span className={`w-full block text-left py-2 px-4 rounded-md transition duration-150 ease-in-out cursor-pointer ${
                                    pathname === '/admin/orders' ? 'bg-indigo-700' : 'hover:bg-gray-700'
                                }`}>
                                    Órdenes
                                </span>
                            </Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/admin/messages" passHref>
                                <span className={`w-full block text-left py-2 px-4 rounded-md transition duration-150 ease-in-out cursor-pointer ${
                                    pathname === '/admin/messages' ? 'bg-indigo-700' : 'hover:bg-gray-700'
                                }`}>
                                    Mensajes
                                </span>
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className="mt-auto pt-6 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-3">
                        Logueado como: <span className="font-semibold">{user?.username}</span>
                    </p>
                    <button
                        onClick={logout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md shadow-sm transition duration-150 ease-in-out"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 p-6 overflow-auto">
                {children}
            </main>
        </div>
    );
};

// =========================================================
// Layout Raíz del Panel de Administración (Manejo de Carga y Redirección)
// =========================================================

const AdminRootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loadingAuth } = useAuth(); // Ahora estos props son correctamente reconocidos
    const router = useRouter();
    const pathname = usePathname();

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="ml-3 text-gray-700">Cargando autenticación...</p>
            </div>
        );
    } 

    // Si no está autenticado y no está en la página de login, redirigir
    if (!isAuthenticated && pathname !== '/admin/login') {
        router.replace('/admin/login'); 
        return null;
    }

    return isAuthenticated ? <AdminLayout>{children}</AdminLayout> : children;
};

// Exporta el layout por defecto, que envuelve el AuthProvider
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AdminRootLayout>{children}</AdminRootLayout>
        </AuthProvider>
    );
}
