// src/app/admin/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation';
// ¡CORRECCIÓN CLAVE AQUÍ! Importa useAuth desde el contexto de admin específico
import { useAuth } from '../contexts/AdminAuthContext'; // CAMBIADO: La ruta correcta es '../contexts/AdminAuthContext'

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    // Usa las propiedades y funciones del AdminAuthContext
    const { login, isAuthenticated, loadingAuth } = useAuth(); 

    const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL || 'http://localhost:5000';

    // Redirige si el usuario ya está autenticado en el panel de administración
    useEffect(() => {
        if (!loadingAuth && isAuthenticated) {
            router.replace('/admin/dashboard');
        }
    }, [isAuthenticated, loadingAuth, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!BASE_URL) {
            setError('La URL del backend para el admin no está configurada.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // La función login del AdminAuthContext espera solo el token
                login(data.token); 
                // La redirección se maneja en el useEffect
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Credenciales inválidas. Por favor, inténtalo de nuevo.');
            }
        } catch (err) {
            setError('Error de conexión. Por favor, inténtalo de nuevo más tarde.');
            console.error('Admin login error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Muestra un estado de carga si la autenticación inicial está en curso
    if (loadingAuth || isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="ml-3 text-gray-700">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Acceso de Administrador</h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                            Usuario:
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            Contraseña:
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
