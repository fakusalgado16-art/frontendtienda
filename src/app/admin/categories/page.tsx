// src/app/admin/categories/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
// ¡CORRECCIÓN CLAVE AQUÍ! Importa useAuth desde el contexto de admin específico
import { useAuth } from '../contexts/AdminAuthContext'; 

// Interfaz para Categoría
interface Category {
    id: number;
    nombre: string;
    imagen_url?: string; // Opcional
}

export default function AdminCategoriesPage() {
    const router = useRouter();
    // Usa useAuth para obtener el estado de autenticación
    const { isAuthenticated, loadingAuth } = useAuth(); 

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

    // Estado para el modal de confirmación de eliminación
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [categoryToDeleteId, setCategoryToDeleteId] = useState<number | null>(null);

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5000';

    // Redirige si no está autenticado y la autenticación ha terminado de cargar
    useEffect(() => {
        if (!loadingAuth && !isAuthenticated) {
            router.replace('/admin/login');
        }
    }, [isAuthenticated, loadingAuth, router]);

    // Función para cargar categorías
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/categories`, {
                credentials: 'include', // Para enviar la cookie de autenticación
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    Swal.fire('Error', 'Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.', 'error');
                    router.push('/admin/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar las categorías.');
            }
            const data: Category[] = await response.json();
            setCategories(data);
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            Swal.fire('Error', err.message || 'Error al cargar categorías.', 'error');
        } finally {
            setLoading(false);
        }
    }, [BASE_URL, router]);

    // Cargar categorías al montar el componente
    useEffect(() => {
        // Solo intenta cargar si la autenticación ha terminado y el usuario está autenticado
        if (!loadingAuth && isAuthenticated) {
            fetchCategories();
        }
    }, [fetchCategories, loadingAuth, isAuthenticated]);

    // --- Handlers para CRUD ---

    const handleAddCategory = () => {
        setEditingCategory({ nombre: '', imagen_url: '' });
        setShowForm(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    const confirmDelete = (categoryId: number) => {
        setCategoryToDeleteId(categoryId);
        setShowDeleteConfirmModal(true);
    };

    const executeDeleteCategory = async () => {
        setShowDeleteConfirmModal(false);
        if (categoryToDeleteId === null) return;

        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/categories/${categoryToDeleteId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    Swal.fire('Error', 'Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.', 'error');
                    router.push('/admin/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar la categoría');
            }

            Swal.fire('¡Eliminado!', 'La categoría ha sido eliminada.', 'success');
            fetchCategories();
        } catch (err: any) {
            console.error('Error deleting category:', err);
            Swal.fire('Error', err.message || 'Hubo un problema al eliminar la categoría.', 'error');
        } finally {
            setLoading(false);
            setCategoryToDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirmModal(false);
        setCategoryToDeleteId(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!editingCategory?.nombre || editingCategory.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre de la categoría es obligatorio.', 'error');
            setLoading(false);
            return;
        }

        try {
            const method = editingCategory.id ? 'PUT' : 'POST';
            const url = editingCategory.id ? `${BASE_URL}/api/categories/${editingCategory.id}` : `${BASE_URL}/api/categories`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingCategory),
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    Swal.fire('Error', 'Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.', 'error');
                    router.push('/admin/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || `Error al ${editingCategory.id ? 'actualizar' : 'crear'} la categoría`);
            }

            Swal.fire('¡Éxito!', `Categoría ${editingCategory.id ? 'actualizada' : 'creada'} exitosamente.`, 'success');
            setShowForm(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (error: any) {
            console.error('Error saving category:', error);
            Swal.fire('Error', error.message || 'Hubo un problema al guardar la categoría.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Renderizado condicional para el spinner de carga inicial o si no está autenticado
    if (loadingAuth || (loading && isAuthenticated)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-gray-700 text-lg">Cargando categorías...</p>
            </div>
        );
    }

    // Si no está autenticado y ya no está cargando, no renderiza nada (la redirección se encarga)
    if (!isAuthenticated && !loadingAuth) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Gestión de Categorías</h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleAddCategory}
                            className="bg-[#9b0018] hover:bg-[#800010] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018]"
                        >
                            Añadir Nueva Categoría
                        </button>
                        <button
                            onClick={() => router.push('/admin/dashboard')}
                            className="bg-[#9b0018] hover:bg-[#800010] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018]"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>

                {/* Formulario de Categoría */}
                {showForm && (
                    <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
                        <h2 className="text-2xl font-semibold text-[#9b0018] mb-4">
                            {editingCategory?.id ? 'Editar Categoría' : 'Añadir Categoría'}
                        </h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre:</label>
                                <input
                                    type="text"
                                    value={editingCategory?.nombre || ''}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, nombre: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">URL de Imagen (Opcional):</label>
                                <input
                                    type="text"
                                    value={editingCategory?.imagen_url || ''}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, imagen_url: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : (editingCategory?.id ? 'Actualizar Categoría' : 'Crear Categoría')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditingCategory(null); }}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {categories.length === 0 && !showForm ? (
                    <p className="text-gray-600 text-center text-lg">No hay categorías para mostrar.</p>
                ) : (
                    !showForm && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead>
                                    <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                                        <th className="py-3 px-6 border-b border-gray-200">ID</th>
                                        <th className="py-3 px-6 border-b border-gray-200">Nombre</th>
                                        <th className="py-3 px-6 border-b border-gray-200">Imagen</th>
                                        <th className="py-3 px-6 border-b border-gray-200 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 text-sm font-light">
                                    {categories.map((category) => (
                                        <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-left whitespace-nowrap">{category.id}</td>
                                            <td className="py-3 px-6 text-left">{category.nombre}</td>
                                            <td className="py-3 px-6 text-left">
                                                {category.imagen_url && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={category.imagen_url}
                                                        alt={category.nombre}
                                                        className="w-12 h-12 object-cover rounded-md"
                                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/48x48/E0E0E0/000000?text=No+Img'; }}
                                                    />
                                                )}
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <div className="flex item-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditCategory(category)}
                                                        className="bg-[#9b0018] hover:bg-[#800010] text-white font-bold py-1 px-3 rounded text-xs focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018]"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(category.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>

            {/* Modal de Confirmación de Eliminación */}
            {showDeleteConfirmModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-700 mb-6">¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={executeDeleteCategory}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                            >
                                Sí, Eliminar
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
