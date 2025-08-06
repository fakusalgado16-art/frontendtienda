'use client'; // Componente de cliente

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Importar useRouter para redirección
import { useAuth } from '../contexts/AdminAuthContext';
import Swal from 'sweetalert2'; // Para alertas bonitas


// URL base de tu backend Node.js
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5000'; // Usa la variable de entorno

// Componente de spinner de carga
const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
    </div>
);

// Componente de caja de mensajes
interface MessageBoxProps {
    message: string | null;
    type: 'success' | 'error' | 'info';
    onClose?: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, type, onClose }) => {
    if (!message) return null;

    let bgColor = '';
    let textColor = '';
    switch (type) {
        case 'success':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            break;
        case 'error':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            break;
        case 'info':
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
            break;
    }

    return (
        <div className="fixed top-20 right-5 z-50">
            <div className={`${bgColor} ${textColor} p-3 rounded-md mb-4 flex justify-between items-center shadow-lg animate-fade-in-down`}>
                <span>{message}</span>
                {onClose && (
                    <button onClick={onClose} className="text-current font-bold ml-4">
                        &times;
                    </button>
                )}
            </div>
        </div>
    );
};

// Interfaz para Ítem de Orden
interface OrderItem {
    product_id: number;
    product_name: string;
    quantity: number;
    price_at_purchase: number;
    // selected_color puede ser un objeto, null, o incluso una cadena si la DB no lo parsea automáticamente
    selected_color?: { name: string; hex: string; } | string | null; 
}

// Interfaz para Orden
interface Order {
    id: string; // UUID del backend
    user_id: string | null; // Puede ser null si no hay usuario registrado
    customer_name: string;
    customer_email: string;
    customer_phone?: string | null; // Opcional
    shipping_address: string;
    city: string;
    postal_code: string;
    country: string;
    total_amount: number;
    status: string;
    order_date: string; // ISO string
    location_instructions?: string | null; // Se cambió a opcional para compatibilidad
    items: OrderItem[]; // Array de ítems de la orden
}

