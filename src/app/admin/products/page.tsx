// src/app/admin/products/page.tsx
'use client'; // Componente de cliente

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; // Para alertas bonitas (asegúrate de tenerlo instalado)

// Interfaz para Producto
interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    id_categoria: number;
    marca: string;
    imagen_url?: string; // Opcional
    activo: boolean;
    fecha_creacion: string;
    ultima_actualizacion: string;
    // NUEVO: Propiedad para almacenar colores y sus códigos hexadecimales
    colors?: { name: string; hex: string; }[]; 
}

// Interfaz para Categoría (necesaria para el dropdown del formulario)
interface Category {
    id: number;
    nombre: string;
}

export default function AdminProductsPage() {
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); // Estado para las categorías
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null); // Partial para nuevo/edición

    // Estado para el modal de confirmación de eliminación
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState<number | null>(null);

    // Define la URL base del backend desde .env.local
    // ¡ASEGÚRATE DE QUE ESTA VARIABLE DE ENTORNO APUNTE AL PUERTO CORRECTO DE TU BACKEND!
    // Por ejemplo: NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:5000
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

    // Función para cargar categorías (necesarias para el formulario de producto)
    const fetchCategories = useCallback(async () => {
        try {
            // Incluimos credentials: 'include' para asegurar que las cookies se envíen
            const response = await fetch(`${BASE_URL}/api/categories`, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Error al cargar las categorías.');
            }
            const data: Category[] = await response.json();
            setCategories(data);
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            Swal.fire('Error', `Error al cargar categorías: ${error.message}`, 'error');
        }
    }, [BASE_URL]);

    // Función para cargar productos
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Incluimos credentials: 'include' para asegurar que las cookies se envíen
            const response = await fetch(`${BASE_URL}/api/products`, {
                credentials: 'include',
            });
            if (!response.ok) {
                // Si hay un error 401/403 en la carga inicial, redirigir al login
                if (response.status === 401 || response.status === 403) {
                    Swal.fire('Error', 'Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.', 'error');
                    router.push('/admin/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar los productos.');
            }
            const data: Product[] = await response.json();
            setProducts(data);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            Swal.fire('Error', err.message || 'Error al cargar productos.', 'error');
        } finally {
            setLoading(false);
        }
    }, [BASE_URL, router]); // Añadimos router a las dependencias

    // Cargar productos y categorías al montar el componente
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);


    // --- Handlers para CRUD ---

    const handleAddProduct = () => {
        // Inicializa un producto vacío para el formulario de creación
        setEditingProduct({
            activo: true, // Nuevo producto activo por defecto
            precio: 0,
            stock: 0,
            nombre: '',
            descripcion: '',
            marca: '',
            id_categoria: categories.length > 0 ? categories[0].id : 0, // Selecciona la primera categoría si existe
            colors: [] // Inicializa el array de colores vacío
        });
        setShowForm(true);
    };

    const handleEditProduct = (product: Product) => {
        // Asegura que colors sea un array si no existe
        setEditingProduct({ ...product, colors: product.colors || [] });
        setShowForm(true);
    };

    // Función para abrir el modal de confirmación de eliminación
    const confirmDelete = (productId: number) => {
        setProductToDeleteId(productId);
        setShowDeleteConfirmModal(true);
    };

    // Función para ejecutar la eliminación después de la confirmación
    const executeDeleteProduct = async () => {
        setShowDeleteConfirmModal(false); // Cerrar el modal de confirmación
        if (productToDeleteId === null) return;

        setLoading(true); // Mostrar spinner de carga

        try {
            const response = await fetch(`${BASE_URL}/api/products/${productToDeleteId}`, {
                method: 'DELETE',
                credentials: 'include', // <<-- ¡ENVÍA LAS COOKIES!
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    Swal.fire('Error', 'Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.', 'error');
                    router.push('/admin/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar el producto');
            }

            Swal.fire('¡Eliminado!', 'El producto ha sido eliminado.', 'success');
            fetchProducts(); // Recargar la lista de productos
        } catch (err: any) {
            console.error('Error deleting product:', err);
            Swal.fire('Error', err.message || 'Hubo un problema al eliminar el producto.', 'error');
        } finally {
            setLoading(false);
            setProductToDeleteId(null); // Limpiar el ID del producto a eliminar
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirmModal(false);
        setProductToDeleteId(null);
    };

    // --- Handlers para la gestión de colores ---
    const handleAddColor = () => {
        setEditingProduct(prev => ({
            ...prev,
            colors: [...(prev?.colors || []), { name: '', hex: '#000000' }]
        }));
    };

    const handleColorChange = (index: number, field: 'name' | 'hex', value: string) => {
        setEditingProduct(prev => {
            if (!prev || !prev.colors) return prev;
            const newColors = [...prev.colors];
            newColors[index] = { ...newColors[index], [field]: value };
            return { ...prev, colors: newColors };
        });
    };

    const handleRemoveColor = (index: number) => {
        setEditingProduct(prev => {
            if (!prev || !prev.colors) return prev;
            const newColors = prev.colors.filter((_, i) => i !== index);
            return { ...prev, colors: newColors };
        });
    };

    // Función para manejar el envío del formulario (crear/actualizar)
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validaciones básicas del formulario
        if (!editingProduct?.nombre || editingProduct.nombre.trim() === '') {
            Swal.fire('Error', 'El nombre del producto es obligatorio.', 'error');
            setLoading(false);
            return;
        }
        if (typeof editingProduct.precio !== 'number' || isNaN(editingProduct.precio) || editingProduct.precio <= 0) {
            Swal.fire('Error', 'El precio debe ser un número positivo.', 'error');
            setLoading(false);
            return;
        }
        if (typeof editingProduct.stock !== 'number' || isNaN(editingProduct.stock) || editingProduct.stock < 0) {
            Swal.fire('Error', 'El stock debe ser un número no negativo.', 'error');
            setLoading(false);
            return;
        }
        if (!editingProduct.id_categoria) {
            Swal.fire('Error', 'Debe seleccionar una categoría.', 'error');
            setLoading(false);
            return;
        }

        try {
            const method = editingProduct.id ? 'PUT' : 'POST';
            const url = editingProduct.id ? `${BASE_URL}/api/products/${editingProduct.id}` : `${BASE_URL}/api/products`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingProduct),
                credentials: 'include', // <<-- ¡ENVÍA LAS COOKIES!
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    Swal.fire('Error', 'Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.', 'error');
                    router.push('/admin/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || `Error al ${editingProduct.id ? 'actualizar' : 'crear'} el producto`);
            }

            Swal.fire('¡Éxito!', `Producto ${editingProduct.id ? 'actualizado' : 'creado'} exitosamente.`, 'success');
            setShowForm(false);
            setEditingProduct(null); // Limpiar el formulario
            fetchProducts(); // Recargar la lista de productos
        } catch (error: any) {
            console.error('Error saving product:', error);
            Swal.fire('Error', error.message || 'Hubo un problema al guardar el producto.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener el nombre de la categoría (para mostrar en la tabla)
    const getCategoryName = (categoryId: number) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.nombre : 'Desconocida';
    };

    // Renderizado condicional para el spinner de carga inicial
    if (loading && !showForm) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-gray-700 text-lg">Cargando productos...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Gestión de Productos</h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleAddProduct} // Usa el nuevo handler para añadir
                            className="bg-[#9b0018] hover:bg-[#800010] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018]"
                        >
                            Añadir Nuevo Producto
                        </button>
                        <button
                            onClick={() => router.push('/admin/dashboard')}
                            className="bg-[#9b0018] hover:bg-[#800010] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018]"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>

                {/* Formulario de Producto (integrado) */}
                {showForm && (
                    <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
                        <h2 className="text-2xl font-semibold text-[#9b0018] mb-4">
                            {editingProduct?.id ? 'Editar Producto' : 'Añadir Producto'}
                        </h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre:</label>
                                <input
                                    type="text"
                                    value={editingProduct?.nombre || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, nombre: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción:</label>
                                <textarea
                                    value={editingProduct?.descripcion || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, descripcion: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    rows={3}
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Precio:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingProduct?.precio?.toString() || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, precio: parseFloat(e.target.value) })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Stock:</label>
                                    <input
                                        type="number"
                                        value={editingProduct?.stock?.toString() || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Marca:</label>
                                <input
                                    type="text"
                                    value={editingProduct?.marca || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, marca: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoría:</label>
                                <select
                                    value={editingProduct?.id_categoria || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, id_categoria: parseInt(e.target.value) })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                                    required
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                                {categories.length === 0 && (
                                    <p className="text-red-500 text-sm mt-1">No hay categorías disponibles. Crea una primero.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">URL de Imagen:</label>
                                <input
                                    type="text"
                                    value={editingProduct?.imagen_url || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, imagen_url: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">URL de la imagen representativa del producto.</p>
                            </div>

                            {/* NUEVA SECCIÓN: Gestión de Colores/Tonos */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Colores/Tonos del Producto</h3>
                                {editingProduct?.colors?.map((color, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-3 p-2 border border-gray-200 rounded-md bg-white">
                                        <div 
                                            className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0" 
                                            style={{ backgroundColor: color.hex }}
                                            title={`Color: ${color.name} (${color.hex})`}
                                        ></div>
                                        <input
                                            type="text"
                                            placeholder="Nombre del Tono (ej. '15 Lover')"
                                            value={color.name}
                                            onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                                            className="flex-grow p-2 border border-gray-300 rounded-md text-sm"
                                        />
                                        <input
                                            type="color"
                                            value={color.hex}
                                            onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                                            className="w-10 h-10 p-0 border-none cursor-pointer"
                                            title="Seleccionar color"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Código Hex (ej. #FF0000)"
                                            value={color.hex}
                                            onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                                            className="w-32 p-2 border border-gray-300 rounded-md text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveColor(index)}
                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md text-sm"
                                            title="Eliminar color"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddColor}
                                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                                >
                                    Añadir Color/Tono
                                </button>
                            </div>
                            {/* FIN NUEVA SECCIÓN: Gestión de Colores/Tonos */}

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="product-activo"
                                    checked={editingProduct?.activo ?? true}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, activo: e.target.checked })}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <label htmlFor="product-activo" className="ml-2 block text-sm font-medium text-gray-700">
                                    Activo
                                </label>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : (editingProduct?.id ? 'Actualizar Producto' : 'Crear Producto')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditingProduct(null); }}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {products.length === 0 && !showForm ? (
                    <p className="text-gray-600 text-center text-lg">No hay productos para mostrar.</p>
                ) : (
                    !showForm && ( // Solo muestra la tabla si el formulario no está visible
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead>
                                    <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                                        <th className="py-3 px-6 border-b border-gray-200">ID</th>
                                        <th className="py-3 px-6 border-b border-gray-200">Imagen</th>
                                        <th className="py-3 px-6 border-b border-gray-200">Nombre</th>
                                        <th className="py-3 px-6 border-b border-gray-200">Precio</th>
                                        <th className="py-3 px-6 border-b border-gray-200">Stock</th>
                                        <th className="py-3 px-6 border-b border-gray-200">Categoría</th>
                                        <th className="py-3 px-6 border-b border-gray-200">Marca</th>
                                        <th className="py-3 px-6 border-b border-gray-200">Colores</th> {/* Nueva columna */}
                                        <th className="py-3 px-6 border-b border-gray-200">Activo</th>
                                        <th className="py-3 px-6 border-b border-gray-200 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700 text-sm font-light">
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-left whitespace-nowrap">{product.id}</td>
                                            <td className="py-3 px-6 text-left">
                                                {product.imagen_url && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={product.imagen_url}
                                                        alt={product.nombre}
                                                        className="w-12 h-12 object-cover rounded-md"
                                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/48x48/E0E0E0/000000?text=No+Img'; }}
                                                    />
                                                )}
                                            </td>
                                            <td className="py-3 px-6 text-left">{product.nombre}</td>
                                            <td className="py-3 px-6 text-left">${product.precio.toFixed(2)}</td>
                                            <td className="py-3 px-6 text-left">{product.stock}</td>
                                            <td className="py-3 px-6 text-left">{getCategoryName(product.id_categoria)}</td>
                                            <td className="py-3 px-6 text-left">{product.marca}</td>
                                            {/* Columna de Colores */}
                                            <td className="py-3 px-6 text-left">
                                                <div className="flex flex-wrap gap-1">
                                                    {product.colors && product.colors.length > 0 ? (
                                                        product.colors.map((color, idx) => (
                                                            <span 
                                                                key={idx} 
                                                                className="w-5 h-5 rounded-full border border-gray-300" 
                                                                style={{ backgroundColor: color.hex }}
                                                                title={`${color.name} (${color.hex})`}
                                                            ></span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500 text-xs">N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-left">{product.activo ? 'Sí' : 'No'}</td>
                                            <td className="py-3 px-6 text-center">
                                                <div className="flex item-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditProduct(product)} // Usa el nuevo handler para editar
                                                        className="bg-[#9b0018] hover:bg-[#800010] text-white font-bold py-1 px-3 rounded text-xs focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018]"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(product.id)}
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
                        <p className="text-gray-700 mb-6">¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={executeDeleteProduct}
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
