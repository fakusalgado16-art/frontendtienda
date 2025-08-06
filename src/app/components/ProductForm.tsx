// mi-tienda-maquillaje-frontend/src/app/components/ProductForm.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Definición de la interfaz Product directamente en este archivo
interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    id_categoria: number;
    marca: string;
    imagen_url: string;
    activo: boolean;
    fecha_creacion: string;
    ultima_actualizacion: string;
}

// Definición de la interfaz Category directamente en este archivo
interface Category {
    id: number;
    nombre: string;
}

// Define la interfaz para las propiedades del componente ProductForm
interface ProductFormProps {
    product?: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
    // Estado local para los campos del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        id_categoria: '',
        marca: '',
        imagen_url: '',
        activo: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]); // Usa la interfaz Category

    // Define la URL de la API de tu backend
    const apiUrl = 'http://localhost:5000'; // Asegúrate de que este puerto coincida con tu backend

    // Cargar datos del producto si se está editando
    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre || '',
                descripcion: product.descripcion || '',
                precio: product.precio !== undefined ? product.precio.toString() : '',
                stock: product.stock !== undefined ? product.stock.toString() : '',
                id_categoria: product.id_categoria !== undefined ? product.id_categoria.toString() : '',
                marca: product.marca || '',
                imagen_url: product.imagen_url || '',
                activo: product.activo !== undefined ? product.activo : true,
            });
        }
    }, [product]);

    // Cargar categorías al montar el componente
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // La URL de tu backend Express para las categorías públicas
                // No necesita token para GET de categorías si la ruta es pública
                const response = await fetch(`${apiUrl}/api/categories`);
                if (!response.ok) {
                    throw new Error('No se pudieron cargar las categorías.');
                }
                const data: Category[] = await response.json();
                setCategories(data);
            } catch (err: unknown) {
                console.error('Error fetching categories for form:', err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Error desconocido al cargar las categorías para el formulario.');
                }
            }
        };
        fetchCategories();
    }, [apiUrl]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const productData = {
            ...formData,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock, 10),
            id_categoria: parseInt(formData.id_categoria, 10),
        };

        const method = product ? 'PUT' : 'POST';
        const url = product ? `${apiUrl}/api/products/${product.id}` : `${apiUrl}/api/products`;

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                throw new Error('No hay token de autenticación disponible. Inicia sesión.');
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }

            alert(`Producto ${product ? 'actualizado' : 'añadido'} con éxito!`);
            onSuccess();
        } catch (err: unknown) {
            console.error('Error al guardar producto:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error desconocido al guardar el producto.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto my-8">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#9b0018] focus:border-[#9b0018]"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="marca" className="block text-sm font-medium text-gray-700">Marca</label>
                    <input
                        type="text"
                        id="marca"
                        name="marca"
                        value={formData.marca}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#9b0018] focus:border-[#9b0018]"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#9b0018] focus:border-[#9b0018]"
                ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label htmlFor="precio" className="block text-sm font-medium text-gray-700">Precio</label>
                    <input
                        type="number"
                        id="precio"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#9b0018] focus:border-[#9b0018]"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#9b0018] focus:border-[#9b0018]"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700">Categoría</label>
                    <select
                        id="id_categoria"
                        name="id_categoria"
                        value={formData.id_categoria}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#9b0018] focus:border-[#9b0018]"
                        required
                    >
                        <option value="">Selecciona una categoría</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="imagen_url" className="block text-sm font-medium text-gray-700">URL de Imagen</label>
                <input
                    type="text"
                    id="imagen_url"
                    name="imagen_url"
                    value={formData.imagen_url}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#9b0018] focus:border-[#9b0018]"
                />
            </div>

            <div className="flex items-center mb-6">
                <input
                    type="checkbox"
                    id="activo"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#9b0018] border-gray-300 rounded focus:ring-[#9b0018]"
                />
                <label htmlFor="activo" className="ml-2 block text-sm font-medium text-gray-700">
                    Activo (visible en la tienda)
                </label>
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018]"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9b0018] hover:bg-[#800010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9b0018]"
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : (product ? 'Actualizar Producto' : 'Añadir Producto')}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
