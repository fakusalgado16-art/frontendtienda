// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AdminAuthContext'; // CORRECCIÓN: Importa useAuth desde el contexto de admin
import { Link } from 'lucide-react';

export default function AdminDashboardPage() {
    const { user, isAuthenticated, loadingAuth } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirige si no está autenticado y la autenticación ha terminado de cargar
        if (!loadingAuth && !isAuthenticated) {
            router.replace('/admin/login');
        }
    }, [isAuthenticated, loadingAuth, router]);

    if (loadingAuth) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-gray-700">
                Cargando dashboard...
            </div>
        );
    }

    if (!user) {
        // Esto solo debería mostrarse brevemente si hay un problema de redirección
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-gray-700">
                Acceso denegado. Redirigiendo...
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard de Administración</h1>
            <p className="text-lg text-gray-700 mb-4">
                Bienvenido, <span className="font-semibold">{user.username}</span>!
            </p>
            <p className="text-gray-600">
                Tu rol es: <span className="font-medium text-indigo-600">{user.role}</span>
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-100 p-5 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-blue-800 mb-2">Gestión de Productos</h2>
                    <p className="text-blue-700">Administra el inventario, añade nuevos productos, edita o elimina existentes.</p>
                    <Link href="/admin/products" className="mt-3 inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Ir a Productos
                    </Link>
                </div>
                <div className="bg-green-100 p-5 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-green-800 mb-2">Gestión de Órdenes</h2>
                    <p className="text-green-700">Revisa y procesa las órdenes de los clientes.</p>
                    <Link href="/admin/orders" className="mt-3 inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                        Ir a Órdenes
                    </Link>
                </div>
                <div className="bg-yellow-100 p-5 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-yellow-800 mb-2">Gestión de Categorías</h2>
                    <p className="text-yellow-700">Organiza tus productos en diferentes categorías.</p>
                    <Link href="/admin/categories" className="mt-3 inline-block bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors">
                        Ir a Categorías
                    </Link>
                </div>
            </div>
        </div>
    );
}