export default function AdminOrdersPage() {
    const router = useRouter();
    const { isAuthenticated, loadingAuth } = useAuth(); // Usamos isAuthenticated y loadingAuth del AdminAuthContext

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageBox, setMessageBox] = useState<string | null>(null);
    const [messageBoxType, setMessageBoxType] = useState<'success' | 'error' | 'info'>('info');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null); // Para expandir detalles de la orden
    const [newStatus, setNewStatus] = useState<string>(''); // Para el selector de estado

    const allowedStatuses = ['Pedido Recibido', 'Esperando Pago', 'En Preparación', 'Listo', 'En Distribución', 'Entregado', 'Cancelado'];

    // Redirige si no está autenticado y la autenticación ha terminado de cargar
    useEffect(() => {
        if (!loadingAuth && !isAuthenticated) {
            router.replace('/admin/login');
        }
    }, [isAuthenticated, loadingAuth, router]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setMessageBox(null);
        try {
            // Incluimos credentials: 'include' para asegurar que las cookies se envíen
            const response = await fetch(`${BASE_URL}/api/orders/admin/orders`, {
                credentials: 'include', // Importante para enviar la cookie de autenticación
            });

            if (!response.ok) {
                // Si hay un error 401/403, redirigir al login
                if (response.status === 401 || response.status === 403) {
                    Swal.fire('Error', 'Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.', 'error');
                    router.replace('/admin/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar órdenes');
            }
            const data: Order[] = await response.json();
            setOrders(data);
        } catch (error: any) {
            setMessageBox(`Error al cargar órdenes: ${error.message}`);
            setMessageBoxType('error');
        } finally {
            setLoading(false);
        }
    }, [router]); // Añadimos router a las dependencias

    useEffect(() => {
        // Solo intenta cargar si la autenticación ha terminado y el usuario está autenticado
        if (!loadingAuth && isAuthenticated) {
            fetchOrders();
        }
    }, [fetchOrders, loadingAuth, isAuthenticated]);

    const handleStatusChange = async (orderId: string) => {
        if (!newStatus || !allowedStatuses.includes(newStatus)) {
            Swal.fire('Advertencia', 'Selecciona un estado válido.', 'warning');
            return;
        }

        setLoading(true);
        setMessageBox(null);
        try {
            const response = await fetch(`${BASE_URL}/api/orders/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include', // Importante para enviar la cookie de autenticación
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    Swal.fire('Error', 'Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.', 'error');
                    router.replace('/admin/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el estado de la orden');
            }
            setMessageBox('Estado de la orden actualizado exitosamente.');
            setMessageBoxType('success');
            setExpandedOrderId(null); // Cerrar el formulario de estado
            setNewStatus('');
            fetchOrders(); // Recargar órdenes para ver los cambios
        } catch (error: any) {
            setMessageBox(`Error: ${error.message}`);
            setMessageBoxType('error');
        } finally {
            setLoading(false);
        }
    };

    // Función para formatear la fecha de la orden
    const formatOrderDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    // Renderizado condicional para el spinner de carga inicial o si no está autenticado
    if (loadingAuth || (loading && isAuthenticated)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-gray-700 text-lg">Cargando órdenes...</p>
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
                <h2 className="text-4xl font-bold text-gray-800 mb-6">Gestión de Órdenes</h2>
                <MessageBox message={messageBox} type={messageBoxType} onClose={() => setMessageBox(null)} />

                {orders.length === 0 ? (
                    <p className="text-gray-600">No hay órdenes para mostrar.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID Orden</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Cliente</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Estado</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Fecha</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <React.Fragment key={order.id}>
                                        <tr 
                                            className="hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                setExpandedOrderId(expandedOrderId === order.id ? null : order.id);
                                                setNewStatus(order.status); // Set current status when expanding
                                            }}
                                        >
                                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{order.id.substring(0, 8)}...</td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{order.customer_name} ({order.customer_email})</td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">${order.total_amount.toFixed(2)}</td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    order.status === 'Entregado' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                                                    order.status === 'Esperando Pago' ? 'bg-yellow-100 text-yellow-800' : 
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-900">{formatOrderDate(order.order_date)}</td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); // Evita que se expanda/colapse la fila
                                                        setExpandedOrderId(order.id); 
                                                        setNewStatus(order.status); 
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Actualizar Estado
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrderId === order.id && (
                                            <tr>
                                                <td colSpan={6} className="p-4 bg-gray-50 border-t border-gray-200">
                                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-gray-700 mb-2">Detalles de la Orden:</p>
                                                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                                <li>Dirección: {order.shipping_address}, {order.city}, {order.postal_code}, {order.country}</li>
                                                                <li>Teléfono: {order.customer_phone || 'N/A'}</li>
                                                                <li>Email: {order.customer_email}</li>
                                                                <li>Indicaciones: {order.location_instructions || 'Ninguna'}</li>
                                                                <li>
                                                                    Items:
                                                                    <ul className="list-disc list-inside ml-4 mt-1">
                                                                        {order.items.map((item, index) => {
                                                                            let displayColor: { name: string; hex: string; } | null = null;
                                                                            // Intenta parsear selected_color si es una cadena
                                                                            if (typeof item.selected_color === 'string') {
                                                                                try {
                                                                                    displayColor = JSON.parse(item.selected_color);
                                                                                } catch (e) {
                                                                                    console.error('Error parsing selected_color string:', item.selected_color, e);
                                                                                    // Mantener como null si falla el parseo
                                                                                }
                                                                            } else if (item.selected_color && typeof item.selected_color === 'object') {
                                                                                displayColor = item.selected_color;
                                                                            }

                                                                            const hasValidColor = displayColor && displayColor.name && displayColor.hex;

                                                                            return (
                                                                                <li key={index} className="mb-1">
                                                                                    {item.product_name} (x{item.quantity}) - ${item.price_at_purchase.toFixed(2)} c/u
                                                                                    {hasValidColor ? (
                                                                                        <span className="ml-2 inline-flex items-center text-xs text-gray-500">
                                                                                            Color: {displayColor!.name} {/* Aserción no nula */}
                                                                                            <span 
                                                                                                className="w-4 h-4 rounded-full border border-gray-300 ml-1" 
                                                                                                style={{ backgroundColor: displayColor!.hex }} /* Aserción no nula */
                                                                                                title={displayColor!.name} /* Aserción no nula */
                                                                                            ></span>
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="ml-2 inline-flex items-center text-xs text-gray-500">
                                                                                            Color: Sin especificar
                                                                                        </span>
                                                                                    )}
                                                                                </li>
                                                                            );
                                                                        })}
                                                                    </ul>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                        <div className="flex-shrink-0 w-full md:w-auto">
                                                            <label htmlFor={`status-select-${order.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                                                                Cambiar Estado:
                                                            </label>
                                                            <select
                                                                id={`status-select-${order.id}`}
                                                                value={newStatus}
                                                                onChange={(e) => setNewStatus(e.target.value)}
                                                                className="mt-1 block w-full md:w-auto border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                            >
                                                                {allowedStatuses.map(status => (
                                                                    <option key={status} value={status}>{status}</option>
                                                                ))}
                                                            </select>
                                                            <div className="flex mt-3 space-x-2">
                                                                <button
                                                                    onClick={() => handleStatusChange(order.id)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm text-sm transition duration-150 ease-in-out"
                                                                    disabled={loading}
                                                                >
                                                                    Guardar
                                                                </button>
                                                                <button
                                                                    type="button" 
                                                                    onClick={() => setExpandedOrderId(null)}
                                                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-sm text-sm transition duration-150 ease-in-out"
                                                                    disabled={loading}
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
