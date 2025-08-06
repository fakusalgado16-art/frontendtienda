'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que la ruta sea correcta

export default function ProfilePage() {
    const { user, isLoading, logout, updateUserMetadata } = useAuth();
    const router = useRouter();

    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Redirige si el usuario no está autenticado después de la carga inicial
    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    // Carga los datos iniciales del usuario cuando el componente se monta o el usuario cambia
    useEffect(() => {
        if (user) {
            // Accede a los metadatos del usuario para obtener el nombre y el teléfono
            setName(user.user_metadata?.name || '');
            setPhone(user.user_metadata?.phone || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingUpdate(true);
        setError(null);
        setSuccessMessage(null);

        // Llama a la nueva función updateUserMetadata
        const { success, error: updateError } = await updateUserMetadata({
            name: name,
            phone: phone,
        });

        if (success) {
            setSuccessMessage('¡Perfil actualizado exitosamente!');
            setIsEditing(false); // Deshabilita la edición después de guardar
        } else {
            setError(updateError || 'Error al actualizar el perfil.');
        }
        setLoadingUpdate(false);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login'); // Redirige al login después de cerrar sesión
    };

    // Si la carga inicial de autenticación está en curso, muestra un spinner o mensaje
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <p className="ml-4 text-gray-700">Cargando perfil...</p>
            </div>
        );
    }

    // Si no hay usuario (y ya terminó de cargar), redirigimos (manejado por useEffect)
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden">
                {/* Panel lateral de navegación */}
                <div className="w-full md:w-1/3 bg-gradient-to-br from-purple-700 to-purple-900 text-white p-6 sm:p-8 flex flex-col items-center md:items-start justify-between">
                    <div className="flex flex-col items-center md:items-start mb-6 w-full">
                        <div className="bg-purple-100 rounded-full p-4 mb-4 shadow-lg">
                            <svg className="w-20 h-20 text-purple-700" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold break-all text-center md:text-left mb-2">{user.email}</p>
                        <p className="text-md text-purple-200 mt-1">Hola, ¡bienvenido a tu perfil!</p>
                        <p className="text-sm text-purple-300 mt-1">Miembro desde: {new Date(user.created_at || '').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <nav className="w-full mt-8">
                        <button className="w-full flex items-center p-4 mb-3 rounded-lg bg-purple-600 hover:bg-purple-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md">
                            <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            <span className="font-semibold text-lg">Información Personal</span>
                        </button>
                        <button className="w-full flex items-center p-4 mb-3 rounded-lg hover:bg-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105">
                            <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 18H7V6h10v12zm-3.5-9h-3v-2h3v2zM19 4h-2V2h-2v2H9V2H7v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V8h14v12z"/></svg>
                            <span className="font-semibold text-lg">Mis Compras</span>
                        </button>
                        <button className="w-full flex items-center p-4 mb-3 rounded-lg hover:bg-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105">
                            <svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                            <span className="font-semibold text-lg">Preguntas y Soporte</span>
                        </button>
                    </nav>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center p-4 mt-8 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 font-bold shadow-lg"
                    >
                        <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                        Cerrar Sesión
                    </button>
                </div>

                {/* Contenido principal del perfil */}
                <div className="w-full md:w-2/3 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-2 border-purple-200 pb-2">Panel de Usuario</h3>
                        <h4 className="text-2xl font-bold text-gray-800 mb-6">Información Personal</h4>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                                    value={user.email || ''}
                                    disabled
                                />
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-purple-400 transition-all duration-200 ${!isEditing ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-900'}`}
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Número de Celular
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-purple-400 transition-all duration-200 ${!isEditing ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-900'}`}
                                    placeholder="No especificado"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative shadow-sm" role="alert">
                                    <strong className="font-bold">Error:</strong>
                                    <span className="block sm:inline"> {error}</span>
                                </div>
                            )}
                            {successMessage && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative shadow-sm" role="alert">
                                    <strong className="font-bold">Éxito:</strong>
                                    <span className="block sm:inline"> {successMessage}</span>
                                </div>
                            )}

                            <div className="flex justify-end mt-8 space-x-3">
                                {!isEditing ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="bg-purple-600 text-white p-4 rounded-lg font-bold hover:bg-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md text-lg"
                                    >
                                        Editar Perfil
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                // Restaura los valores originales si cancela
                                                if (user) {
                                                    setName(user.user_metadata?.name || '');
                                                    setPhone(user.user_metadata?.phone || '');
                                                }
                                                setError(null);
                                                setSuccessMessage(null);
                                            }}
                                            className="bg-gray-400 text-white p-4 rounded-lg font-bold hover:bg-gray-500 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md text-lg"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-green-600 text-white p-4 rounded-lg font-bold hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={loadingUpdate}
                                        >
                                            {loadingUpdate ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
