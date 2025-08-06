'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que la ruta sea correcta

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Eliminado: const [name, setName] = useState(''); // Ya no se usa el campo para el nombre
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { user, signUp, isLoading } = useAuth();
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
        setSuccessMessage(null);
        setLoading(true);

        // La función signUp ahora solo espera email y password
        const { success, error: authError } = await signUp(email, password);

        if (success) {
            setSuccessMessage('¡Registro exitoso! Por favor, verifica tu email para confirmar tu cuenta y luego inicia sesión.');
            setEmail('');
            setPassword('');
            // Eliminado: setName('');
            // Opcional: Redirigir al login después de un breve retraso
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } else {
            setError(authError || 'Error al registrar. Inténtalo de nuevo.');
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
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Regístrate</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Eliminado el campo de nombre */}
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
                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Éxito:</strong>
                            <span className="block sm:inline"> {successMessage}</span>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white p-3 rounded-md font-semibold hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
                <p className="text-center text-gray-600 mt-6">
                    ¿Ya tienes una cuenta?{' '}
                    <button
                        onClick={() => router.push('/login')}
                        className="text-purple-600 hover:underline font-medium"
                    >
                        Inicia sesión aquí
                    </button>
                </p>
            </div>
        </div>
    );
}
