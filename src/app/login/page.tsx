'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que la ruta sea correcta

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { user, signIn, isLoading } = useAuth();
    const router = useRouter();

    // Redirige si el usuario ya está autenticado
    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/profile');
        }
    }, [user, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { success, error: authError } = await signIn(email, password);

        if (success) {
            // La redirección se maneja en el useEffect
            console.log('Login exitoso!');
        } else {
            setError(authError || 'Error al iniciar sesión. Inténtalo de nuevo.');
        }
        setLoading(false);
    };

    // Si la carga inicial de autenticación está en curso, muestra un spinner o mensaje
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <p className="ml-4 text-gray-700">Cargando...</p>
            </div>
        );
    }

    // Si ya está logueado, no renderizamos el formulario (el useEffect lo redirigirá)
    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="tu@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white p-3 rounded-md font-semibold hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>
                <p className="text-center text-gray-600 mt-6">
                    ¿No tienes una cuenta?{' '}
                    <button
                        onClick={() => router.push('/register')}
                        className="text-purple-600 hover:underline font-medium"
                    >
                        Regístrate aquí
                    </button>
                </p>
            </div>
        </div>
    );
}
